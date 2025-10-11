import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/utils/stripe/config';

export async function POST(req: Request) {
  const supabase = createClient();
  // TODO: add admin check OR run from a protected scheduler
  const { auctionId } = await req.json();
  
  if (!auctionId) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const { data: auction } = await supabase
    .from('auctions')
    .select('id, title, status, winner_id')
    .eq('id', auctionId)
    .single();

  if (!auction || auction.status !== 'active') {
    return NextResponse.json({ error: 'invalid_auction' }, { status: 400 });
  }

  // Determine winner: highest bid
  const { data: topBid } = await supabase
    .from('bids')
    .select('id, user_id, bid_amount')
    .eq('auction_id', auctionId)
    .order('bid_amount', { ascending: false })
    .limit(1)
    .single();

  if (!topBid) {
    // no bids — just mark ended
    await supabase
      .from('auctions')
      .update({ status: 'ended', winner_id: null })
      .eq('id', auctionId);
    return NextResponse.json({ status: 'no_bids' });
  }

  const winnerId = topBid.user_id;
  // bid_amount is already stored in cents
  const amountCents = Number(topBid.bid_amount);

  if (!amountCents || amountCents <= 0) {
    return NextResponse.json({ error: 'invalid_bid_amount' }, { status: 400 });
  }

  // lookup Stripe customer + default PM
  const { data: customerRec } = await supabase
    .from('customers')
    .select('stripe_customer_id, payment_method')
    .eq('id', winnerId)
    .single();

  if (!customerRec?.stripe_customer_id || !customerRec?.payment_method?.id) {
    return NextResponse.json({ error: 'no_payment_method' }, { status: 400 });
  }

  // Check for existing payment (idempotency)
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id, status, payment_intent_id')
    .eq('auction_id', auctionId)
    .eq('user_id', winnerId)
    .maybeSingle();

  if (existingPayment) {
    // Already charged or attempted
    if (existingPayment.status === 'succeeded') {
      return NextResponse.json({ 
        status: 'already_charged', 
        paymentIntentId: existingPayment.payment_intent_id 
      });
    }
    // Previous attempt failed or processing - could retry, for now just return
    return NextResponse.json({ 
      status: existingPayment.status, 
      paymentIntentId: existingPayment.payment_intent_id 
    });
  }

  try {
    // Create off-session payment intent with metadata for auto-charge
    // Use idempotency key to prevent duplicate charges on retries
    const idempotencyKey = `auction_${auctionId}_winner_${winnerId}`;
    
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      customer: customerRec.stripe_customer_id,
      payment_method: customerRec.payment_method.id,
      off_session: true,
      confirm: true,
      description: `Auction ${auction.title} – winning bid`,
      metadata: { 
        auction_id: auctionId, 
        user_id: winnerId, 
        type: 'winner_charge'
      }
    }, {
      idempotencyKey
    });

    // Insert payment record
    const { error: insertError } = await supabase.from('payments').insert({
      user_id: winnerId,
      auction_id: auctionId,
      amount_cents: amountCents,
      currency: 'usd',
      payment_intent_id: intent.id,
      status: intent.status,
    });

    if (insertError) {
      console.error('Failed to insert payment record:', insertError);
      // Don't mark auction ended if we can't track payment
      return NextResponse.json({ error: 'payment_tracking_failed' }, { status: 500 });
    }

    // Only mark auction ended if payment succeeded or is processing
    if (intent.status === 'succeeded' || intent.status === 'processing') {
      await supabase
        .from('auctions')
        .update({ status: 'ended', winner_id: winnerId })
        .eq('id', auctionId);
    }

    return NextResponse.json({ 
      status: intent.status, 
      paymentIntentId: intent.id 
    });
  } catch (err: any) {
    console.error('Error charging winner:', err);
    
    // If payment failed, record it
    if (err.payment_intent) {
      await supabase.from('payments').insert({
        user_id: winnerId,
        auction_id: auctionId,
        amount_cents: amountCents,
        currency: 'usd',
        payment_intent_id: err.payment_intent.id,
        status: 'failed',
      });
    }
    
    return NextResponse.json({ 
      error: 'charge_failed', 
      message: err.message 
    }, { status: 500 });
  }
}
