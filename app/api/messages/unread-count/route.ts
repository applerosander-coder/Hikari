import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  let pool: Pool | null = null;
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    // Count unread messages using PostgreSQL
    // RLS policies still apply at database level
    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM messages 
       WHERE receiver_id = $1 AND read_at IS NULL`,
      [user.id]
    );

    const count = parseInt(result.rows[0]?.count || '0', 10);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching unread messages count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread messages count' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
