'use server';

import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function placeBidWithSavedCard(auctionId: string, bidAmount: number) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'You must be signed in to place a bid' };
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id, payment_method')
      .eq('id', user.id)
      .single();

    const paymentMethod = customer?.payment_method as { id: string; brand?: string; last4?: string } | null;
    
    if (!paymentMethod?.id) {
      return { error: 'no_payment_method' };
    }

    // Try to find auction item first, then fall back to legacy auction
    const { data: auctionItem } = await supabase
      .from('auction_items')
      .select('*, auction:auctions(id, status, end_date)')
      .eq('id', auctionId)
      .single();

    let currentBid, minBid, itemStatus;
    let isAuctionItem = false;

    if (auctionItem) {
      // This is an auction item
      isAuctionItem = true;
      itemStatus = auctionItem.auction?.status;
      currentBid = auctionItem.current_bid || auctionItem.starting_price;
      minBid = currentBid + 100;
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

    const metadata: any = {
      user_id: user.id,
      bid_amount: bidAmount.toString(),
      type: 'bid',
    };

    // Use auction_item_id for items, auction_id for legacy
    if (isAuctionItem) {
      metadata.auction_item_id = auctionId;
    } else {
      metadata.auction_id = auctionId;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: bidAmount,
      currency: 'usd',
      customer: customer?.stripe_customer_id || undefined,
      payment_method: paymentMethod.id,
      off_session: true,
      confirm: true,
      metadata,
    });

    if (paymentIntent.status === 'succeeded') {
      return { success: true, paymentIntentId: paymentIntent.id };
    } else if (paymentIntent.status === 'requires_action') {
      return { error: 'Card requires authentication' };
    } else {
      return { error: 'Payment could not be processed' };
    }
  } catch (error: any) {
    console.error('Error placing bid with saved card:', error);
    
    // Handle specific Stripe error types
    if (error.type === 'StripeCardError') {
      if (error.code === 'card_declined') {
        return { error: 'Card declined' };
      } else if (error.code === 'insufficient_funds') {
        return { error: 'Insufficient funds' };
      } else if (error.code === 'authentication_required') {
        return { error: 'Card requires authentication' };
      }
      return { error: error.message || 'Card payment failed' };
    }
    
    return { error: 'Failed to process payment' };
  }
}

export async function createBidPaymentIntent(auctionId: string, bidAmount: number) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'You must be signed in to place a bid' };
    }

    // Enforce saved card requirement
    const { data: customer } = await supabase
      .from('customers')
      .select('payment_method')
      .eq('id', user.id)
      .single();

    const savedPaymentMethod = customer?.payment_method as { id?: string } | null;
    
    if (!savedPaymentMethod?.id) {
      return { error: 'Please add a payment method before bidding.' };
    }

    // Try to find auction item first, then fall back to legacy auction
    const { data: auctionItem } = await supabase
      .from('auction_items')
      .select('*, auction:auctions(id, status, end_date)')
      .eq('id', auctionId)
      .single();

    let currentBid, minBid, itemStatus;
    let isAuctionItem = false;

    if (auctionItem) {
      // This is an auction item
      isAuctionItem = true;
      itemStatus = auctionItem.auction?.status;
      currentBid = auctionItem.current_bid || auctionItem.starting_price;
      minBid = currentBid + 100;
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

    const metadata: any = {
      user_id: user.id,
      bid_amount: bidAmount.toString(),
    };

    // Use auction_item_id for items, auction_id for legacy
    if (isAuctionItem) {
      metadata.auction_item_id = auctionId;
    } else {
      metadata.auction_id = auctionId;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: bidAmount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
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
