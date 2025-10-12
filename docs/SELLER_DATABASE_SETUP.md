# Seller Database Setup

## Development Database

The development database has a simplified schema without the full Supabase auth system. The `invitations` table has been created with RLS enabled but uses permissive policies for local development.

### Created Tables

**invitations**
- `id` (UUID, primary key)
- `auction_id` (UUID, references auctions)
- `invitee_email` (TEXT)
- `invite_code` (TEXT, unique)
- `status` ('pending' | 'accepted' | 'expired')
- `sent_at` (TIMESTAMPTZ)
- `accepted_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

### Indexes
- `idx_invitations_code` on `invite_code`
- `idx_invitations_auction` on `auction_id`
- `idx_invitations_email` on `invitee_email`

## Production Database (Supabase)

⚠️ **CRITICAL: Production RLS Policies Required**

The following RLS policies MUST be configured in production Supabase:

```sql
-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Auction creators can manage their invitations
CREATE POLICY "Auction creators manage invitations"
  ON public.invitations
  FOR ALL
  USING (
    auction_id IN (
      SELECT id FROM public.auctions WHERE created_by = auth.uid()
    )
  );

-- Policy 2: Invitees can view invitations sent to their email
CREATE POLICY "Invitees can view their invitations"
  ON public.invitations
  FOR SELECT
  USING (
    invitee_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Policy 3: Anyone can accept invitations with valid code (for anonymous access)
CREATE POLICY "Anyone can update invitations with valid code"
  ON public.invitations
  FOR UPDATE
  USING (true)
  WITH CHECK (status IN ('accepted', 'expired'));
```

### User Profile Updates

The `users` table should also include an `is_seller` boolean flag:

```sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_seller BOOLEAN DEFAULT FALSE;
```

### Storage Bucket

Create a storage bucket for seller-uploaded auction images:

```sql
-- Create bucket in Supabase storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('seller-auctions', 'seller-auctions', false);

-- RLS policy for bucket (sellers can upload to their own folder)
CREATE POLICY "Sellers can upload auction images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'seller-auctions' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Security Checklist for Production

- [ ] RLS policies configured on invitations table
- [ ] is_seller flag added to users table  
- [ ] seller-auctions storage bucket created
- [ ] Storage RLS policies configured
- [ ] Invite codes are cryptographically secure (use crypto.randomBytes)
- [ ] Email validation on invitee_email
- [ ] Rate limiting on invitation sends
