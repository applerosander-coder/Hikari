-- DATABASE MIGRATION: Restructure Auctions to Support Multiple Items
-- This migration creates a new structure where auctions are containers
-- and items are grouped under them.

-- ===================================================================
-- STEP 1: Create the new auction_items table
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.auction_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  starting_price INTEGER NOT NULL, -- in cents
  current_bid INTEGER,
  reserve_price INTEGER,
  image_url TEXT,
  image_urls TEXT[],
  position INTEGER DEFAULT 0, -- order of items within auction
  winner_id UUID REFERENCES public.users(id),
  payment_completed BOOLEAN DEFAULT FALSE,
  payment_intent_id TEXT,
  payment_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- STEP 2: Add new fields to auctions table (name, place)
-- ===================================================================

ALTER TABLE public.auctions 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS place TEXT;

-- ===================================================================
-- STEP 3: Update bids to reference auction_items instead of auctions
-- ===================================================================

-- First, add the new column
ALTER TABLE public.bids 
  ADD COLUMN IF NOT EXISTS auction_item_id UUID REFERENCES public.auction_items(id) ON DELETE CASCADE;

-- Note: The old auction_id column will be deprecated but kept for backward compatibility
-- New bids should use auction_item_id

-- ===================================================================
-- STEP 4: Create indexes for performance
-- ===================================================================

CREATE INDEX IF NOT EXISTS idx_auction_items_auction_id ON public.auction_items(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_items_winner ON public.auction_items(winner_id);
CREATE INDEX IF NOT EXISTS idx_bids_auction_item_id ON public.bids(auction_item_id);

-- ===================================================================
-- STEP 5: Enable RLS on auction_items
-- ===================================================================

ALTER TABLE public.auction_items ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view active auction items
CREATE POLICY "Anyone can view active auction items"
  ON public.auction_items
  FOR SELECT
  USING (
    auction_id IN (
      SELECT id FROM public.auctions 
      WHERE status IN ('active', 'upcoming', 'ended')
    )
  );

-- Policy 2: Auction creators can manage their items
CREATE POLICY "Auction creators can manage items"
  ON public.auction_items
  FOR ALL
  USING (
    auction_id IN (
      SELECT id FROM public.auctions WHERE created_by = auth.uid()
    )
  );

-- Policy 3: Winners can view their won items
CREATE POLICY "Winners can view their won items"
  ON public.auction_items
  FOR SELECT
  USING (winner_id = auth.uid());

-- ===================================================================
-- STEP 6: Update existing auctions (if needed)
-- ===================================================================

-- Option A: Migrate existing auctions to have a name (copy from title)
UPDATE public.auctions 
SET name = title 
WHERE name IS NULL;

-- Option B: Set a default place for existing auctions
UPDATE public.auctions 
SET place = 'Online' 
WHERE place IS NULL;

-- ===================================================================
-- STEP 7: Create function to automatically update updated_at
-- ===================================================================

CREATE OR REPLACE FUNCTION update_auction_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auction_items_updated_at
  BEFORE UPDATE ON public.auction_items
  FOR EACH ROW
  EXECUTE FUNCTION update_auction_items_updated_at();

-- ===================================================================
-- NOTES FOR IMPLEMENTATION:
-- ===================================================================

-- 1. This migration keeps the old structure intact for backward compatibility
-- 2. New auctions should:
--    - Have 'name' and 'place' fields populated
--    - Create items in the auction_items table
-- 3. New bids should use auction_item_id instead of auction_id
-- 4. The UI needs to be updated to handle the new structure
-- 5. Consider creating a migration script to move existing auction data
--    to the new structure if you have production data to preserve
