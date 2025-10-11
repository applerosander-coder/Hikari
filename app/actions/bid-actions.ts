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
  console.log('🎯 confirmBidPlacement called:', { auctionId, bidAmount });
  
  try {
    const supabase = createClient();
    
    // Get authenticated user from session (don't trust client)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('❌ User not authenticated:', userError);
      return { error: 'You must be signed in to place a bid' };
    }
    
    console.log('✅ User authenticated:', user.id);

    // Validate auction exists and is active
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (auctionError || !auction) {
      console.log('❌ Auction not found');
      return { error: 'Auction not found' };
    }

    console.log('📊 Auction data:', { 
      id: auction.id, 
      current_bid: auction.current_bid, 
      starting_price: auction.starting_price,
      status: auction.status 
    });

    if (auction.status !== 'active') {
      return { error: 'This auction is not currently active' };
    }

    // Validate minimum bid
    const currentBid = auction.current_bid || auction.starting_price;
    const minBid = currentBid + 100;

    console.log('💰 Bid validation:', { 
      currentBid, 
      minBid, 
      newBid: bidAmount,
      isValid: bidAmount >= minBid 
    });

    if (bidAmount < minBid) {
      return { error: `Bid must be at least $${(minBid / 100).toFixed(2)}` };
    }

    // Update the auction with the new bid
    console.log('🔄 Updating auction with bid:', bidAmount);
    
    const { data: updatedAuction, error: updateError } = await supabase
      .from('auctions')
      .update({ current_bid: bidAmount })
      .eq('id', auctionId)
      .select()
      .single();

    if (updateError || !updatedAuction) {
      console.log('❌ Auction update failed:', updateError);
      return { error: 'Failed to update auction. Please try again.' };
    }
    
    // Verify we actually got the bid (in case of race condition)
    if (updatedAuction.current_bid !== bidAmount) {
      console.log('⚠️ Race condition detected - someone bid higher');
      return { error: 'A higher bid was placed while you were bidding. Please try again.' };
    }

    console.log('✅ Auction updated successfully');

    // Insert bid record only if auction update succeeded
    console.log('💾 Inserting bid record...');
    const { error: bidError } = await supabase.from('bids').insert({
      auction_id: auctionId,
      user_id: user.id,
      bid_amount: bidAmount,
    });

    if (bidError) {
      console.error('❌ Error inserting bid:', bidError);
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

    console.log('✅ Bid record inserted successfully');
    
    revalidatePath('/dashboard');
    revalidatePath(`/auctions/${auctionId}`);

    console.log('🎉 Bid placement complete - returning success');
    return { success: true };
  } catch (error: any) {
    console.error('Error confirming bid:', error);
    return { error: 'Failed to confirm bid' };
  }
}
