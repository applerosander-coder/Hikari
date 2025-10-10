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
        
        console.log(`✅ Bid payment succeeded: $${Number(bid_amount) / 100} for auction ${auction_id}`);
        
        // Verify payment was fully captured
        if (paymentIntent.status === 'succeeded') {
          // Insert bid into database (using admin client to bypass RLS)
          const { error: bidError } = await supabaseAdmin.from('bids').insert({
            auction_id,
            user_id,
            bid_amount: Number(bid_amount),
          });

          if (bidError) {
            console.error('❌ Error inserting bid:', bidError);
            return new Response(`Error recording bid: ${bidError.message}`, { status: 500 });
          }

          // Update auction current_bid
          const { error: updateError } = await supabaseAdmin
            .from('auctions')
            .update({ current_bid: Number(bid_amount) })
            .eq('id', auction_id);

          if (updateError) {
            console.error('⚠️ Error updating auction:', updateError);
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
