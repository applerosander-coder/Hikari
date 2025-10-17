-- Create connects table for user connections
CREATE TABLE IF NOT EXISTS public.connects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connected_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id),
  CHECK (user_id != connected_user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_connects_user_id ON public.connects(user_id);
CREATE INDEX IF NOT EXISTS idx_connects_connected_user_id ON public.connects(connected_user_id);

-- Add comment for documentation
COMMENT ON TABLE public.connects IS 'Stores user connection relationships - only connect with people you know';
