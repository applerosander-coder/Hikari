import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearData() {
  console.log('🗑️  Clearing existing data...');
  
  await supabase.from('bids').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('auction_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('auctions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('watchlist').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('✅ Data cleared');
}

async function createTestAuctions() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('❌ No authenticated user found');
    process.exit(1);
  }

  console.log(`👤 Creating auctions for user: ${user.email}`);

  const startDate = new Date();
  const endDate = new Date();
  endDate.setHours(endDate.getHours() + 2);

  const auction1 = {
    name: 'Spring Estate Sale 2025',
    place: 'Downtown Gallery',
    title: 'Spring Estate Sale',
    description: 'Premium collection from local estate',
    category: 'Collectibles',
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    created_by: user.id,
    status: 'active',
  };

  const auction2 = {
    name: 'Vintage Electronics Auction',
    place: 'Tech Museum',
    title: 'Vintage Electronics',
    description: 'Rare vintage electronics and gadgets',
    category: 'Electronics',
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    created_by: user.id,
    status: 'active',
  };

  console.log('📦 Creating Auction 1: Spring Estate Sale...');
  const { data: auction1Data, error: error1 } = await supabase
    .from('auctions')
    .insert([auction1])
    .select()
    .single();

  if (error1) {
    console.error('❌ Error creating auction 1:', error1);
    return;
  }

  console.log('✅ Auction 1 created:', auction1Data.id);

  const items1 = [
    {
      auction_id: auction1Data.id,
      title: 'Vintage Rolex Watch',
      description: '1960s Rolex Submariner in excellent condition',
      starting_price: 500000,
      reserve_price: 800000,
      current_bid: 500000,
      image_url: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400',
      status: 'active',
    },
    {
      auction_id: auction1Data.id,
      title: 'Antique Persian Rug',
      description: 'Hand-woven Persian rug from the 1920s',
      starting_price: 300000,
      reserve_price: 500000,
      current_bid: 300000,
      image_url: 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=400',
      status: 'active',
    },
    {
      auction_id: auction1Data.id,
      title: 'Victorian Oil Painting',
      description: 'Original Victorian-era landscape painting',
      starting_price: 150000,
      reserve_price: 250000,
      current_bid: 150000,
      image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
      status: 'active',
    },
    {
      auction_id: auction1Data.id,
      title: 'Antique Mahogany Desk',
      description: 'Early 1900s mahogany writing desk',
      starting_price: 200000,
      reserve_price: 350000,
      current_bid: 200000,
      image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400',
      status: 'active',
    },
  ];

  const { data: items1Data, error: items1Error } = await supabase
    .from('auction_items')
    .insert(items1)
    .select();

  if (items1Error) {
    console.error('❌ Error creating items for auction 1:', items1Error);
    return;
  }

  console.log(`✅ Created ${items1Data.length} items for Auction 1`);

  console.log('📦 Creating Auction 2: Vintage Electronics...');
  const { data: auction2Data, error: error2 } = await supabase
    .from('auctions')
    .insert([auction2])
    .select()
    .single();

  if (error2) {
    console.error('❌ Error creating auction 2:', error2);
    return;
  }

  console.log('✅ Auction 2 created:', auction2Data.id);

  const items2 = [
    {
      auction_id: auction2Data.id,
      title: 'Original Apple Macintosh 128K',
      description: 'Working 1984 Macintosh with original box',
      starting_price: 250000,
      reserve_price: 400000,
      current_bid: 250000,
      image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
      status: 'active',
    },
    {
      auction_id: auction2Data.id,
      title: 'Sony Walkman TPS-L2',
      description: 'First generation Walkman from 1979',
      starting_price: 80000,
      reserve_price: 150000,
      current_bid: 80000,
      image_url: 'https://images.unsplash.com/photo-1558584673-c834fb1cc3ca?w=400',
      status: 'active',
    },
    {
      auction_id: auction2Data.id,
      title: 'Atari 2600 Console',
      description: 'Complete Atari 2600 system with 10 games',
      starting_price: 50000,
      reserve_price: 100000,
      current_bid: 50000,
      image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
      status: 'active',
    },
    {
      auction_id: auction2Data.id,
      title: 'Vintage Polaroid SX-70',
      description: 'Classic SX-70 instant camera in mint condition',
      starting_price: 40000,
      reserve_price: 80000,
      current_bid: 40000,
      image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
      status: 'active',
    },
    {
      auction_id: auction2Data.id,
      title: 'Nintendo Game Boy (1989)',
      description: 'Original Game Boy with Tetris',
      starting_price: 30000,
      reserve_price: 60000,
      current_bid: 30000,
      image_url: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=400',
      status: 'active',
    },
  ];

  const { data: items2Data, error: items2Error } = await supabase
    .from('auction_items')
    .insert(items2)
    .select();

  if (items2Error) {
    console.error('❌ Error creating items for auction 2:', items2Error);
    return;
  }

  console.log(`✅ Created ${items2Data.length} items for Auction 2`);

  console.log('\n🎉 Test auctions created successfully!');
  console.log(`\n📋 Summary:`);
  console.log(`   Auction 1: ${items1Data.length} items (Spring Estate Sale)`);
  console.log(`   Auction 2: ${items2Data.length} items (Vintage Electronics)`);
  console.log(`\n🔗 View at: /dashboard`);
}

async function main() {
  await clearData();
  await createTestAuctions();
}

main().catch(console.error);
