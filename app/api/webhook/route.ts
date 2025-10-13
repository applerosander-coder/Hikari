import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

// Initialize Stripe using your secret key (stored securely in Replit Secrets)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create Supabase admin client for webhook (bypasses RLS)
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature");

  try {
    // Verify that the webhook really came from Stripe
    const event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // ✅ Handle specific event types
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("✅ Payment succeeded for session:", session.id);
      // Here you could update your database or send an email, etc.
    }

    // Handle bid payment completion - CREATE BID ONLY AFTER PAYMENT SUCCESS
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Update payments table for winner charges (identified by type metadata)
      if (paymentIntent.metadata.type === 'winner_charge') {
        await supabaseAdmin
          .from('payments')
          .update({ status: 'succeeded' })
          .eq('payment_intent_id', paymentIntent.id);
        return new Response(null, { status: 200 });
      }
      
      // Check if this is a bid payment (has bid_amount in metadata)
      const auctionItemId = paymentIntent.metadata.auction_item_id;
      const auctionId = paymentIntent.metadata.auction_id;
      const isItemBid = !!auctionItemId;
      
      if ((auctionItemId || auctionId) && paymentIntent.metadata.user_id && paymentIntent.metadata.bid_amount) {
        const { user_id, bid_amount } = paymentIntent.metadata;
        const bidAmountNum = Number(bid_amount);
        const targetId = auctionItemId || auctionId;
        
        console.log(`✅ Bid payment succeeded: $${bidAmountNum / 100} for ${isItemBid ? 'item' : 'auction'} ${targetId}`);
        
        // Verify payment was fully captured
        if (paymentIntent.status === 'succeeded') {
          const paymentIntentId = paymentIntent.id;

          // IDEMPOTENCY CHECK: Check if exact bid already exists
          let existingBid;
          if (isItemBid) {
            const { data } = await supabaseAdmin
              .from('bids')
              .select('id')
              .eq('auction_item_id', auctionItemId)
              .eq('user_id', user_id)
              .eq('bid_amount', bidAmountNum)
              .maybeSingle();
            existingBid = data;
          } else {
            const { data } = await supabaseAdmin
              .from('bids')
              .select('id')
              .eq('auction_id', auctionId)
              .eq('user_id', user_id)
              .eq('bid_amount', bidAmountNum)
              .maybeSingle();
            existingBid = data;
          }

          if (existingBid) {
            console.log(`⚠️ Bid already exists for payment ${paymentIntentId} - skipping duplicate`);
            return new Response(null, { status: 200 });
          }

          // Fetch and lock current state (item or auction)
          let currentHighestBid = 0;
          let itemStatus = 'active';

          if (isItemBid) {
            const { data: item, error: itemFetchError } = await supabaseAdmin
              .from('auction_items')
              .select('current_bid, auction:auctions(status)')
              .eq('id', auctionItemId)
              .single();

            if (itemFetchError) {
              console.error('❌ Error fetching auction item:', itemFetchError);
              return new Response(`Error fetching auction item: ${itemFetchError.message}`, { status: 500 });
            }

            itemStatus = item.auction?.status || 'draft';
            currentHighestBid = item?.current_bid || 0;
          } else {
            const { data: auction, error: auctionFetchError } = await supabaseAdmin
              .from('auctions')
              .select('current_bid, status')
              .eq('id', auctionId)
              .single();

            if (auctionFetchError) {
              console.error('❌ Error fetching auction:', auctionFetchError);
              return new Response(`Error fetching auction: ${auctionFetchError.message}`, { status: 500 });
            }

            itemStatus = auction.status;
            currentHighestBid = auction?.current_bid || 0;
          }

          if (itemStatus !== 'active') {
            console.log(`⚠️ ${isItemBid ? 'Item' : 'Auction'} ${targetId} is not active - rejecting bid`);
            return new Response(`${isItemBid ? 'Item' : 'Auction'} not active`, { status: 400 });
          }

          // Only accept bid if it's higher than current bid
          if (bidAmountNum <= currentHighestBid) {
            console.log(`⚠️ Bid $${bidAmountNum / 100} not higher than current $${currentHighestBid / 100} - rejecting`);
            return new Response(`Bid too low`, { status: 400 });
          }

          // Insert bid into database
          const bidData: any = {
            user_id,
            bid_amount: bidAmountNum,
          };

          if (isItemBid) {
            bidData.auction_item_id = auctionItemId;
          } else {
            bidData.auction_id = auctionId;
          }

          const { error: bidError } = await supabaseAdmin.from('bids').insert(bidData);

          if (bidError) {
            console.error('❌ Error inserting bid:', bidError);
            return new Response(`Error recording bid: ${bidError.message}`, { status: 500 });
          }

          // Update current_bid - handle NULL case with proper filter
          let updateResult, updateError;
          if (isItemBid) {
            const result = await supabaseAdmin
              .from('auction_items')
              .update({ current_bid: bidAmountNum })
              .eq('id', auctionItemId)
              .or(`current_bid.is.null,current_bid.lt.${bidAmountNum}`)
              .select();
            updateResult = result.data;
            updateError = result.error;
          } else {
            const result = await supabaseAdmin
              .from('auctions')
              .update({ current_bid: bidAmountNum })
              .eq('id', auctionId)
              .or(`current_bid.is.null,current_bid.lt.${bidAmountNum}`)
              .select();
            updateResult = result.data;
            updateError = result.error;
          }

          if (updateError) {
            console.error('❌ Error updating auction:', updateError);
            return new Response(`Error updating auction: ${updateError.message}`, { status: 500 });
          }

          // Verify the update actually happened
          if (!updateResult || updateResult.length === 0) {
            console.log('⚠️ Update touched zero rows - concurrent bid may have won, but bid is still recorded');
            // Bid is already saved, so we consider this a success
            // The user's bid is valid even if not currently the highest
            return new Response(null, { status: 200 });
          }

          console.log(`✅ Bid recorded successfully and is now highest for ${isItemBid ? 'item' : 'auction'} ${targetId}`);
        }
      }
    }

    // Handle payment failures
    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      
      // Update payments table for winner charges
      if (pi.metadata.type === 'winner_charge') {
        await supabaseAdmin
          .from('payments')
          .update({ status: 'failed' })
          .eq('payment_intent_id', pi.id);
        // TODO: notify user to update card and retry auction
      }
    }

    return new Response(null, { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
