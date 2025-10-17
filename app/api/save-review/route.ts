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

    // Sync current user profile from auth metadata to public.users table
    // This ensures comments always display the latest name and avatar
    const currentName = user.user_metadata?.full_name || user.email?.split('@')[0] || null;
    const currentAvatar = user.user_metadata?.avatar_url || null;

    const { Pool } = require('pg');
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });
    
    // First, sync user profile to public.users
    await pool.query(
      `INSERT INTO users (id, full_name, avatar_url)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) 
       DO UPDATE SET full_name = $2, avatar_url = $3`,
      [user.id, currentName, currentAvatar]
    );
    
    // Then save the review
    const insertResult = await pool.query(
      `INSERT INTO user_reviews (user_id, reviewer_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, user.id, rating, comment || null]
    );
    
    await pool.end();
    
    const result = insertResult.rows[0];
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
