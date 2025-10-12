-- ===================================================================
-- FIX LIVE AUCTIONS - Corrected version without category column
-- ===================================================================
-- This script makes auctions active NOW and creates all items
-- Run this in Supabase SQL Editor
-- ===================================================================

-- STEP 1: Update auctions to be ACTIVE starting NOW
UPDATE public.auctions
SET 
  status = 'active',
  start_date = NOW() - INTERVAL '1 hour',  -- Started 1 hour ago
  end_date = NOW() + INTERVAL '5 hours'     -- Ends in 5 hours
WHERE name IN ('Estate Sale - Vintage Collectibles', 'Art Gallery Closing Sale');

-- STEP 2: Re-create all auction items (no category column)
DO $$
DECLARE
  auction1_id uuid;
  auction2_id uuid;
BEGIN
  -- Get auction IDs
  SELECT id INTO auction1_id FROM public.auctions WHERE name = 'Estate Sale - Vintage Collectibles';
  SELECT id INTO auction2_id FROM public.auctions WHERE name = 'Art Gallery Closing Sale';

  -- Delete existing items (avoid duplicates)
  DELETE FROM public.auction_items WHERE auction_id IN (auction1_id, auction2_id);

  -- Insert Auction 1 Items (Estate Sale - 10 items)
  IF auction1_id IS NOT NULL THEN
    INSERT INTO public.auction_items (auction_id, title, description, starting_price, image_url, position) VALUES
    (auction1_id, 'Vintage Rolex Watch', 'Authentic 1960s Rolex Submariner in excellent condition', 500000, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400', 1),
    (auction1_id, 'Rare Baseball Card Collection', 'Complete set of 1952 Topps baseball cards including Mickey Mantle', 750000, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400', 2),
    (auction1_id, 'Antique Grandfather Clock', '19th century mahogany grandfather clock, fully functional', 350000, 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400', 3),
    (auction1_id, 'Original Oil Painting', 'Early 20th century landscape oil painting, signed', 450000, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400', 4),
    (auction1_id, 'Vintage Vinyl Record Set', 'Complete Beatles vinyl collection, mint condition', 125000, 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400', 5),
    (auction1_id, 'Antique Dining Table', 'Victorian era oak dining table with 6 chairs', 280000, 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400', 6),
    (auction1_id, 'Rare Stamp Collection', 'International stamp collection from 1880-1950', 180000, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400', 7),
    (auction1_id, 'Vintage Camera', 'Leica M3 35mm rangefinder camera with original case', 220000, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400', 8),
    (auction1_id, 'Antique Persian Rug', 'Hand-woven Persian rug, 8x10 feet, excellent condition', 400000, 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400', 9),
    (auction1_id, 'Classic Fountain Pen Set', 'Mont Blanc vintage fountain pen collection', 95000, 'https://images.unsplash.com/photo-1606816219980-4f2ff6d83ec6?w=400', 10);
  END IF;

  -- Insert Auction 2 Items (Art Gallery - 10 items)
  IF auction2_id IS NOT NULL THEN
    INSERT INTO public.auction_items (auction_id, title, description, starting_price, image_url, position) VALUES
    (auction2_id, 'Modern Abstract Sculpture', 'Contemporary bronze sculpture by emerging artist', 580000, 'https://images.unsplash.com/photo-1576020799627-aeac74d58064?w=400', 1),
    (auction2_id, 'Limited Edition Print', 'Signed and numbered lithograph by renowned artist', 320000, 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400', 2),
    (auction2_id, 'Designer Handbag', 'Hermès Birkin bag, unused with authenticity certificate', 850000, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', 3),
    (auction2_id, 'Gaming Console Bundle', 'PlayStation 5 with 10 games and accessories', 75000, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400', 4),
    (auction2_id, 'Luxury Watch', 'Patek Philippe Calatrava, rose gold', 1200000, 'https://images.unsplash.com/photo-1587836374895-19c7a1c36c7b?w=400', 5),
    (auction2_id, 'Professional Camera Kit', 'Canon EOS R5 with lenses and accessories', 480000, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400', 6),
    (auction2_id, 'Vintage Motorcycle', '1969 Triumph Bonneville, fully restored', 950000, 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=400', 7),
    (auction2_id, 'Smart Home System', 'Complete home automation system, new in box', 180000, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400', 8),
    (auction2_id, 'Designer Furniture Set', 'Mid-century modern living room set', 420000, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', 9),
    (auction2_id, 'Premium Golf Clubs', 'Titleist Pro V1 golf club set with bag', 225000, 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400', 10);
  END IF;

  RAISE NOTICE 'Successfully created items for auction 1: %', auction1_id;
  RAISE NOTICE 'Successfully created items for auction 2: %', auction2_id;
END $$;

-- STEP 3: Verify everything is set up correctly
SELECT 
  a.id,
  a.name,
  a.place,
  a.status,
  a.start_date AT TIME ZONE 'UTC' as start_date_utc,
  a.end_date AT TIME ZONE 'UTC' as end_date_utc,
  COUNT(ai.id) as item_count
FROM public.auctions a
LEFT JOIN public.auction_items ai ON a.id = ai.auction_id
WHERE a.name IN ('Estate Sale - Vintage Collectibles', 'Art Gallery Closing Sale')
GROUP BY a.id, a.name, a.place, a.status, a.start_date, a.end_date
ORDER BY a.created_at;

-- STEP 4: Show first few items from each auction
SELECT 
  ai.id,
  ai.title,
  ai.starting_price / 100.0 as price_dollars,
  ai.position,
  a.name as auction_name
FROM public.auction_items ai
JOIN public.auctions a ON ai.auction_id = a.id
WHERE a.name IN ('Estate Sale - Vintage Collectibles', 'Art Gallery Closing Sale')
ORDER BY a.name, ai.position
LIMIT 10;
