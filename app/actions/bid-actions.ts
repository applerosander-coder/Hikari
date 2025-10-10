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
  userId: string,
  bidAmount: number
) {
  try {
    const supabase = createClient();

    const { error: bidError } = await supabase.from('bids').insert({
      auction_id: auctionId,
      user_id: userId,
      bid_amount: bidAmount,
    });

    if (bidError) {
      console.error('Error inserting bid:', bidError);
      return { error: 'Failed to record bid' };
    }

    const { error: updateError } = await supabase
      .from('auctions')
      .update({ current_bid: bidAmount })
      .eq('id', auctionId);

    if (updateError) {
      console.error('Error updating auction:', updateError);
    }

    revalidatePath('/dashboard');
    revalidatePath(`/auctions/${auctionId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error confirming bid:', error);
    return { error: 'Failed to confirm bid' };
  }
}
