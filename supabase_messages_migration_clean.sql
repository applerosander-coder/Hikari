-- Messages Table Migration (CLEAN VERSION)
-- This will drop and recreate the messages table from scratch
-- Run this in Supabase SQL Editor

-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update only their sent messages" ON public.messages;

-- Drop the trigger and function
DROP TRIGGER IF EXISTS messages_updated_at ON public.messages;
DROP FUNCTION IF EXISTS update_messages_updated_at();
DROP FUNCTION IF EXISTS mark_messages_read(uuid, uuid);

-- Drop the table completely
DROP TABLE IF EXISTS public.messages CASCADE;

-- Create messages table fresh
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see messages they sent or received
CREATE POLICY "Users can view their own messages"
  ON public.messages
  FOR SELECT
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update only their sent messages"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = sender_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();

-- Grant permissions
GRANT ALL ON public.messages TO authenticated;
GRANT SELECT ON public.messages TO anon;

-- RPC Function to mark messages as read (server-side only)
CREATE OR REPLACE FUNCTION mark_messages_read(p_sender_id uuid, p_receiver_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the caller is the receiver
  IF auth.uid() != p_receiver_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only mark your own received messages as read';
  END IF;

  -- Update only the read status
  UPDATE public.messages
  SET read = true, updated_at = now()
  WHERE sender_id = p_sender_id
    AND receiver_id = p_receiver_id
    AND read = false;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_messages_read(uuid, uuid) TO authenticated;
