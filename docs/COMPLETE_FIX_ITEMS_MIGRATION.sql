-- COMPLETE MIGRATION FIX FOR AUCTION ITEMS SUPPORT
-- This fixes watchlist, bids, and ensures all queries work with auction items

-- Step 1: Make auction_id nullable in bids table (allows auction_item_id only)
ALTER TABLE bids ALTER COLUMN auction_id DROP NOT NULL;

-- Step 2: Make auction_id nullable in watchlist table (allows auction_item_id only)  
ALTER TABLE watchlist ALTER COLUMN auction_id DROP NOT NULL;

-- Step 3: Verify the changes
SELECT 
    table_name, 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('bids', 'watchlist') 
  AND column_name IN ('auction_id', 'auction_item_id')
ORDER BY table_name, column_name;

-- Expected results:
-- bids.auction_id: is_nullable = YES
-- bids.auction_item_id: is_nullable = YES  
-- watchlist.auction_id: is_nullable = YES
-- watchlist.auction_item_id: is_nullable = YES

-- Now both tables can store:
-- - Legacy entries with auction_id
-- - New entries with auction_item_id
-- - Entries with BOTH (for compatibility)
