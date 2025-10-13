'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addToWatchlist(auctionId: string, itemId?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const insertData: any = {
    user_id: user.id,
    auction_id: auctionId,
  };

  // Support both auction items and legacy auctions
  if (itemId) {
    insertData.auction_item_id = itemId;
  }

  const { error } = await supabase
    .from('watchlist')
    .insert(insertData);

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

export async function removeFromWatchlist(auctionId: string, itemId?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  let deletedRows = 0;

  // Try to delete item-based entry first (if itemId provided)
  if (itemId) {
    const { data: deletedItems, error: itemError } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('auction_item_id', itemId)
      .select();

    if (itemError) {
      // Column might not exist yet, fall through to legacy deletion
    } else if (deletedItems && deletedItems.length > 0) {
      // Successfully deleted item-based entry
      revalidatePath('/mybids');
      revalidatePath('/dashboard');
      return { success: true };
    }
  }

  // Fallback: try to delete legacy auction-based entry
  const { data: deletedLegacy, error: legacyError } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', user.id)
    .eq('auction_id', auctionId)
    .select();

  if (legacyError) {
    return { error: legacyError.message };
  }

  if (deletedLegacy && deletedLegacy.length > 0) {
    revalidatePath('/mybids');
    revalidatePath('/dashboard');
    return { success: true };
  }

  // Nothing was deleted
  return { error: 'Item not found in watchlist' };
}

export async function isInWatchlist(auctionId: string, itemId?: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  let query = supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', user.id);

  // Support both auction items and legacy auctions
  if (itemId) {
    query = query.eq('auction_item_id', itemId);
  } else {
    query = query.eq('auction_id', auctionId);
  }

  const { data } = await query.single();

  return !!data;
}
