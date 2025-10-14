# Supabase Database Setup Instructions

## The Issue
Your auction platform code is working correctly, but the database tables (`auctions`, `auction_items`, `bids`) don't exist in your Supabase database yet. This is why:
- Dashboard items appear (they're mock data from Unsplash)
- But bids don't save or appear in MyBids

## Solution: Run SQL in Supabase

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run This SQL (Copy Everything Below)

```sql
-- PART 1: CREATE BASE AUCTION SCHEMA

-- Create auction status enum
CREATE TYPE IF NOT EXISTS auction_status AS ENUM ('draft', 'upcoming', 'active', 'ended', 'cancelled');

-- Create auctions table
CREATE TABLE IF NOT EXISTS public.auctions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  place TEXT,
  title TEXT NOT NULL,
  description TEXT,
  starting_price INTEGER NOT NULL,
  current_bid INTEGER,
  reserve_price INTEGER,
  image_url TEXT,
  image_urls TEXT[],
  category TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_by TEXT NOT NULL,
  status auction_status DEFAULT 'draft',
  winner_id TEXT,
  payment_completed BOOLEAN DEFAULT FALSE,
  payment_intent_id TEXT,
  payment_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id TEXT,
  auction_item_id TEXT,
  user_id TEXT NOT NULL,
  bid_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create auction_items table
CREATE TABLE IF NOT EXISTS public.auction_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  starting_price INTEGER NOT NULL,
  current_bid INTEGER,
  reserve_price INTEGER,
  image_url TEXT,
  image_urls TEXT[],
  position INTEGER DEFAULT 0,
  winner_id TEXT,
  payment_completed BOOLEAN DEFAULT FALSE,
  payment_intent_id TEXT,
  payment_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auctions_status ON public.auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_end_date ON public.auctions(end_date);
CREATE INDEX IF NOT EXISTS idx_auctions_created_by ON public.auctions(created_by);
CREATE INDEX IF NOT EXISTS idx_auction_items_auction_id ON public.auction_items(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_items_winner ON public.auction_items(winner_id);
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_auction_item_id ON public.bids(auction_item_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON public.bids(user_id);

-- PART 2: ENABLE ROW LEVEL SECURITY (RLS)

ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Auction policies
CREATE POLICY "Anyone can view active auctions" 
  ON public.auctions FOR SELECT 
  USING (status IN ('active', 'upcoming', 'ended'));

CREATE POLICY "Users can view their own auctions" 
  ON public.auctions FOR SELECT 
  USING (auth.uid()::text = created_by);

CREATE POLICY "Users can create auctions" 
  ON public.auctions FOR INSERT 
  WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Users can update their own auctions" 
  ON public.auctions FOR UPDATE 
  USING (auth.uid()::text = created_by);

-- Auction items policies
CREATE POLICY "Anyone can view active auction items"
  ON public.auction_items FOR SELECT
  USING (
    auction_id IN (
      SELECT id::text FROM public.auctions 
      WHERE status IN ('active', 'upcoming', 'ended')
    )
  );

CREATE POLICY "Auction creators can manage items"
  ON public.auction_items FOR ALL
  USING (
    auction_id IN (
      SELECT id::text FROM public.auctions WHERE created_by = auth.uid()::text
    )
  );

CREATE POLICY "Winners can view their won items"
  ON public.auction_items FOR SELECT
  USING (winner_id = auth.uid()::text);

-- Bid policies
CREATE POLICY "Anyone can view bids on active auctions" 
  ON public.bids FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions 
      WHERE auctions.id::text = bids.auction_id 
      AND auctions.status IN ('active', 'ended')
    )
  );

CREATE POLICY "Authenticated users can place bids" 
  ON public.bids FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- PART 3: CREATE TRIGGER TO UPDATE current_bid

-- Function to update auction_items current_bid when bid placed
CREATE OR REPLACE FUNCTION update_auction_item_current_bid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.auction_item_id IS NOT NULL THEN
    UPDATE public.auction_items
    SET current_bid = NEW.bid_amount,
        updated_at = NOW()
    WHERE id = NEW.auction_item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update current_bid when bid placed
CREATE TRIGGER on_new_bid_update_item
  AFTER INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION update_auction_item_current_bid();

-- PART 4: CREATE TEST DATA

-- Get your user ID
DO $$
DECLARE
  user_id TEXT;
  auction1_id TEXT;
  auction2_id TEXT;
  now_ts TIMESTAMPTZ := NOW();
BEGIN
  -- Get first user ID
  SELECT id::text INTO user_id FROM auth.users LIMIT 1;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please sign up first.';
  END IF;

  -- Create Auction 1
  INSERT INTO public.auctions (
    name, place, title, starting_price, category,
    start_date, end_date, created_by, status
  ) VALUES (
    'Spring Estate Sale 2025',
    'Los Angeles, CA',
    'Spring Estate Sale Container',
    0,
    'collectibles',
    now_ts,
    now_ts + INTERVAL '2 hours',
    user_id,
    'active'
  ) RETURNING id::text INTO auction1_id;

  -- Add items to Auction 1
  INSERT INTO public.auction_items (auction_id, title, description, starting_price, image_url, position) VALUES
    (auction1_id, 'Vintage Rolex Watch', 'Classic timepiece', 500000, 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400', 1),
    (auction1_id, 'Antique Persian Rug', 'Hand-woven masterpiece', 300000, 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400', 2),
    (auction1_id, 'Victorian Oil Painting', 'Beautiful floral art', 150000, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400', 3),
    (auction1_id, 'Antique Mahogany Desk', 'Elegant furniture piece', 200000, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400', 4);

  -- Create Auction 2
  INSERT INTO public.auctions (
    name, place, title, starting_price, category,
    start_date, end_date, created_by, status
  ) VALUES (
    'Vintage Electronics Auction',
    'San Francisco, CA',
    'Vintage Electronics Container',
    0,
    'electronics',
    now_ts,
    now_ts + INTERVAL '2 hours',
    user_id,
    'active'
  ) RETURNING id::text INTO auction2_id;

  -- Add items to Auction 2
  INSERT INTO public.auction_items (auction_id, title, description, starting_price, image_url, position) VALUES
    (auction2_id, 'Apple Macintosh 128K', 'Original 1984 computer', 250000, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400', 1),
    (auction2_id, 'Sony Walkman TPS-L2', 'First portable cassette player', 80000, 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=400', 2),
    (auction2_id, 'Atari 2600 Console', 'Classic gaming system', 50000, 'https://images.unsplash.com/photo-1558584673-c834fb1cc3ca?w=400', 3),
    (auction2_id, 'Vintage Polaroid SX-70', 'Instant camera icon', 40000, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400', 4),
    (auction2_id, 'Nintendo Game Boy', 'Handheld gaming legend', 30000, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400', 5);

END $$;
```

### Step 3: Verify
After running the SQL, run these verification queries:

```sql
-- Check tables exist
SELECT COUNT(*) as auction_count FROM auctions;
SELECT COUNT(*) as item_count FROM auction_items;

-- View test data
SELECT name, place, status FROM auctions;
SELECT title, starting_price FROM auction_items LIMIT 10;
```

## What This Will Fix

✅ Auctions will be stored in the database  
✅ Bids will be saved and appear in MyBids  
✅ Active/Outbid tabs will work correctly  
✅ Real-time bidding will function  

## After Running SQL

1. Refresh your dashboard at `/dashboard`
2. You'll see the 2 test auctions with 9 items
3. Place a bid on any item
4. Go to `/mybids` - your bid will appear in the Active tab!

---

**Note:** Prices are in cents (e.g., 500000 = $5,000.00)
