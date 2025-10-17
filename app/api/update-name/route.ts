import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fullName } = await request.json();

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Update auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    if (authError) {
      throw new Error(authError.message);
    }

    // Update public.users table
    const { Pool } = require('pg');
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });
    
    const currentAvatar = user.user_metadata?.avatar_url || null;
    await pool.query(
      `INSERT INTO users (id, full_name, avatar_url)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) 
       DO UPDATE SET full_name = $2`,
      [user.id, fullName, currentAvatar]
    );
    await pool.end();

    // Clear caches
    revalidatePath('/', 'layout');
    revalidatePath('/profile/[userId]', 'page');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Name update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
