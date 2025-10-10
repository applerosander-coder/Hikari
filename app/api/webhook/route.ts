import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from '@/utils/supabase/server';

// Initialize Stripe using your secret key (stored securely in Replit Secrets)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

    // Handle bid payment completion
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Check if this is a bid payment
      if (paymentIntent.metadata.auction_id && paymentIntent.metadata.user_id) {
        const { auction_id, user_id, bid_amount } = paymentIntent.metadata;
        
        console.log(`✅ Bid payment succeeded: ${bid_amount} for auction ${auction_id}`);
        
        // The bid has already been recorded in the database by confirmBidPlacement
        // This webhook is just for logging/confirmation
      }
    }

    return new Response(null, { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
