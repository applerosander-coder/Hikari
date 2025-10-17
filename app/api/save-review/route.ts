import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { saveUserReview, getUserInfo } from '@/lib/db-pg';

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

    // Ensure user exists in public.users table with current auth metadata
    const supabaseAdmin = createClient();
    await supabaseAdmin.from('users').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null
    }, {
      onConflict: 'id'
    });

    // Use direct PostgreSQL connection to save review (no need to pass reviewer data since we use JOIN)
    const result = await saveUserReview(
      user_id,
      user.id,
      rating,
      comment || null
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
