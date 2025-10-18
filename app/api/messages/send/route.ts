import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { receiver_id, content } = body;

    if (!receiver_id || !content || content.trim() === '') {
      await pool.end();
      return NextResponse.json(
        { error: 'Receiver ID and content are required' },
        { status: 400 }
      );
    }

    // Check if users are connected (bidirectional)
    const connectionResult = await pool.query(
      `SELECT status FROM connects
       WHERE (user_id = $1 AND connected_user_id = $2)
          OR (user_id = $2 AND connected_user_id = $1)
       LIMIT 1`,
      [user.id, receiver_id]
    );

    if (connectionResult.rows.length === 0 || connectionResult.rows[0].status !== 'accepted') {
      await pool.end();
      return NextResponse.json(
        { error: 'You can only message connected users' },
        { status: 403 }
      );
    }

    // Insert message using Pool (same database as reads)
    const insertResult = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content, read, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [user.id, receiver_id, content.trim(), false]
    );

    await pool.end();

    const message = insertResult.rows[0];
    return NextResponse.json({ message });
  } catch (error) {
    await pool.end();
    console.error('Error in send message API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
