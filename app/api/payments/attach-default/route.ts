import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/utils/stripe/config';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const { paymentMethodId } = await req.json();
  if (!paymentMethodId) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const { data: cust } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!cust?.stripe_customer_id) {
    return NextResponse.json({ error: 'no_stripe_customer' }, { status: 400 });
  }

  // Attach payment method to customer
  await stripe.paymentMethods.attach(paymentMethodId, { 
    customer: cust.stripe_customer_id 
  });
  
  // Set as default payment method
  await stripe.customers.update(cust.stripe_customer_id, {
    invoice_settings: { default_payment_method: paymentMethodId }
  });

  // Store light summary in customers.payment_method (brand/last4/exp) for UI
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  const summary = pm.card ? {
    id: pm.id,
    brand: pm.card.brand,
    last4: pm.card.last4,
    exp_month: pm.card.exp_month,
    exp_year: pm.card.exp_year
  } : { id: pm.id };

  await supabase
    .from('customers')
    .update({ payment_method: summary as any })
    .eq('id', user.id);

  return NextResponse.json({ ok: true });
}
