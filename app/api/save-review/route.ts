import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { saveUserReview } from '@/lib/db-pg';

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

    // Get reviewer's name and avatar from auth user metadata
    const reviewerName = user.user_metadata?.full_name || user.email?.split('@')[0] || null;
    const reviewerAvatar = user.user_metadata?.avatar_url || null;

    // Use direct PostgreSQL connection to bypass PostgREST cache issues
    const result = await saveUserReview(
      user_id,
      user.id,
      rating,
      comment || null,
      reviewerName,
      reviewerAvatar
    );

    console.log('Review saved successfully:', result);

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
