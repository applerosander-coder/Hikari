'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createTestData() {
  const supabase = createClient();

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Create new LIVE auctions (ending in 2 hours)
    const { data: auction1, error: auction1Error } = await supabase
      .from('auctions')
      .insert({
        name: 'Art & Collectibles 2025',
        place: 'New York, NY',
        title: 'Art & Collectibles',
        starting_price: 0,
        category: 'art',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        created_by: user.id,
        status: 'active'
      })
      .select()
      .single();

    if (auction1Error) throw auction1Error;

    // Create items for auction 1
    const { error: items1Error } = await supabase
      .from('auction_items')
      .insert([
        {
          auction_id: auction1.id,
          title: 'Abstract Modern Painting',
          description: 'Contemporary artwork',
          starting_price: 150000,
          image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
          position: 1
        },
        {
          auction_id: auction1.id,
          title: 'Vintage Camera Collection',
          description: 'Rare cameras',
          starting_price: 80000,
          image_url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
          position: 2
        },
        {
          auction_id: auction1.id,
          title: 'Signed Baseball Collection',
          description: 'Authenticated signatures',
          starting_price: 120000,
          image_url: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400',
          position: 3
        }
      ]);

    if (items1Error) throw items1Error;

    // Create another live auction
    const { data: auction2, error: auction2Error } = await supabase
      .from('auctions')
      .insert({
        name: 'Tech & Gadgets 2025',
        place: 'Austin, TX',
        title: 'Tech & Gadgets',
        starting_price: 0,
        category: 'electronics',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        created_by: user.id,
        status: 'active'
      })
      .select()
      .single();

    if (auction2Error) throw auction2Error;

    // Create items for auction 2
    const { error: items2Error } = await supabase
      .from('auction_items')
      .insert([
        {
          auction_id: auction2.id,
          title: 'Retro Gaming Console Bundle',
          description: 'Classic consoles',
          starting_price: 60000,
          image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
          position: 1
        },
        {
          auction_id: auction2.id,
          title: 'Vintage Stereo System',
          description: 'Hi-Fi audio',
          starting_price: 90000,
          image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400',
          position: 2
        }
      ]);

    if (items2Error) throw items2Error;

    // Set winner_id on ended items
    const { data: endedItems } = await supabase
      .from('auction_items')
      .select('*, auction:auctions!inner(*)')
      .eq('auctions.status', 'ended')
      .limit(3);

    let wonCount = 0;
    if (endedItems && endedItems.length > 0) {
      const itemsToWin = endedItems.slice(0, 2);
      const { error: winError } = await supabase
        .from('auction_items')
        .update({ winner_id: user.id })
        .in('id', itemsToWin.map(item => item.id));

      if (!winError) wonCount = itemsToWin.length;
    }

    // Get new live items for watchlist
    const { data: newItems } = await supabase
      .from('auction_items')
      .select('id, auction_id')
      .in('auction_id', [auction1.id, auction2.id])
      .limit(3);

    let watchlistCount = 0;
    if (newItems && newItems.length > 0) {
      const { error: watchlistError } = await supabase
        .from('watchlist')
        .insert(
          newItems.map(item => ({
            user_id: user.id,
            auction_item_id: item.id,
            auction_id: item.auction_id
          }))
        );

      if (!watchlistError) watchlistCount = newItems.length;
    }

    revalidatePath('/dashboard');
    revalidatePath('/mybids');

    return { 
      success: true, 
      message: `Created 2 live auctions with 5 items, ${wonCount} won items, ${watchlistCount} watchlist items` 
    };

  } catch (error: any) {
    console.error('Error:', error);
    return { error: error.message };
  }
}
