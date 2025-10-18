# Security Note: RLS Bypass in Current Implementation

## Critical Finding

The current hybrid implementation (PostgreSQL pool + Supabase auth) **bypasses Row Level Security (RLS) policies**.

### Why RLS is Bypassed

```typescript
pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});
```

This connects as the **service role** (postgres superuser), which bypasses all RLS policies.

### Current Security Model

The application is currently safe because:
1. ✅ Supabase validates authentication
2. ✅ Every query manually filters by `user.id`
3. ✅ Parameterized queries prevent SQL injection
4. ❌ BUT: RLS policies are not enforced

### Risk Assessment

**Latent Risk**: If a developer forgets to add `WHERE user_id = $1` in a future query, the RLS policies won't catch it.

**Current Mitigation**: Manual review and testing of all queries.

## Proper Solutions

### Option 1: Supabase Migrations (Recommended)

Create messages and connects tables via Supabase migrations:

```bash
# 1. Create migration files
supabase migration new create_messages_table
supabase migration new create_connects_table

# 2. Apply migrations
supabase db push

# 3. Refactor code to use Supabase client
# RLS will automatically be enforced
```

**Pros:**
- RLS enforced at database level
- PostgREST schema cache automatically updated
- Leverages Supabase features (real-time, etc.)
- True defense-in-depth security

**Cons:**
- Requires migration effort
- Potential brief downtime during deployment

### Option 2: Set PostgreSQL Session Role

Configure the pool to run queries as the authenticated role:

```typescript
pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

// Before each query:
await pool.query(`SET ROLE authenticated`);
await pool.query(`SET request.jwt.claims = '{"sub": "${user.id}"}'`);

// Execute query - RLS now enforced
await pool.query('SELECT * FROM messages WHERE ...');
```

**Pros:**
- RLS enforced without migrations
- Keeps current query structure

**Cons:**
- Complex to implement correctly
- Session state management overhead
- Non-standard Supabase usage

### Option 3: Service Layer Authorization (Current)

Keep PostgreSQL pool but enforce authorization in application code:

```typescript
// Every query explicitly filters by user
await pool.query(
  'SELECT * FROM messages WHERE (sender_id = $1 OR receiver_id = $1)',
  [user.id]
);
```

**Pros:**
- Already implemented
- Works immediately

**Cons:**
- No defense-in-depth
- Manual security enforcement
- Risk of developer error

## Recommendation

**Short-term (Current)**: Continue with Option 3, with strict code review requirements.

**Medium-term (Next Sprint)**: Implement Option 1 - migrate to Supabase schema.

## Implementation Plan for Option 1

### Step 1: Create Supabase Migration

```sql
-- migrations/20241018_create_messages_connects.sql

-- Messages table (already exists, but recreate via migration)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Connects table (already exists, but recreate via migration)
CREATE TABLE IF NOT EXISTS public.connects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view own messages"
  ON public.messages
  FOR SELECT
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can insert as sender"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
  );

CREATE POLICY "Receivers can update read_at"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- RLS Policies for connects
CREATE POLICY "Users can view own connections"
  ON public.connects
  FOR SELECT
  USING (
    auth.uid() = user_id OR auth.uid() = connected_user_id
  );

CREATE POLICY "Users can create connections as themselves"
  ON public.connects
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their connections"
  ON public.connects
  FOR UPDATE
  USING (
    auth.uid() = user_id OR auth.uid() = connected_user_id
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread 
  ON public.messages(receiver_id) 
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_conversation 
  ON public.messages(sender_id, receiver_id, created_at);

CREATE INDEX IF NOT EXISTS idx_connects_user 
  ON public.connects(user_id, status);

CREATE INDEX IF NOT EXISTS idx_connects_connected_user 
  ON public.connects(connected_user_id, status);
```

### Step 2: Data Migration

If tables already exist with data:

```sql
-- Backup existing data
CREATE TABLE messages_backup AS SELECT * FROM messages;
CREATE TABLE connects_backup AS SELECT * FROM connects;

-- Drop and recreate via Supabase
DROP TABLE messages CASCADE;
DROP TABLE connects CASCADE;

-- Run migration (creates tables with RLS)
-- Then restore data
INSERT INTO messages SELECT * FROM messages_backup;
INSERT INTO connects SELECT * FROM connects_backup;
```

### Step 3: Refactor API Routes

```typescript
// app/api/messages/send/route.ts
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { receiver_id, content } = await request.json();

  // Verify connection - now uses Supabase
  const { data: connection } = await supabase
    .from('connects')
    .select('status')
    .or(`and(user_id.eq.${user.id},connected_user_id.eq.${receiver_id}),and(user_id.eq.${receiver_id},connected_user_id.eq.${user.id})`)
    .eq('status', 'accepted')
    .maybeSingle();

  if (!connection) {
    return NextResponse.json(
      { error: 'You can only message connected users' },
      { status: 403 }
    );
  }

  // Insert message - RLS enforces sender_id = auth.uid()
  const { data: message, error } = await supabase
    .from('messages')
    .insert({ sender_id: user.id, receiver_id, content })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message });
}
```

### Step 4: Verify RLS Enforcement

Test that RLS blocks unauthorized access:

```sql
-- As User A, try to read User B's messages (should fail)
SELECT * FROM messages 
WHERE sender_id = '<user-b-id>' 
  AND receiver_id = '<user-c-id>';
-- Expected: Returns 0 rows (RLS blocks)

-- As User A, try to insert as User B (should fail)
INSERT INTO messages (sender_id, receiver_id, content)
VALUES ('<user-b-id>', '<user-c-id>', 'Fake');
-- Expected: RLS violation error
```

## Current Status

- **Implementation**: Option 3 (Manual Authorization)
- **Security**: Functionally safe, but no RLS enforcement
- **Next Step**: Schedule Option 1 (Supabase Migrations) for next sprint

## Code Review Requirements

Until Option 1 is implemented, all messaging-related code changes MUST:

1. ✅ Explicitly filter by authenticated user.id
2. ✅ Use parameterized queries ($1, $2, etc.)
3. ✅ Include security review in PR
4. ✅ Add integration test for authorization
5. ✅ Document any new queries in this file

## Testing Checklist

- [ ] User can only view their own messages
- [ ] User cannot send messages as another user
- [ ] User cannot mark others' messages as read
- [ ] User cannot view connections they're not part of
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are sanitized

## Conclusion

The current implementation is safe but relies on manual security enforcement. Migrating to Supabase schema (Option 1) will provide true defense-in-depth through RLS policies enforced at the database level.

**Target Date for Option 1**: Next sprint (2-3 days effort)
