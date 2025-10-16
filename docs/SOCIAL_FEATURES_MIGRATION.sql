-- =========================================
-- BIDWIN SOCIAL FEATURES DATABASE MIGRATION
-- =========================================
-- This script adds notifications, messages, and user connections (follows) to BIDWIN
-- Run this in your Supabase SQL Editor

-- 1. CREATE FOLLOWS TABLE (User Connections)
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id TEXT NOT NULL,  -- User who is following
  following_id TEXT NOT NULL,  -- User being followed
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- 2. CREATE NOTIFICATIONS TABLE
-- Types: 'outbid', 'auction_ended', 'follow_request', 'follow_accepted', 'message'
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,  -- Recipient of the notification
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
  from_user_id TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_status ON public.follows(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_from_user ON public.messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON public.messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
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

-- Users can update follows where they are involved
CREATE POLICY "Users can update their follows" 
  ON public.follows FOR UPDATE 
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Users can delete their own follow requests
CREATE POLICY "Users can delete their follow requests" 
  ON public.follows FOR DELETE 
  USING (auth.uid() = follower_id);

-- NOTIFICATIONS POLICIES
-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

-- System can insert notifications (for auction events)
CREATE POLICY "Anyone can insert notifications" 
  ON public.notifications FOR INSERT 
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications FOR DELETE 
  USING (auth.uid() = user_id);

-- MESSAGES POLICIES
-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages" 
  ON public.messages FOR SELECT 
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Users can send messages
CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = from_user_id);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages" 
  ON public.messages FOR UPDATE 
  USING (auth.uid() = to_user_id);

-- Users can delete messages they sent or received
CREATE POLICY "Users can delete their messages" 
  ON public.messages FOR DELETE 
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- 7. CREATE FUNCTION TO AUTO-CREATE OUTBID NOTIFICATIONS
CREATE OR REPLACE FUNCTION create_outbid_notification()
RETURNS TRIGGER AS $$
DECLARE
  previous_bidder_id TEXT;
  auction_item_title TEXT;
BEGIN
  -- Get the previous highest bidder (if exists and not the current bidder)
  SELECT b.user_id INTO previous_bidder_id
  FROM bids b
  WHERE b.auction_item_id = NEW.auction_item_id
    AND b.user_id != NEW.user_id
    AND b.bid_amount < NEW.bid_amount
  ORDER BY b.bid_amount DESC, b.created_at DESC
  LIMIT 1;

  -- Get the auction item title
  SELECT title INTO auction_item_title
  FROM auction_items
  WHERE id = NEW.auction_item_id;

  -- If there was a previous bidder, notify them
  IF previous_bidder_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      previous_bidder_id,
      'outbid',
      'You''ve been outbid!',
      'Someone placed a higher bid on "' || auction_item_title || '"',
      jsonb_build_object(
        'auction_item_id', NEW.auction_item_id,
        'new_bid_amount', NEW.bid_amount
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. CREATE TRIGGER FOR OUTBID NOTIFICATIONS
DROP TRIGGER IF EXISTS trigger_outbid_notification ON bids;
CREATE TRIGGER trigger_outbid_notification
  AFTER INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION create_outbid_notification();

-- Migration complete!
-- Remember to regenerate TypeScript types from Supabase Dashboard
