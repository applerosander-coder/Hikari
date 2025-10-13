-- Migration: Add auction_item_id support for winner processing
-- Run this in your Supabase SQL Editor

-- 1. Ensure notifications table exists with auction_item_id
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type varchar(50) NOT NULL,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  auction_id uuid REFERENCES public.auctions(id) ON DELETE SET NULL,
  auction_item_id uuid REFERENCES public.auction_items(id) ON DELETE SET NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Add auction_item_id to existing notifications table if it doesn't exist
ALTER TABLE public.notifications 
  ADD COLUMN IF NOT EXISTS auction_item_id uuid REFERENCES public.auction_items(id) ON DELETE SET NULL;

-- 3. Add auction_item_id to payments table
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS auction_item_id uuid REFERENCES public.auction_items(id) ON DELETE SET NULL;

-- 4. Update payments table columns to match expected schema
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS amount integer,
  ADD COLUMN IF NOT EXISTS metadata jsonb;

-- 5. Rename amount_cents to amount if it exists (for consistency)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'amount_cents'
  ) THEN
    ALTER TABLE public.payments RENAME COLUMN amount_cents TO amount;
  END IF;
END $$;

-- 6. Rename payment_intent_id to stripe_payment_intent_id if needed
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'payment_intent_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE public.payments RENAME COLUMN payment_intent_id TO stripe_payment_intent_id;
  END IF;
END $$;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_auction_item_id ON public.notifications(auction_item_id);
CREATE INDEX IF NOT EXISTS idx_payments_auction_item_id ON public.payments(auction_item_id);

-- 8. Enable Row Level Security on notifications if not already enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 9. Create/Update RLS policies for notifications
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
TO service_role
WITH CHECK (true);

-- 10. Create function to mark notification as read (if not exists)
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create function to get unread notification count (if not exists)
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

-- Done! Tables updated for auction items winner processing
