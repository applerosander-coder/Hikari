'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addToWatchlist(auctionId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('watchlist')
    .insert({
      user_id: user.id,
      auction_id: auctionId
    });

  if (error) {
    if (error.code === '23505') {
      return { error: 'Already in watchlist' };
    }
    return { error: error.message };
  }

  revalidatePath('/mybids');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function removeFromWatchlist(auctionId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', user.id)
    .eq('auction_id', auctionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/mybids');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function isInWatchlist(auctionId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('auction_id', auctionId)
    .single();

  return !!data;
}
