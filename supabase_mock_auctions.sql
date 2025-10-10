-- Mock Auction Data for BidWin Platform
-- Note: Replace 'YOUR_USER_ID_HERE' with actual user IDs from auth.users table
-- You can get user IDs by running: SELECT id FROM auth.users LIMIT 1;

-- First, let's create a placeholder user ID variable (you'll need to replace this)
-- Run this in Supabase SQL Editor AFTER logging in at least once

-- Example active auctions with varied categories
INSERT INTO auctions (
  title, 
  description, 
  starting_price, 
  current_bid,
  reserve_price,
  image_url,
  category,
  start_date,
  end_date,
  created_by,
  status
) VALUES
(
  'Professional Photography Session',
  'Get a 2-hour professional photography session with a top-rated photographer. Perfect for portraits, family photos, or special events. Includes edited digital photos.',
  5000, -- $50.00
  7500, -- $75.00
  10000, -- $100.00 reserve
  'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800',
  'Services',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '2 days',
  (SELECT id FROM auth.users LIMIT 1),
  'active'
),
(
  'Vintage Leather Messenger Bag',
  'Authentic vintage leather messenger bag in excellent condition. Perfect for professionals or students. Spacious interior with multiple compartments.',
  3000, -- $30.00
  4500, -- $45.00
  8000, -- $80.00 reserve
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
  'Fashion',
  NOW() - INTERVAL '12 hours',
  NOW() + INTERVAL '1 day',
  (SELECT id FROM auth.users LIMIT 1),
  'active'
),
(
  'Web Development Package - 5 Page Website',
  'Complete web development package including design, development, and deployment. Responsive design, SEO optimized, and modern tech stack.',
  50000, -- $500.00
  NULL, -- No bids yet
  75000, -- $750.00 reserve
  'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800',
  'Services',
  NOW() - INTERVAL '6 hours',
  NOW() + INTERVAL '3 days',
  (SELECT id FROM auth.users LIMIT 1),
  'active'
),
(
  'Apple AirPods Pro (2nd Gen)',
  'Brand new, sealed Apple AirPods Pro 2nd generation. Active noise cancellation, spatial audio, and adaptive transparency.',
  15000, -- $150.00
  18000, -- $180.00
  20000, -- $200.00 reserve
  'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800',
  'Electronics',
  NOW() - INTERVAL '2 hours',
  NOW() + INTERVAL '18 hours',
  (SELECT id FROM auth.users LIMIT 1),
  'active'
),
(
  'Personal Fitness Training - 1 Month',
  'One month of personalized fitness training with a certified personal trainer. Includes customized workout plan and nutrition guidance.',
  10000, -- $100.00
  12500, -- $125.00
  15000, -- $150.00 reserve
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
  'Services',
  NOW() - INTERVAL '4 hours',
  NOW() + INTERVAL '1 day 6 hours',
  (SELECT id FROM auth.users LIMIT 1),
  'active'
),
(
  'Designer Sunglasses - Ray-Ban Aviator',
  'Classic Ray-Ban Aviator sunglasses in gold frame with gradient lenses. Comes with original case and cleaning cloth.',
  8000, -- $80.00
  NULL, -- No bids yet
  12000, -- $120.00 reserve
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
  'Fashion',
  NOW() - INTERVAL '1 hour',
  NOW() + INTERVAL '2 days 12 hours',
  (SELECT id FROM auth.users LIMIT 1),
  'active'
),
(
  'Logo Design Package - Complete Branding',
  'Professional logo design package including 3 concepts, unlimited revisions, and final files in all formats. Brand guidelines included.',
  25000, -- $250.00
  28000, -- $280.00
  35000, -- $350.00 reserve
  'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800',
  'Services',
  NOW() - INTERVAL '8 hours',
  NOW() + INTERVAL '4 days',
  (SELECT id FROM auth.users LIMIT 1),
  'active'
),
(
  'Mechanical Keyboard - Cherry MX Blue',
  'Premium mechanical keyboard with Cherry MX Blue switches. RGB backlit, aluminum frame, and detachable USB-C cable.',
  12000, -- $120.00
  14500, -- $145.00
  18000, -- $180.00 reserve
  'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800',
  'Electronics',
  NOW() - INTERVAL '3 hours',
  NOW() + INTERVAL '1 day 18 hours',
  (SELECT id FROM auth.users LIMIT 1),
  'active'
),
(
  'Home Cleaning Service - Deep Clean',
  'Professional deep cleaning service for your home. Includes all rooms, bathrooms, kitchen, and windows. 4-6 hours of service.',
  15000, -- $150.00
  NULL, -- No bids yet
  20000, -- $200.00 reserve
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
  'Services',
  NOW(),
  NOW() + INTERVAL '3 days',
  (SELECT id FROM auth.users LIMIT 1),
  'active'
),
(
  'Wireless Noise-Cancelling Headphones',
  'Sony WH-1000XM5 wireless headphones with industry-leading noise cancellation. 30-hour battery life and premium sound quality.',
  25000, -- $250.00
  27500, -- $275.00
  30000, -- $300.00 reserve
  'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800',
  'Electronics',
  NOW() - INTERVAL '5 hours',
  NOW() + INTERVAL '2 days 6 hours',
  (SELECT id FROM auth.users LIMIT 1),
  'active'
);

-- Note: After inserting auctions, you can add sample bids with:
-- INSERT INTO bids (auction_id, user_id, bid_amount) 
-- VALUES ('auction-id-here', 'user-id-here', amount_in_cents);
