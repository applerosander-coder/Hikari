import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      await pool.end();
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const otherUserId = params.userId;

    const result = await pool.query(
      `SELECT id, sender_id, receiver_id, content, read, created_at
       FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [user.id, otherUserId]
    );

    const messages = result.rows;

    await pool.query(
      `UPDATE messages
       SET read = true
       WHERE sender_id = $1 AND receiver_id = $2 AND read = false`,
      [otherUserId, user.id]
    );

    await pool.end();

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    await pool.end();
    console.error('Error in messages API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
