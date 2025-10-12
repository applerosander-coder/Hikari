-- Migration: Add notifications table and payment tracking for auction winners
-- Run this in your Supabase SQL Editor

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type varchar(50) NOT NULL,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  auction_id uuid REFERENCES public.auctions(id) ON DELETE SET NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Add payment tracking fields to auctions table
ALTER TABLE public.auctions 
  ADD COLUMN IF NOT EXISTS payment_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_intent_id text,
  ADD COLUMN IF NOT EXISTS payment_completed_at timestamptz;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auctions_payment_completed ON public.auctions(payment_completed);

-- 4. Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 6. Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM public.notifications
    WHERE user_id = auth.uid() AND read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Done! Notifications table created with RLS policies
