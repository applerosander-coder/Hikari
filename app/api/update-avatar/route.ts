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

    // Get user's full name from auth metadata OR public.users
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || null;

    // Update public.users table using direct PostgreSQL (single source of truth)
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

    // Aggressively revalidate all paths to clear Next.js cache
    revalidatePath('/', 'layout');
    revalidatePath('/dashboard', 'layout'); 
    revalidatePath('/dashboard/account', 'layout');
    revalidatePath('/profile', 'layout');
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows[0],
      timestamp: Date.now() // Help with client-side cache busting
    });
  } catch (error: any) {
    console.error('Avatar update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
