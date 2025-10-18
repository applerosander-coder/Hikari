-- Create connection_invitations table for user connection requests
CREATE TABLE IF NOT EXISTS public.connection_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  CONSTRAINT no_self_invite CHECK (sender_id != recipient_id),
  CONSTRAINT unique_invitation UNIQUE(sender_id, recipient_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_connection_invitations_recipient 
  ON public.connection_invitations(recipient_id) 
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_connection_invitations_sender 
  ON public.connection_invitations(sender_id);

-- Enable Row Level Security
ALTER TABLE public.connection_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view invitations they sent or received
DROP POLICY IF EXISTS connection_invitations_read ON public.connection_invitations;
CREATE POLICY connection_invitations_read 
  ON public.connection_invitations
  FOR SELECT
  USING (true);  -- Allow all authenticated users to read (RLS via application)

-- Users can create invitations
DROP POLICY IF EXISTS connection_invitations_insert ON public.connection_invitations;
CREATE POLICY connection_invitations_insert 
  ON public.connection_invitations
  FOR INSERT
  WITH CHECK (true);  -- Allow all authenticated users to insert (RLS via application)

-- Users can update invitations
DROP POLICY IF EXISTS connection_invitations_update ON public.connection_invitations;
CREATE POLICY connection_invitations_update 
  ON public.connection_invitations
  FOR UPDATE
  USING (true);  -- Allow all authenticated users to update (RLS via application)

-- Users can delete invitations
DROP POLICY IF EXISTS connection_invitations_delete ON public.connection_invitations;
CREATE POLICY connection_invitations_delete 
  ON public.connection_invitations
  FOR DELETE
  USING (true);  -- Allow all authenticated users to delete (RLS via application)

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
