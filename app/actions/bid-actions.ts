'use server';

import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createBidPaymentIntent(auctionId: string, bidAmount: number) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'You must be signed in to place a bid' };
    }

    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (auctionError || !auction) {
      return { error: 'Auction not found' };
    }

    if (auction.status !== 'active') {
      return { error: 'This auction is not currently active' };
    }

    const currentBid = auction.current_bid || auction.starting_price;
    const minBid = currentBid + 100;

    if (bidAmount < minBid) {
      return { error: `Bid must be at least $${(minBid / 100).toFixed(2)}` };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: bidAmount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        auction_id: auctionId,
        user_id: user.id,
        bid_amount: bidAmount.toString(),
      },
    });

    return { 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    };
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return { error: 'Failed to create payment intent' };
  }
}

export async function confirmBidPlacement(
  auctionId: string,
  bidAmount: number
) {
  try {
    const supabase = createClient();
    
    // Get authenticated user from session (don't trust client)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'You must be signed in to place a bid' };
    }

    // Validate auction exists and is active
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (auctionError || !auction) {
      return { error: 'Auction not found' };
    }

    if (auction.status !== 'active') {
      return { error: 'This auction is not currently active' };
    }

    // Validate minimum bid
    const currentBid = auction.current_bid || auction.starting_price;
    const minBid = currentBid + 100;

    if (bidAmount < minBid) {
      return { error: `Bid must be at least $${(minBid / 100).toFixed(2)}` };
    }

    // Atomic bid placement: only update if our bid is higher than current
    // This prevents race conditions where lower bids overwrite higher ones
    const { data: updatedAuction, error: updateError } = await supabase
      .from('auctions')
      .update({ current_bid: bidAmount })
      .eq('id', auctionId)
      .or(`current_bid.lt.${bidAmount},current_bid.is.null`)
      .select()
      .single();

    if (updateError || !updatedAuction) {
      // Auction wasn't updated - someone placed a higher bid first
      return { error: 'A higher bid was placed. Please try again.' };
    }

    // Insert bid record only if auction update succeeded
    const { error: bidError } = await supabase.from('bids').insert({
      auction_id: auctionId,
      user_id: user.id,
      bid_amount: bidAmount,
    });

    if (bidError) {
      console.error('Error inserting bid:', bidError);
      // Rollback auction update by reverting to previous highest bid
      const { data: previousBid } = await supabase
        .from('bids')
        .select('bid_amount')
        .eq('auction_id', auctionId)
        .order('bid_amount', { ascending: false })
        .limit(1)
        .single();
      
      if (previousBid) {
        await supabase
          .from('auctions')
          .update({ current_bid: previousBid.bid_amount })
          .eq('id', auctionId);
      }
      
      return { error: 'Failed to record bid' };
    }

    revalidatePath('/dashboard');
    revalidatePath(`/auctions/${auctionId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error confirming bid:', error);
    return { error: 'Failed to confirm bid' };
  }
}
