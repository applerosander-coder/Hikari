# Supabase Messages Migration Notes

## Overview

This document describes the migration of the messaging system from direct PostgreSQL pool connections to Supabase-only data layer.

## Changes Made

### 1. Database Schema Updates

**Messages Table:**
- Changed `read` (BOOLEAN) → `read_at` (TIMESTAMPTZ)
- This provides more detailed tracking of when messages were read
- Null `read_at` indicates unread messages

**SQL Migration:**
```sql
ALTER TABLE messages ADD COLUMN read_at TIMESTAMPTZ;
UPDATE messages SET read_at = created_at WHERE read = true;
ALTER TABLE messages DROP COLUMN read;
```

### 2. Row Level Security (RLS) Policies

Created comprehensive RLS policies on the `messages` table:

**SELECT Policy:**
- Users can only view messages where they are either sender or receiver
- `receiver_id = current_user_id() OR sender_id = current_user_id()`

**INSERT Policy:**
- Users can only insert messages where they are the sender
- `sender_id = current_user_id()`

**UPDATE Policy:**
- Users can only update messages where they are the receiver
- Only the `read_at` field can be updated
- `receiver_id = current_user_id()`

### 3. Helper Function

Created `current_user_id()` function to extract user ID from JWT claims:
```sql
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  );
$$;
```

### 4. Updated RPC Function

`mark_messages_read` function updated to:
- Use `read_at` timestamp instead of `read` boolean
- Include authorization check to verify caller is the receiver
- Set `read_at = NOW()` for unread messages

### 5. API Routes Refactored

**app/api/messages/send/route.ts:**
- Removed PostgreSQL pool
- Uses Supabase client for connection verification
- Uses Supabase client for message insertion
- RLS automatically enforces sender_id matches authenticated user

**app/api/messages/[userId]/route.ts:**
- Uses Supabase client for fetching messages
- Calls `mark_messages_read` RPC function
- RLS automatically filters messages to only those involving the user

**app/api/messages/unread-count/route.ts:**
- Uses Supabase client with count query
- Filters by `receiver_id` and `read_at IS NULL`
- RLS automatically enforces access control

### 6. TypeScript Types

Added to `types/db.ts`:
```typescript
connects: {
  Row: {
    id: string
    user_id: string
    connected_user_id: string
    status: string
    created_at: string
    updated_at: string
  }
  // Insert and Update types...
}

messages: {
  Row: {
    id: string
    sender_id: string
    receiver_id: string
    content: string
    read_at: string | null
    created_at: string
  }
  // Insert and Update types...
}
```

## Known Limitations

### Supabase Schema Cache

In development environments using direct PostgreSQL connections (DATABASE_URL), Supabase's PostgREST schema cache may not automatically include tables created via direct SQL.

**Solutions:**
1. Use Supabase migrations instead of direct SQL
2. Manually refresh Supabase schema cache
3. For hybrid setups, use PostgreSQL pool for complex queries and Supabase for CRUD operations

### Current Workaround

The `connections` page currently has a hybrid approach:
- Could use direct PostgreSQL for complex aggregation queries
- Or use Supabase with multiple queries and client-side aggregation

## Testing

See `tests/messages-rls.test.md` for comprehensive RLS test cases.

Key test areas:
- Users can only read their own messages
- Users cannot impersonate others when sending
- Only receivers can mark messages as read
- Cross-user access is completely blocked

## Security Benefits

1. **No SQL Injection**: Supabase client uses parameterized queries
2. **Automatic Authorization**: RLS policies enforced at database level
3. **Defense in Depth**: Even if application code is compromised, database enforces access control
4. **Audit Trail**: `read_at` provides timestamp for compliance
5. **Type Safety**: TypeScript types ensure correct data structures

## Migration Checklist

- [x] Update database schema (read → read_at)
- [x] Create RLS policies
- [x] Update mark_messages_read RPC function
- [x] Refactor send message route
- [x] Refactor fetch messages route
- [x] Refactor unread count route  
- [x] Update TypeScript types
- [x] Update UI components (ChatInterface)
- [x] Create RLS test cases
- [ ] Run integration tests
- [ ] Performance test with large message volumes
- [ ] Deploy to production

## Rollback Plan

If issues arise, rollback steps:
1. Re-add `read` column: `ALTER TABLE messages ADD COLUMN read BOOLEAN DEFAULT false;`
2. Migrate data back: `UPDATE messages SET read = (read_at IS NOT NULL);`
3. Revert API routes to use PostgreSQL pool
4. Remove RLS policies: `DROP POLICY ... ON messages;`
5. Disable RLS: `ALTER TABLE messages DISABLE ROW LEVEL SECURITY;`

## Performance Considerations

- RLS policies add minimal overhead (sub-millisecond)
- Indexes on `receiver_id` and `sender_id` ensure fast queries
- Partial index on unread messages: `CREATE INDEX ... WHERE read_at IS NULL;`
- Consider partitioning for high-volume scenarios

## Next Steps

1. Monitor error rates and query performance
2. Add real-time subscriptions for instant message delivery
3. Implement message pagination for long conversations
4. Add message encryption for enhanced privacy
5. Create admin dashboard for message moderation
