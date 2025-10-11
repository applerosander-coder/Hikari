-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/editor)
-- This creates the customers and payments tables needed for saved payment methods

-- 1. Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  payment_method jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create payments table  
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auction_id uuid REFERENCES public.auctions(id) ON DELETE SET NULL,
  stripe_payment_intent_id text NOT NULL,
  amount integer NOT NULL,
  currency text DEFAULT 'usd',
  status text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_stripe_id ON public.customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_auction_id ON public.payments(auction_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_pi ON public.payments(stripe_payment_intent_id);

-- 4. Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for customers
CREATE POLICY "Users can view their own customer record"
ON public.customers
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own customer record"
ON public.customers
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own customer record"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- 6. Create RLS policies for payments
CREATE POLICY "Users can view their own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 7. Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Done! Tables are created with proper RLS policies
