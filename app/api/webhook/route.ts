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
      
      // Check if this is a bid payment
      if (paymentIntent.metadata.auction_id && paymentIntent.metadata.user_id) {
        const { auction_id, user_id, bid_amount } = paymentIntent.metadata;
        const bidAmountNum = Number(bid_amount);
        
        console.log(`✅ Bid payment succeeded: $${bidAmountNum / 100} for auction ${auction_id}`);
        
        // Verify payment was fully captured
        if (paymentIntent.status === 'succeeded') {
          const paymentIntentId = paymentIntent.id;

          // IDEMPOTENCY CHECK: Use a unique marker for this specific payment
          // Create a unique bid identifier string to store in description field
          const uniqueBidMarker = `stripe_pi_${paymentIntentId}`;

          // Check if bid with this payment intent already exists
          const { data: existingBids } = await supabaseAdmin
            .from('bids')
            .select('id, description')
            .eq('auction_id', auction_id)
            .eq('user_id', user_id);

          // Check if any existing bid has our unique marker
          const duplicateBid = existingBids?.find(bid => 
            bid.description?.includes(uniqueBidMarker)
          );

          if (duplicateBid) {
            console.log(`⚠️ Bid already processed for payment ${paymentIntentId} - skipping duplicate`);
            return new Response(null, { status: 200 });
          }

          // Fetch and lock current auction state
          const { data: auction, error: auctionFetchError } = await supabaseAdmin
            .from('auctions')
            .select('current_bid, status')
            .eq('id', auction_id)
            .single();

          if (auctionFetchError) {
            console.error('❌ Error fetching auction:', auctionFetchError);
            return new Response(`Error fetching auction: ${auctionFetchError.message}`, { status: 500 });
          }

          if (auction.status !== 'active') {
            console.log(`⚠️ Auction ${auction_id} is not active - rejecting bid`);
            return new Response(`Auction not active`, { status: 400 });
          }

          const currentHighestBid = auction?.current_bid || 0;

          // Only accept bid if it's higher than current bid
          if (bidAmountNum <= currentHighestBid) {
            console.log(`⚠️ Bid $${bidAmountNum / 100} not higher than current $${currentHighestBid / 100} - rejecting`);
            return new Response(`Bid too low`, { status: 400 });
          }

          // Insert bid with unique marker in description
          const { error: bidError } = await supabaseAdmin.from('bids').insert({
            auction_id,
            user_id,
            bid_amount: bidAmountNum,
            description: uniqueBidMarker, // Store payment intent ID for idempotency
          });

          if (bidError) {
            console.error('❌ Error inserting bid:', bidError);
            return new Response(`Error recording bid: ${bidError.message}`, { status: 500 });
          }

          // Update auction current_bid - handle NULL case with proper filter
          const { data: updateResult, error: updateError } = await supabaseAdmin
            .from('auctions')
            .update({ current_bid: bidAmountNum })
            .eq('id', auction_id)
            .or(`current_bid.is.null,current_bid.lt.${bidAmountNum}`)
            .select();

          if (updateError) {
            console.error('❌ Error updating auction:', updateError);
            return new Response(`Error updating auction: ${updateError.message}`, { status: 500 });
          }

          // Verify the update actually happened
          if (!updateResult || updateResult.length === 0) {
            console.error('❌ Auction update touched zero rows - concurrent bid may have won');
            return new Response(`Bid overtaken by higher concurrent bid`, { status: 400 });
          }

          console.log(`✅ Bid recorded successfully for auction ${auction_id}`);
        }
      }
    }

    return new Response(null, { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
