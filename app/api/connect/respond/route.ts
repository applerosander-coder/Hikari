import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requesterId, action, skipConfirmation } = await request.json();

    if (!requesterId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    // Check if the connection request still exists
    const checkResult = await pool.query(
      'SELECT id FROM connects WHERE user_id = $1 AND connected_user_id = $2 AND status = $3',
      [requesterId, user.id, 'pending']
    );

    if (checkResult.rows.length === 0) {
      await pool.end();
      return NextResponse.json({ error: 'Connection request not found or already processed' }, { status: 404 });
    }

    // Update connection status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await pool.query(
      'UPDATE connects SET status = $1 WHERE user_id = $2 AND connected_user_id = $3',
      [newStatus, requesterId, user.id]
    );

    // If accepted, create reciprocal connection for bidirectional relationship
    if (action === 'accept') {
      await pool.query(
        `INSERT INTO connects (user_id, connected_user_id, status) 
         VALUES ($1, $2, 'accepted') 
         ON CONFLICT (user_id, connected_user_id) 
         DO UPDATE SET status = 'accepted'`,
        [user.id, requesterId]
      );
    }

    // If user chose to skip confirmation in the future, save preference
    if (skipConfirmation && action === 'accept') {
      await pool.query(
        `INSERT INTO user_preferences (user_id, skip_connection_confirmation)
         VALUES ($1, TRUE)
         ON CONFLICT (user_id) 
         DO UPDATE SET skip_connection_confirmation = TRUE, updated_at = NOW()`,
        [user.id]
      );
    }

    // Delete the connection request notification
    await pool.query(
      `DELETE FROM notifications 
       WHERE user_id = $1 
       AND from_user_id = $2 
       AND type = 'connection_request'`,
      [user.id, requesterId]
    );

    await pool.end();

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('Error responding to connection request:', error);
    return NextResponse.json({ error: 'Failed to respond to connection request' }, { status: 500 });
  }
}
