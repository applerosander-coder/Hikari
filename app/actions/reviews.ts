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

  // Use custom PostgreSQL function to bypass PostgREST cache
  // @ts-ignore - Custom RPC function
  const { data, error } = await supabase.rpc('save_user_review', {
    p_user_id: userId,
    p_reviewer_id: user.id,
    p_rating: rating,
    p_comment: null // Don't update comment when saving rating
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

  // Use custom PostgreSQL function to bypass PostgREST cache
  // @ts-ignore - Custom RPC function
  const { data, error } = await supabase.rpc('save_user_review', {
    p_user_id: userId,
    p_reviewer_id: user.id,
    p_rating: rating,
    p_comment: comment.trim() || null
  });

  if (error) {
    console.error('Error saving comment:', error);
    throw new Error('Failed to save comment');
  }

  revalidatePath(`/profile/${userId}`);
  return { success: true };
}
