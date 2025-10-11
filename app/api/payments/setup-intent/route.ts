import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/utils/stripe/config';

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  // Ensure Stripe customer exists in public.customers
  const { data: custRec } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  let customerId = custRec?.stripe_customer_id ?? null;
  
  if (!customerId) {
    const customer = await stripe.customers.create({ 
      email: user.email ?? undefined, 
      metadata: { appUserId: user.id }
    });
    customerId = customer.id;

    await supabase.from('customers')
      .upsert({ 
        id: user.id, 
        stripe_customer_id: customerId 
      }, { onConflict: 'id' });
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    usage: 'off_session',
    payment_method_types: ['card'],
  });

  return NextResponse.json({ clientSecret: setupIntent.client_secret });
}
