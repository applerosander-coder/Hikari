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
  const amountCents = Math.trunc(Number(topBid.bid_amount));

  // lookup Stripe customer + default PM
  const { data: customerRec } = await supabase
    .from('customers')
    .select('stripe_customer_id, payment_method')
    .eq('id', winnerId)
    .single();

  if (!customerRec?.stripe_customer_id || !customerRec?.payment_method?.id) {
    return NextResponse.json({ error: 'no_payment_method' }, { status: 400 });
  }

  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    customer: customerRec.stripe_customer_id,
    payment_method: customerRec.payment_method.id,
    off_session: true,
    confirm: true,
    description: `Auction ${auctionId} – winning bid`,
    metadata: { 
      auction_id: auctionId, 
      user_id: winnerId, 
      bid_id: topBid.id.toString() 
    }
  });

  // write to payments ledger
  await supabase.from('payments').insert({
    user_id: winnerId,
    auction_id: auctionId,
    amount_cents: amountCents,
    currency: 'usd',
    payment_intent_id: intent.id,
    status: intent.status,
  });

  // mark auction ended & set winner
  await supabase
    .from('auctions')
    .update({ status: 'ended', winner_id: winnerId })
    .eq('id', auctionId);

  return NextResponse.json({ 
    status: intent.status, 
    paymentIntentId: intent.id 
  });
}
