'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Pool } from 'pg';

export async function placeBidWithSavedCard(auctionId: string, bidAmount: number) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'You must be signed in to place a bid' };
    }

    // Check if user has a payment method on file (required for auction participation)
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', user.id)
      .single();

    const paymentMethod = (customer as any)?.payment_method as { id: string; brand?: string; last4?: string } | null;
    
    if (!paymentMethod?.id) {
      return { error: 'no_payment_method' };
    }

    // Try to find auction item first, then fall back to legacy auction
    const { data: auctionItem } = await supabase
      .from('auction_items')
      .select('*, auction:auctions(id, status, end_date)')
      .eq('id', auctionId)
      .single();

    let currentBid, minBid, itemStatus, parentAuctionId;
    let isAuctionItem = false;

    if (auctionItem) {
      // This is an auction item
      isAuctionItem = true;
      itemStatus = auctionItem.auction?.status;
      currentBid = auctionItem.current_bid || auctionItem.starting_price;
      minBid = currentBid + 100;
      parentAuctionId = auctionItem.auction_id;
    } else {
      // Legacy auction
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', auctionId)
        .single();

      if (auctionError || !auction) {
        return { error: 'Auction not found' };
      }

      itemStatus = auction.status;
      currentBid = auction.current_bid || auction.starting_price;
      minBid = currentBid + 100;
    }

    if (itemStatus !== 'active') {
      return { error: 'This auction is not currently active' };
    }

    if (bidAmount < minBid) {
      return { error: `Bid must be at least $${(minBid / 100).toFixed(2)}` };
    }

    // Create bid record (NO PAYMENT YET - payment only happens when auction ends if user wins)
    if (isAuctionItem) {
      // Find users who will be outbid by this new bid
      const { data: previousBids } = await supabase
        .from('bids')
        .select('user_id')
        .eq('auction_item_id', auctionId)
        .neq('user_id', user.id)
        .gte('bid_amount', currentBid);

      const outbidUserIds = [...new Set(previousBids?.map(b => b.user_id) || [])];

      // WORKAROUND: Use raw SQL to bypass any schema caching issues
      const { error: bidError } = await supabase.rpc('insert_bid', {
        p_auction_item_id: auctionId,
        p_auction_id: parentAuctionId!,
        p_user_id: user.id,
        p_bid_amount: bidAmount,
      });

      if (bidError) {
        console.error('Error inserting bid:', bidError);
        return { error: 'Failed to place bid' };
      }

      // Update current_bid on auction item
      const { error: updateError } = await supabase
        .from('auction_items')
        .update({ current_bid: bidAmount })
        .eq('id', auctionId);

      if (updateError) {
        console.error('Error updating auction item:', updateError);
      }

      // Send outbid notifications using PostgreSQL Pool
      if (outbidUserIds.length > 0 && auctionItem) {
        try {
          const pool = new Pool({ 
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
          });

          const imageUrl = auctionItem.image_url || 
                          (auctionItem.image_urls && auctionItem.image_urls.length > 0 ? auctionItem.image_urls[0] : null);

          for (const outbidUserId of outbidUserIds) {
            await pool.query(
              `INSERT INTO notifications (user_id, type, title, message, auction_item_id, image_url, read, from_user_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [
                outbidUserId,
                'outbid',
                'You\'ve been outbid!',
                `Someone placed a higher bid on ${auctionItem.title || 'an auction item'}`,
                auctionId,
                imageUrl,
                false,
                user.id
              ]
            );
          }

          await pool.end();
        } catch (notifError) {
          console.error('Error sending outbid notifications:', notifError);
          // Don't fail the bid if notifications fail
        }
      }
    } else {
      // Insert bid for legacy auction
      const { error: bidError } = await supabase.from('bids').insert({
        auction_id: auctionId,
        user_id: user.id,
        bid_amount: bidAmount,
      });

      if (bidError) {
        console.error('Error inserting bid:', bidError);
        return { error: 'Failed to place bid' };
      }

      // Update current_bid on legacy auction
      const { error: updateError } = await supabase
        .from('auctions')
        .update({ current_bid: bidAmount })
        .eq('id', auctionId);

      if (updateError) {
        console.error('Error updating auction:', updateError);
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/mybids');
    revalidatePath(`/auctions/${parentAuctionId || auctionId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error placing bid:', error);
    return { error: 'Failed to place bid' };
  }
}

