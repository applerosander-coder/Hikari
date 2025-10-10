import { headers } from "next/headers";
import Stripe from "stripe";

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

    return new Response(null, { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
