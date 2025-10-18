-- Create public.connections table for social graph (user ↔ user relationships)
-- This replaces the old connects table with a simpler, bidirectional design

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  peer_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, peer_id)
);

-- Prevent self-connections
alter table public.connections
  add constraint connections_no_self check (user_id <> peer_id);

-- Helpful indexes for query performance
create index if not exists ix_connections_user on public.connections (user_id);
create index if not exists ix_connections_peer on public.connections (peer_id);

-- Ensure only one row per connection pair (bidirectional uniqueness)
-- This prevents both (A,B) and (B,A) from existing
create unique index if not exists ux_connections_pair
  on public.connections (least(user_id, peer_id), greatest(user_id, peer_id));

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.connections to anon, authenticated;

-- Enable Row Level Security
alter table public.connections enable row level security;

-- RLS Policy: Users can view connections they're part of
create policy "connections_read"
  on public.connections for select
  using ( auth.uid() = user_id or auth.uid() = peer_id );

-- RLS Policy: Users can create connections where they are user_id or peer_id
create policy "connections_insert"
  on public.connections for insert
  with check ( auth.uid() = user_id or auth.uid() = peer_id );

-- RLS Policy: Users can update their connections
create policy "connections_update"
  on public.connections for update
  using ( auth.uid() = user_id or auth.uid() = peer_id )
  with check ( auth.uid() = user_id or auth.uid() = peer_id );

-- RLS Policy: Users can delete their connections
create policy "connections_delete"
  on public.connections for delete
  using ( auth.uid() = user_id or auth.uid() = peer_id );

-- Notify PostgREST to reload schema cache
notify pgrst, 'reload schema';

-- Add comment for documentation
comment on table public.connections is 'Bidirectional user connections - simplified social graph without status tracking';
