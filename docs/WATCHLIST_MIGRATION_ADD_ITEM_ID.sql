-- ===================================================================
-- WATCHLIST TABLE UPDATE - Add auction_item_id column
-- ===================================================================
-- This migration adds support for tracking individual auction items
-- in the watchlist instead of entire auctions.
--
-- Run this after the main auction_items migration.
-- ===================================================================

-- STEP 1: Add auction_item_id column to watchlist table
ALTER TABLE public.watchlist
ADD COLUMN IF NOT EXISTS auction_item_id uuid REFERENCES public.auction_items(id) ON DELETE CASCADE;

-- STEP 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_watchlist_auction_item_id 
ON public.watchlist(auction_item_id);

-- STEP 3: Update RLS policies to include auction_item_id
-- (Existing policies should continue to work, but we add auction_item_id support)

-- Note: The watchlist table will now support BOTH:
-- - auction_id (legacy, for backward compatibility)
-- - auction_item_id (new, for individual items)
--
-- Queries should filter by auction_item_id for the new structure.
