-- Add auction_item_id column to payments table to support auction items
-- Run this in Supabase SQL Editor

-- 1. Add auction_item_id column (nullable for backward compatibility)
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS auction_item_id uuid REFERENCES public.auction_items(id) ON DELETE SET NULL;

-- 2. Add shipping_status column for tracking delivery status
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS shipping_status text DEFAULT 'pending';

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_payments_auction_item_id ON public.payments(auction_item_id);

-- 4. Update RLS policy to allow service role to update payments (for webhooks)
CREATE POLICY IF NOT EXISTS "Service can update payments for webhooks"
ON public.payments
FOR UPDATE
TO service_role
USING (true);

-- Done! Now payments can be linked to both auctions and auction_items
