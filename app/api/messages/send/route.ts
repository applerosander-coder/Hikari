import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
  let pool: Pool | null = null;
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiver_id, content } = await request.json();

    if (!receiver_id || !content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Receiver ID and content are required' },
        { status: 400 }
      );
    }

    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    // Verify connection exists
    const connectionCheck = await pool.query(
      `SELECT 1 FROM connects 
       WHERE ((user_id = $1 AND connected_user_id = $2) 
           OR (user_id = $2 AND connected_user_id = $1))
         AND status = 'accepted'`,
      [user.id, receiver_id]
    );

    if (connectionCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'You can only message connected users' },
        { status: 403 }
      );
    }

    // Insert message
    // RLS policies ensure sender_id matches authenticated user
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, sender_id, receiver_id, content, read_at, created_at`,
      [user.id, receiver_id, content.trim()]
    );

    return NextResponse.json({ message: result.rows[0] });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
