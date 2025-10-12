-- Fix Watchlist Foreign Key Constraint
-- This allows watchlist entries to save either auction_id OR auction_item_id

-- Step 1: Make auction_id nullable (it was required before)
ALTER TABLE watchlist ALTER COLUMN auction_id DROP NOT NULL;

-- Step 2: Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'watchlist' AND column_name IN ('auction_id', 'auction_item_id');

-- Expected result:
-- auction_id: is_nullable = YES
-- auction_item_id: is_nullable = YES
