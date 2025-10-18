# Apply Connections Table Migration

## Overview

This guide explains how to apply the new `connections` table migration to your Supabase database. The migration creates a simpler, RLS-enabled table to replace the old `connects` table.

## Migration File

Location: `supabase/migrations/20251018150802_create_connections_table.sql`

## What This Migration Does

1. **Creates `public.connections` table** with:
   - `user_id` (UUID, references auth.users)
   - `peer_id` (UUID, references auth.users)
   - `created_at` (timestamp)
   - Bidirectional uniqueness constraint
   - Self-connection prevention

2. **Enables Row Level Security (RLS)** with policies:
   - Users can view connections they're part of
   - Users can create/update/delete their own connections
   - All operations verified at database level

3. **Creates indexes** for optimal query performance

4. **Notifies PostgREST** to reload schema cache

## Option 1: Apply via Supabase SQL Editor (Recommended)

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Copy Migration SQL
1. Open `supabase/migrations/20251018150802_create_connections_table.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor

### Step 3: Run Migration
1. Click "Run" button
2. Wait for confirmation message
3. Verify in Table Editor that `connections` table exists

### Step 4: Migrate Existing Data (if needed)
If you have existing `connects` data with `status='accepted'`:

```sql
-- Insert existing accepted connections into new table
INSERT INTO connections (user_id, peer_id, created_at)
SELECT 
  CASE 
    WHEN user_id < connected_user_id THEN user_id 
    ELSE connected_user_id 
  END as user_id,
  CASE 
    WHEN user_id < connected_user_id THEN connected_user_id 
    ELSE user_id 
  END as peer_id,
  created_at
FROM connects
WHERE status = 'accepted'
ON CONFLICT DO NOTHING;
```

This ensures only one row per connection pair (normalized order).

## Option 2: Apply via Supabase CLI

### Prerequisites
- Supabase CLI installed
- Project linked to Replit

### Step 1: Link Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 2: Push Migration
```bash
supabase db push
```

This automatically applies all migrations in `supabase/migrations/`.

## Verification

### 1. Check Table Exists
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'connections';
```

### 2. Verify RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'connections';
```

Expected: `rowsecurity = true`

### 3. Check Policies
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'connections';
```

Expected: 4 policies (read, insert, update, delete)

### 4. Test Connection Creation
```sql
-- As authenticated user, try to create a connection
INSERT INTO connections (user_id, peer_id)
VALUES (auth.uid(), '<some-other-user-id>');
```

Should succeed if user is authenticated.

### 5. Test RLS Enforcement
```sql
-- Try to view all connections (should only see your own)
SELECT * FROM connections;
```

Should only return connections where you are `user_id` OR `peer_id`.

## Code Changes Already Made

The following files have been updated to use the new `connections` table:

1. **API Routes:**
   - `app/api/connect/route.ts` - Uses Supabase client
   - `app/api/connect/respond/route.ts` - Uses Supabase client
   - `app/api/messages/send/route.ts` - Checks connections via Supabase

2. **Pages:**
   - `app/(dashboard)/connections/page.tsx` - Uses Supabase client
   - `app/(dashboard)/chat/[userId]/page.tsx` - Uses Supabase client

3. **Types:**
   - `types/db.ts` - Added `connections` and `user_preferences` types

## Architecture Changes

### Old Design (`connects` table)
- Fields: `user_id`, `connected_user_id`, `status`
- Status values: `pending`, `accepted`, `rejected`
- PostgreSQL pool queries (bypassed RLS)
- Schema cache issues

### New Design (`connections` table)
- Fields: `user_id`, `peer_id`
- No status field (existence = accepted)
- Supabase client queries (enforces RLS)
- PostgREST schema cache aware
- Bidirectional uniqueness

### Workflow Changes

**Connection Requests:**
- Old: Create row with `status='pending'`
- New: Create notification, no connection row until accepted

**Accept Request:**
- Old: Update `status='accepted'`, create reciprocal row
- New: Create single connection row (normalized order)

**Check Connection:**
- Old: Query for `status='accepted'` in either direction
- New: Query for row existence in either direction

## Benefits of New Design

1. **True RLS Enforcement**
   - Security enforced at database level
   - Defense-in-depth architecture
   - Impossible to bypass via application code

2. **Supabase Integration**
   - PostgREST recognizes table
   - Real-time subscriptions possible
   - Consistent with other tables

3. **Simpler Schema**
   - No status field management
   - Bidirectional uniqueness built-in
   - Fewer edge cases

4. **Better Performance**
   - Optimized indexes
   - Direct Supabase queries
   - No pool connection overhead

## Rollback Plan

If issues arise, you can rollback by:

1. **Keep old `connects` table** (don't drop it yet)
2. **Revert code changes** via git:
   ```bash
   git revert <commit-hash>
   ```
3. **Drop new table** if needed:
   ```sql
   DROP TABLE IF EXISTS public.connections CASCADE;
   ```

## Next Steps

1. ✅ Apply migration via Supabase SQL Editor or CLI
2. ✅ Verify RLS policies are active
3. ✅ Test connection workflow (request → accept → message)
4. ✅ Monitor for errors in application logs
5. ✅ Once stable, drop old `connects` table:
   ```sql
   DROP TABLE IF EXISTS public.connects CASCADE;
   ```

## Troubleshooting

### Error: "table already exists"
The migration has `IF NOT EXISTS` clauses, so this shouldn't happen. If it does:
```sql
-- Check existing table
SELECT * FROM connections LIMIT 1;
```

### Error: "RLS policy already exists"
Remove existing policies first:
```sql
DROP POLICY IF EXISTS connections_read ON public.connections;
DROP POLICY IF EXISTS connections_insert ON public.connections;
DROP POLICY IF EXISTS connections_update ON public.connections;
DROP POLICY IF EXISTS connections_delete ON public.connections;
```

Then re-run migration.

### Error: "could not find table in schema cache"
Run the notify command manually:
```sql
NOTIFY pgrst, 'reload schema';
```

Or restart your Replit app.

## Status

- ✅ Migration file created
- ✅ Code refactored
- ✅ Types updated
- ⏳ Migration applied to database
- ⏳ Verified in production
- ⏳ Old table dropped

## Support

If you encounter issues:
1. Check Supabase logs for RLS violations
2. Verify auth.uid() returns correct user ID
3. Test policies with manual SQL queries
4. Check application logs for error messages
