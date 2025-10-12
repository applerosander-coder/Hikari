-- ===================================================================
-- MAKE AUCTIONS LIVE NOW - Update existing auctions to be active
-- ===================================================================
-- This script updates the existing mock auctions to be live right now
-- Run this in Supabase SQL Editor after running the main migration
-- ===================================================================

-- Update both auctions to be ACTIVE with current timestamps
UPDATE public.auctions
SET 
  status = 'active',
  start_date = NOW(),
  end_date = NOW() + INTERVAL '6 hours'
WHERE name IN ('Estate Sale - Vintage Collectibles', 'Art Gallery Closing Sale');

-- Verify the update
SELECT id, name, place, status, start_date, end_date 
FROM public.auctions 
WHERE name IN ('Estate Sale - Vintage Collectibles', 'Art Gallery Closing Sale')
ORDER BY created_at;
