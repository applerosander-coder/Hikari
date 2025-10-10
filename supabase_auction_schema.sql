-- Auction Status Enum
DROP TYPE IF EXISTS auction_status CASCADE;
CREATE TYPE auction_status AS ENUM ('draft', 'upcoming', 'active', 'ended', 'cancelled');

-- Auctions Table
CREATE TABLE IF NOT EXISTS auctions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  starting_price bigint NOT NULL, -- in cents
  current_bid bigint, -- in cents
  reserve_price bigint, -- minimum price to sell, in cents
  image_url text,
  image_urls text[], -- array for multiple images
  category text,
  
  -- Timing
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  
  -- Owner
  created_by uuid references auth.users NOT NULL,
  
  -- Status
  status auction_status DEFAULT 'draft',
  
  -- Winner
  winner_id uuid references auth.users,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bids Table
CREATE TABLE IF NOT EXISTS bids (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id uuid references auctions ON DELETE CASCADE NOT NULL,
  user_id uuid references auth.users NOT NULL,
  bid_amount bigint NOT NULL, -- in cents
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure user cannot outbid themselves
  UNIQUE(auction_id, user_id, bid_amount)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_end_date ON auctions(end_date);
CREATE INDEX IF NOT EXISTS idx_auctions_created_by ON auctions(created_by);
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);

-- Row Level Security
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Auction Policies
DROP POLICY IF EXISTS "Anyone can view active auctions" ON auctions;
CREATE POLICY "Anyone can view active auctions" ON auctions 
  FOR SELECT USING (status IN ('active', 'upcoming', 'ended'));

DROP POLICY IF EXISTS "Users can view their own auctions" ON auctions;
CREATE POLICY "Users can view their own auctions" ON auctions 
  FOR SELECT USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can create auctions" ON auctions;
CREATE POLICY "Users can create auctions" ON auctions 
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own auctions" ON auctions;
CREATE POLICY "Users can update their own auctions" ON auctions 
  FOR UPDATE USING (auth.uid() = created_by);

-- Bid Policies
DROP POLICY IF EXISTS "Anyone can view bids on active auctions" ON bids;
CREATE POLICY "Anyone can view bids on active auctions" ON bids 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auctions 
      WHERE auctions.id = bids.auction_id 
      AND auctions.status IN ('active', 'ended')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can place bids" ON bids;
CREATE POLICY "Authenticated users can place bids" ON bids 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update auction current_bid
CREATE OR REPLACE FUNCTION update_auction_current_bid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auctions
  SET current_bid = NEW.bid_amount,
      updated_at = NOW()
  WHERE id = NEW.auction_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update current_bid when new bid is placed
DROP TRIGGER IF EXISTS on_new_bid ON bids;
CREATE TRIGGER on_new_bid
  AFTER INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION update_auction_current_bid();

-- Function to automatically update auction status based on dates
CREATE OR REPLACE FUNCTION update_auction_status()
RETURNS void AS $$
BEGIN
  -- Update to active if start_date has passed
  UPDATE auctions
  SET status = 'active'
  WHERE status = 'upcoming'
    AND start_date <= NOW();
  
  -- Update to ended if end_date has passed
  UPDATE auctions
  SET status = 'ended'
  WHERE status = 'active'
    AND end_date <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for auctions and bids
DROP PUBLICATION IF EXISTS supabase_realtime_auctions;
CREATE PUBLICATION supabase_realtime_auctions FOR TABLE auctions, bids;
