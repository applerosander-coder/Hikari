-- Create connects table for user connections
CREATE TABLE IF NOT EXISTS public.connects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connected_user_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id),
  CHECK (user_id != connected_user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_connects_user_id ON public.connects(user_id);
CREATE INDEX IF NOT EXISTS idx_connects_connected_user_id ON public.connects(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_connects_status ON public.connects(status);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  skip_connection_confirmation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Add comments for documentation
COMMENT ON TABLE public.connects IS 'Stores user connection relationships - only connect with people you know';
COMMENT ON TABLE public.user_preferences IS 'Stores user preferences including connection confirmation settings';
