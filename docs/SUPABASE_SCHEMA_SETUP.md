# Supabase Database Schema Setup

## Critical Setup Required

The avatar library and user profile features require the `users` table to exist in your Supabase database. If you see 400 errors when trying to save your avatar, this setup hasn't been completed yet.

## Setup Instructions

### 1. Access Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### 2. Run the Schema SQL

Copy and paste the contents of `schema.sql` from this project into the SQL editor, then click **Run**.

**Alternatively, run just the essential user table setup:**

```sql
-- Create users table
create table if not exists users (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  billing_address jsonb,
  payment_method jsonb
);

-- Enable Row Level Security
alter table users enable row level security;

-- Allow users to view their own data
drop policy if exists "Can view own user data." on users;
create policy "Can view own user data." on users 
  for select using (auth.uid() = id);

-- Allow users to update their own data
drop policy if exists "Can update own user data." on users;
create policy "Can update own user data." on users 
  for update using (auth.uid() = id);

-- Create trigger to auto-create user record on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 3. Verify Setup

After running the SQL:

1. Check that the `users` table appears in **Database → Tables**
2. Sign up with a new test account
3. Go to `/dashboard/account` - you should see:
   - Your full name displayed in the input field
   - The default avatar displayed
   - Avatar selection grid with 6 options + default
4. Select a new avatar and click "Save Avatar"
5. Refresh the page - your avatar should persist

### 4. For Existing Users

If you already have users created before running this schema:

1. Their records won't automatically appear in the `users` table
2. They need to sign out and sign up again, OR
3. Manually insert records for them:

```sql
-- Create user record for existing auth users
insert into public.users (id, full_name, avatar_url)
select 
  id, 
  raw_user_meta_data->>'full_name',
  '/avatars/default-avatar.svg'
from auth.users
where id not in (select id from public.users);
```

## What This Schema Does

- **users table**: Stores user profile data (name, avatar, billing info)
- **Row Level Security (RLS)**: Users can only view/update their own data
- **handle_new_user trigger**: Automatically creates a users record when someone signs up
- **Copies metadata**: Full name and avatar from signup metadata → users table

## Troubleshooting

### Avatar won't save (400 error)
- **Cause**: users table doesn't exist or RLS policies are blocking
- **Fix**: Run the schema SQL above in Supabase SQL Editor

### Full name not showing on account page
- **Cause**: Email confirmation is enabled (no session created yet)
- **Fix**: Disable email confirmation in Supabase → Authentication → Email Templates

### Avatar shows but won't change
- **Cause**: User record exists but RLS update policy is missing
- **Fix**: Run the RLS policy SQL above

## Next Steps

Once the schema is set up:
- New users automatically get a default avatar
- Users can select from 7 avatar options on their account page
- Avatars display throughout the app (navbar, profile, etc.)
- Full names display correctly everywhere
