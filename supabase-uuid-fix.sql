-- Fix for UUID type casting in bids table
-- Run this in Supabase SQL Editor

-- Create a function to insert bids with proper UUID handling
CREATE OR REPLACE FUNCTION insert_bid_with_cast(
  p_user_id TEXT,
  p_bid_amount INTEGER,
  p_auction_id TEXT DEFAULT NULL,
  p_auction_item_id TEXT DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_bid_id uuid;
BEGIN
  INSERT INTO public.bids (
    user_id,
    bid_amount,
    auction_id,
    auction_item_id
  ) VALUES (
    p_user_id::uuid,
    p_bid_amount,
    CASE WHEN p_auction_id IS NOT NULL THEN p_auction_id::uuid ELSE NULL END,
    CASE WHEN p_auction_item_id IS NOT NULL THEN p_auction_item_id::uuid ELSE NULL END
  )
  RETURNING id INTO v_bid_id;
  
  RETURN v_bid_id;
END;
$$;
