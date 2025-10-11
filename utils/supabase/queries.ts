import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { Database } from '@/types/db';

export const getUser = cache(async (supabase: SupabaseClient<Database>) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

type Subscription = {
  status: string;
  current_period_end: string;
  prices: {
    unit_amount: number;
    interval: string;
    products: {
      name: string;
    };
  };
} | null;

export const getSubscription = cache(async (supabase: SupabaseClient<Database>, userId: string): Promise<Subscription> => {
  // Subscriptions table removed - this is now an auction platform
  // Return null to maintain compatibility with existing code
  return null;
});

export const getProducts = cache(async (supabase: SupabaseClient) => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  return products;
});

export const getPlans = cache(async (supabase: SupabaseClient) => {
  const { data: plans, error } = await supabase
    .from('plan')
    .select('*')
    .order('sort', { ascending: true })
    .order('id', { ascending: true }); // Secondary sort by id as a fallback

  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
  return plans;
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});