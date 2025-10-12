-- ===================================================================
-- COMPLETE DATABASE MIGRATION + MOCKUP DATA
-- Run this entire script in your Supabase SQL Editor
-- ===================================================================

-- ===================================================================
-- PART 1: MIGRATION - Add auction_items table and update schema
-- ===================================================================

-- STEP 1: Create the new auction_items table
CREATE TABLE IF NOT EXISTS public.auction_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  starting_price INTEGER NOT NULL,
  current_bid INTEGER,
  reserve_price INTEGER,
  image_url TEXT,
  image_urls TEXT[],
  position INTEGER DEFAULT 0,
  winner_id UUID REFERENCES public.users(id),
  payment_completed BOOLEAN DEFAULT FALSE,
  payment_intent_id TEXT,
  payment_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Add new fields to auctions table (name, place)
ALTER TABLE public.auctions 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS place TEXT;

-- STEP 3: Update bids to reference auction_items
ALTER TABLE public.bids 
  ADD COLUMN IF NOT EXISTS auction_item_id UUID REFERENCES public.auction_items(id) ON DELETE CASCADE;

-- STEP 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auction_items_auction_id ON public.auction_items(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_items_winner ON public.auction_items(winner_id);
CREATE INDEX IF NOT EXISTS idx_bids_auction_item_id ON public.bids(auction_item_id);

-- STEP 5: Enable RLS on auction_items
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

-- STEP 6: Create function to automatically update updated_at
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
-- PART 2: MOCKUP DATA - 2 Auctions with 10 Items Each
-- ===================================================================

-- First, get a user ID for created_by (replace with your actual user ID)
-- You can find your user ID by running: SELECT id FROM auth.users LIMIT 1;
-- For now, we'll use a placeholder that you'll need to replace

-- Replace 'YOUR_USER_ID_HERE' with an actual user ID from your auth.users table
-- To find it, run: SELECT id FROM auth.users LIMIT 1;

DO $$
DECLARE
  user_id UUID;
  auction1_id UUID;
  auction2_id UUID;
BEGIN
  -- Get the first user ID (replace this with your actual user ID if needed)
  SELECT id INTO user_id FROM auth.users LIMIT 1;
  
  -- If no users exist, you'll need to create one first or replace with a specific UUID
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please create a user first or specify a user UUID.';
  END IF;

  -- ===================================================================
  -- AUCTION 1: "Estate Sale - Vintage Collectibles"
  -- Starts: 1 hour from now, Ends: 3 days from now
  -- ===================================================================
  
  INSERT INTO public.auctions (
    id, name, place, title, description, 
    starting_price, category, start_date, end_date, 
    created_by, status, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Estate Sale - Vintage Collectibles',
    'Los Angeles, CA',
    'Estate Sale Container',
    'Collection of vintage items from a historic estate',
    0, -- Container doesn't have individual pricing
    'collectibles',
    NOW() + INTERVAL '1 hour',  -- Starts in 1 hour
    NOW() + INTERVAL '3 days',  -- Ends in 3 days
    user_id,
    'draft',
    NOW(),
    NOW()
  ) RETURNING id INTO auction1_id;

  -- Add 10 items to Auction 1
  INSERT INTO public.auction_items (auction_id, title, description, starting_price, reserve_price, image_url, position) VALUES
    (auction1_id, 'Vintage Rolex Submariner Watch', 'Classic 1960s Rolex Submariner in excellent condition', 500000, 750000, 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800', 1),
    (auction1_id, 'Rare 1952 Mickey Mantle Baseball Card', 'PSA 8 graded Mickey Mantle rookie card', 300000, 450000, 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800', 2),
    (auction1_id, 'Antique Persian Rug', '19th century hand-woven Persian rug, 8x10 feet', 150000, 200000, 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800', 3),
    (auction1_id, 'Signed First Edition Hemingway Novel', 'The Old Man and the Sea, signed by Ernest Hemingway', 80000, 120000, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', 4),
    (auction1_id, 'Art Deco Diamond Necklace', '1920s platinum necklace with 5 carats of diamonds', 250000, 350000, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', 5),
    (auction1_id, 'Vintage Gibson Les Paul Guitar', '1959 Sunburst Les Paul in original condition', 400000, 600000, 'https://images.unsplash.com/photo-1564186763535-ebb21d6f919f?w=800', 6),
    (auction1_id, 'Antique Grandfather Clock', 'Howard Miller mahogany grandfather clock from 1890', 120000, 180000, 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800', 7),
    (auction1_id, 'Rare Vintage Poster Collection', 'Set of 5 original 1960s concert posters', 50000, 75000, 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=800', 8),
    (auction1_id, 'Antique Japanese Samurai Sword', 'Edo period katana with authenticated provenance', 180000, 250000, 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800', 9),
    (auction1_id, 'Vintage Camera Collection', 'Leica M3 and 4 other classic film cameras', 90000, 130000, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800', 10);

  -- ===================================================================
  -- AUCTION 2: "Art Gallery Closing Sale"
  -- Starts: 6 hours from now, Ends: 5 days from now
  -- ===================================================================
  
  INSERT INTO public.auctions (
    id, name, place, title, description, 
    starting_price, category, start_date, end_date, 
    created_by, status, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Art Gallery Closing Sale',
    'New York, NY',
    'Art Gallery Container',
    'Contemporary and modern art pieces from prestigious gallery',
    0,
    'art',
    NOW() + INTERVAL '6 hours',  -- Starts in 6 hours
    NOW() + INTERVAL '5 days',   -- Ends in 5 days
    user_id,
    'draft',
    NOW(),
    NOW()
  ) RETURNING id INTO auction2_id;

  -- Add 10 items to Auction 2
  INSERT INTO public.auction_items (auction_id, title, description, starting_price, reserve_price, image_url, position) VALUES
    (auction2_id, 'Abstract Oil Painting by Local Artist', 'Large 48x36 contemporary abstract in vibrant colors', 150000, 200000, 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800', 1),
    (auction2_id, 'Bronze Sculpture "The Thinker" Replica', 'Museum-quality bronze replica, 24 inches tall', 180000, 250000, 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800', 2),
    (auction2_id, 'Vintage Mid-Century Modern Sofa', 'Restored 1960s leather sofa by Herman Miller', 220000, 300000, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', 3),
    (auction2_id, 'Limited Edition Photography Print', 'Ansel Adams "Moonrise" signed print #45/100', 120000, 175000, 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800', 4),
    (auction2_id, 'Contemporary Glass Chandelier', 'Hand-blown Murano glass chandelier', 280000, 380000, 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800', 5),
    (auction2_id, 'Rare Vintage Wine Collection', '6 bottles of 1982 Bordeaux First Growth', 350000, 500000, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800', 6),
    (auction2_id, 'Art Nouveau Stained Glass Window', 'Tiffany-style stained glass panel, 4x6 feet', 190000, 270000, 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800', 7),
    (auction2_id, 'Designer Limited Edition Sneakers', 'Nike Air Jordan 1 "Chicago" 1985 original', 80000, 120000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 8),
    (auction2_id, 'Antique Chinese Porcelain Vase', 'Qing Dynasty vase with dragon motif', 240000, 340000, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800', 9),
    (auction2_id, 'Luxury Designer Handbag', 'Hermès Birkin 35cm in rare crocodile leather', 450000, 650000, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', 10);

END $$;

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Run these to verify the data was inserted correctly:

-- Check auctions
-- SELECT id, name, place, start_date, end_date, status FROM public.auctions ORDER BY created_at DESC LIMIT 2;

-- Check auction items
-- SELECT ai.title, ai.starting_price, a.name as auction_name 
-- FROM public.auction_items ai 
-- JOIN public.auctions a ON ai.auction_id = a.id 
-- ORDER BY a.created_at DESC, ai.position;

-- ===================================================================
-- NOTES:
-- ===================================================================
-- 1. Prices are in cents (e.g., 500000 = $5,000.00)
-- 2. Both auctions start as 'draft' status
-- 3. Auto-publish cron will move them to 'active' when start_date is reached
-- 4. First auction starts in 1 hour, second starts in 6 hours
-- 5. Replace 'YOUR_USER_ID_HERE' with an actual user ID if the DO block doesn't work
