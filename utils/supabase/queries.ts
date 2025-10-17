import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { Database } from '@/types/db';

export const getUser = cache(async (supabase: SupabaseClient<Database>) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async (supabase: SupabaseClient<Database>, userId: string) => {
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

export const getUserDetails = async (supabase: SupabaseClient) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Use PostgreSQL directly to avoid Supabase cache issues
  const { Pool } = require('pg');
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });
  
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [user.id]
  );
  
  await pool.end();
  
  return result.rows[0] || null;
};