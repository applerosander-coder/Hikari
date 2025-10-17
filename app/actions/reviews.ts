'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveRating(userId: string, rating: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (userId === user.id) {
    throw new Error('You cannot review yourself');
  }

  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Check for existing review to preserve comment
  const { data: existing } = await supabase
    .from('user_reviews')
    .select('comment')
    .eq('user_id', userId)
    .eq('reviewer_id', user.id)
    .maybeSingle();

  const { error } = await supabase
    .from('user_reviews')
    .upsert({
      user_id: userId,
      reviewer_id: user.id,
      rating,
      comment: existing?.comment || null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,reviewer_id',
      ignoreDuplicates: false,
    });

  if (error) {
    console.error('Error saving rating:', error);
    throw new Error('Failed to save rating');
  }

  revalidatePath(`/profile/${userId}`);
  return { success: true };
}

export async function saveComment(userId: string, rating: number, comment: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (userId === user.id) {
    throw new Error('You cannot review yourself');
  }

  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const { error } = await supabase
    .from('user_reviews')
    .upsert({
      user_id: userId,
      reviewer_id: user.id,
      rating,
      comment: comment.trim() || null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,reviewer_id',
      ignoreDuplicates: false,
    });

  if (error) {
    console.error('Error saving comment:', error);
    throw new Error('Failed to save comment');
  }

  revalidatePath(`/profile/${userId}`);
  return { success: true };
}
