import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, avatarUrl }: { userId: string; avatarUrl: string } = await request.json();

    if (user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('Updating avatar for user:', userId, 'with URL:', avatarUrl);

    // Get user's full name from auth metadata
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || null;

    // Update auth metadata to keep it in sync
    await supabase.auth.updateUser({
      data: {
        avatar_url: avatarUrl,
        full_name: fullName
      }
    });

    // Update public.users table using direct SQL (bypasses schema cache issues)
    const { Pool } = require('pg');
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });
    
    const result = await pool.query(
      `INSERT INTO users (id, full_name, avatar_url)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) 
       DO UPDATE SET full_name = $2, avatar_url = $3
       RETURNING *`,
      [userId, fullName, avatarUrl]
    );
    
    await pool.end();
    
    console.log('Avatar updated successfully via PostgreSQL:', result.rows[0]);

    // Revalidate all paths that use getUserDetails
    revalidatePath('/', 'layout');
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/dashboard/account');
    revalidatePath('/profile/[userId]', 'page');

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Avatar update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
