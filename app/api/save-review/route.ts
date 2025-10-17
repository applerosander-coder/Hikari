import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { user_id, rating, comment } = body;

    if (!user_id || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (user.id === user_id) {
      return NextResponse.json(
        { error: 'You cannot review yourself' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Ensure user exists in public.users table - only insert if missing, preserve existing data
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, full_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (!existingUser) {
      // Only create if user doesn't exist - use auth metadata as fallback
      await supabase.from('users').insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null
      });
    }

    // Save review using Supabase with proper SQL
    const { data: result, error } = await supabase
      .from('user_reviews')
      .insert({
        user_id: user_id,
        reviewer_id: user.id,
        rating: rating,
        comment: comment || null
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    console.log('Review saved successfully:', result);

    // Revalidate the profile page to show new comment immediately
    revalidatePath(`/profile/${user_id}`);
    revalidatePath('/profile/[userId]', 'page');

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
