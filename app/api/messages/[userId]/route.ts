import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  let pool: Pool | null = null;
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const otherUserId = params.userId;

    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    // Fetch messages between current user and other user
    // RLS policies still apply at database level
    const messagesResult = await pool.query(
      `SELECT id, sender_id, receiver_id, content, read_at, created_at
       FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [user.id, otherUserId]
    );

    // Mark messages as read
    await pool.query(
      `UPDATE messages 
       SET read_at = NOW() 
       WHERE sender_id = $1 
         AND receiver_id = $2 
         AND read_at IS NULL`,
      [otherUserId, user.id]
    );

    return NextResponse.json({ messages: messagesResult.rows || [] });
  } catch (error) {
    console.error('Error in messages API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
