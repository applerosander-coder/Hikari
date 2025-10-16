-- BIDWIN SOCIAL FEATURES DATABASE MIGRATION
-- This script adds notifications, messages, and user connections (follows) to BIDWIN
-- Run this in your Supabase SQL Editor

-- DROP EXISTING TABLES IF THEY EXIST (clean slate)
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;

-- DROP EXISTING TRIGGER AND FUNCTION IF THEY EXIST
DROP TRIGGER IF EXISTS trigger_notify_outbid ON bids;
DROP FUNCTION IF EXISTS notify_outbid();

-- 1. CREATE FOLLOWS TABLE (User Connections)
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL,  -- User who is following
  following_id uuid NOT NULL,  -- User being followed
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- 2. CREATE NOTIFICATIONS TABLE
-- Types: 'outbid', 'auction_ended', 'follow_request', 'follow_accepted', 'message'
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,  -- Recipient of the notification
  type TEXT NOT NULL CHECK (type IN ('outbid', 'auction_ended', 'follow_request', 'follow_accepted', 'message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB,  -- Additional data (auction_item_id, from_user_id, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. CREATE MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_status ON public.follows(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_to_user ON public.messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_from_user ON public.messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES

-- FOLLOWS POLICIES
-- Users can only view follows where they are directly involved (follower or following)
CREATE POLICY "Users can view their own follows" 
  ON public.follows FOR SELECT 
  USING (
    auth.uid() = follower_id OR 
    auth.uid() = following_id
  );

-- Users can create follow requests
CREATE POLICY "Users can create follow requests" 
  ON public.follows FOR INSERT 
  WITH CHECK (auth.uid() = follower_id);

-- Users can update follows they are involved in (for accepting/rejecting requests)
CREATE POLICY "Users can update their follow status" 
  ON public.follows FOR UPDATE 
  USING (
    auth.uid() = follower_id OR 
    auth.uid() = following_id
  );

-- Users can delete follows they initiated
CREATE POLICY "Users can delete follows they created" 
  ON public.follows FOR DELETE 
  USING (auth.uid() = follower_id);

-- NOTIFICATIONS POLICIES
-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

-- System can create notifications for any user
CREATE POLICY "Anyone can create notifications" 
  ON public.notifications FOR INSERT 
  WITH CHECK (true);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications FOR DELETE 
  USING (auth.uid() = user_id);

-- MESSAGES POLICIES
-- Users can view messages they sent or received
CREATE POLICY "Users can view their own messages" 
  ON public.messages FOR SELECT 
  USING (
    auth.uid() = from_user_id OR 
    auth.uid() = to_user_id
  );

-- Users can send messages
CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = from_user_id);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages" 
  ON public.messages FOR UPDATE 
  USING (auth.uid() = to_user_id);

-- 7. CREATE DATABASE TRIGGER FOR AUTOMATIC OUTBID NOTIFICATIONS
-- This trigger automatically creates a notification when a user is outbid

CREATE OR REPLACE FUNCTION notify_outbid()
RETURNS TRIGGER AS $$
DECLARE
  previous_high_bidder TEXT;
  auction_item_record RECORD;
BEGIN
  -- Get the auction item details
  SELECT * INTO auction_item_record 
  FROM auction_items 
  WHERE id = NEW.auction_item_id;

  -- Find the previous high bidder (if any)
  SELECT user_id INTO previous_high_bidder
  FROM bids
  WHERE auction_item_id = NEW.auction_item_id
    AND user_id != NEW.user_id
    AND id != NEW.id
  ORDER BY amount DESC
  LIMIT 1;

  -- If there was a previous bidder, notify them
  IF previous_high_bidder IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      previous_high_bidder,
      'outbid',
      'You have been outbid!',
      'Someone placed a higher bid on ' || COALESCE(auction_item_record.title, 'an item'),
      jsonb_build_object(
        'auction_item_id', NEW.auction_item_id,
        'new_bid_amount', NEW.amount
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_notify_outbid ON bids;
CREATE TRIGGER trigger_notify_outbid
  AFTER INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION notify_outbid();

-- Migration complete!
-- Next step: Regenerate TypeScript types to include the new tables
