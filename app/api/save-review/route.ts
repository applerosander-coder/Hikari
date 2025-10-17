import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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

    // Use the PostgreSQL function we created
    const { data, error } = await supabase.rpc('save_user_review', {
      p_user_id: user_id,
      p_reviewer_id: user.id,
      p_rating: rating,
      p_comment: comment || null
    });

    if (error) {
      console.error('RPC Error:', error);
      
      // If RPC fails, try direct table insert as fallback
      const { error: insertError } = await supabase
        .from('user_reviews')
        .upsert({
          user_id,
          reviewer_id: user.id,
          rating,
          comment: comment || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,reviewer_id',
        });

      if (insertError) {
        console.error('Insert Error:', insertError);
        return NextResponse.json(
          { error: 'Database error', details: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
