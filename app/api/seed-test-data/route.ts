import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  console.log('🗑️  Clearing existing data...');
  
  await supabase.from('bids').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('auction_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('auctions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('watchlist').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('✅ Data cleared');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Start tomorrow
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7); // End in 7 days

  const auction = {
    name: 'Premium Tech & Electronics Collection',
    place: 'Downtown Tech Hub',
    title: 'Premium Tech Collection',
    description: 'Curated collection of high-end electronics, vintage tech, and modern gadgets. All items tested and verified working. Perfect for collectors and enthusiasts.',
    category: 'Electronics',
    starting_price: 0,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    created_by: user.id,
    status: 'draft' as const,
  };

  console.log('📦 Creating auction: Premium Tech & Electronics Collection...');
  const { data: auctionData, error: auctionError } = await supabase
    .from('auctions')
    .insert([auction])
    .select()
    .single();

  if (auctionError) {
    console.error('❌ Error creating auction:', auctionError);
    return NextResponse.json({ error: 'Failed to create auction', details: auctionError }, { status: 500 });
  }

  console.log('✅ Auction created:', auctionData.id);

  const items = [
    {
      auction_id: auctionData.id,
      title: 'MacBook Pro 16" M3 Max',
      description: 'Brand new MacBook Pro 16" with M3 Max chip, 64GB RAM, 2TB SSD. Space Black. Still sealed in box with Apple warranty. Perfect for professionals and content creators.',
      starting_price: 350000,
      reserve_price: 400000,
      category: 'Electronics',
      position: 1,
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    },
    {
      auction_id: auctionData.id,
      title: 'Sony A7R V Camera Body',
      description: 'Professional full-frame mirrorless camera with 61MP sensor. Includes original box, charger, batteries, and 2-year warranty. Used only for 3 months. Excellent condition.',
      starting_price: 280000,
      reserve_price: 350000,
      category: 'Electronics',
      position: 2,
      image_url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
    },
    {
      auction_id: auctionData.id,
      title: 'iPad Pro 12.9" M2 1TB',
      description: 'iPad Pro 12.9" with M2 chip, 1TB storage, Space Gray. Includes Magic Keyboard, Apple Pencil 2nd Gen, and AppleCare+. Perfect for digital artists and professionals.',
      starting_price: 180000,
      reserve_price: 220000,
      category: 'Electronics',
      position: 3,
      image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    },
    {
      auction_id: auctionData.id,
      title: 'PlayStation 5 Pro Bundle',
      description: 'PS5 Pro with 2TB SSD, DualSense Edge controller, PlayStation VR2, and 10 AAA games including Spider-Man 2, God of War Ragnarok. All items mint condition.',
      starting_price: 120000,
      reserve_price: 150000,
      category: 'Electronics',
      position: 4,
      image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400',
    },
    {
      auction_id: auctionData.id,
      title: 'Bose QuietComfort Ultra Headphones',
      description: 'Top-of-the-line noise cancelling headphones. Black color with premium carrying case. Barely used, includes all original accessories and 1-year warranty remaining.',
      starting_price: 35000,
      reserve_price: 42000,
      category: 'Electronics',
      position: 5,
      image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400',
    },
    {
      auction_id: auctionData.id,
      title: 'DJI Mavic 3 Pro Cine Premium',
      description: 'Professional drone with Hasselblad camera, 1TB SSD, Fly More Kit including 3 batteries, ND filters, charging hub, and carrying case. Perfect for aerial photography.',
      starting_price: 250000,
      reserve_price: 300000,
      category: 'Electronics',
      position: 6,
      image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400',
    },
    {
      auction_id: auctionData.id,
      title: 'Apple Watch Ultra 2 Titanium',
      description: 'Premium titanium smartwatch with Ocean Band and Trail Loop. GPS + Cellular, 49mm. Perfect condition with AppleCare+ for 2 years. Ideal for athletes and adventurers.',
      starting_price: 70000,
      reserve_price: 85000,
      category: 'Electronics',
      position: 7,
      image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
    },
    {
      auction_id: auctionData.id,
      title: 'Samsung 55" OLED 4K Smart TV',
      description: 'Quantum Dot OLED display with 120Hz refresh rate. Perfect for gaming and movies. Includes wall mount and soundbar. Only 6 months old, like new condition.',
      starting_price: 140000,
      reserve_price: 180000,
      category: 'Electronics',
      position: 8,
      image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
    },
    {
      auction_id: auctionData.id,
      title: 'Mechanical Gaming Keyboard Set',
      description: 'Premium mechanical keyboard with Cherry MX switches, RGB lighting, and wireless gaming mouse. Includes custom keycaps and wrist rest. Perfect for gamers and typists.',
      starting_price: 25000,
      reserve_price: 35000,
      category: 'Electronics',
      position: 9,
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
    },
    {
      auction_id: auctionData.id,
      title: 'Vintage Stereo System',
      description: '1980s high-fidelity stereo system with turntable, receiver, and speakers. Fully restored and working perfectly. A classic piece for audiophiles and collectors.',
      starting_price: 45000,
      reserve_price: 65000,
      category: 'Electronics',
      position: 10,
      image_url: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=400',
    },
  ];

  const { data: itemsData, error: itemsError } = await supabase
    .from('auction_items')
    .insert(items)
    .select();

  if (itemsError) {
    console.error('❌ Error creating items:', itemsError);
    return NextResponse.json({ error: 'Failed to create items', details: itemsError }, { status: 500 });
  }

  console.log(`✅ Created ${itemsData.length} items for auction`);

  return NextResponse.json({
    success: true,
    message: `Test data created: ${itemsData.length} items in draft auction (editable)`,
    summary: {
      auction: {
        id: auctionData.id,
        name: auctionData.name,
        status: auctionData.status,
        itemCount: itemsData.length,
        startDate: auctionData.start_date,
        endDate: auctionData.end_date,
      },
    },
  });
}
