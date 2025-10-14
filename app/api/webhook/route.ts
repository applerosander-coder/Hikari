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

    // Handle winner payment completion - Update payment status only
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Update payments table for winner charges (identified by type metadata)
      if (paymentIntent.metadata.type === 'winner_charge') {
        console.log(`✅ Winner payment succeeded: $${paymentIntent.amount / 100}`);
        
        await supabaseAdmin
          .from('payments')
          .update({ status: 'succeeded' })
          .eq('stripe_payment_intent_id', paymentIntent.id);
        
        return new Response(null, { status: 200 });
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
