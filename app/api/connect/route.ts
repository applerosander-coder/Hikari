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

    const { connectedUserId } = await request.json();

    if (!connectedUserId) {
      return NextResponse.json({ error: 'Missing connectedUserId' }, { status: 400 });
    }

    if (user.id === connectedUserId) {
      return NextResponse.json({ error: 'Cannot connect with yourself' }, { status: 400 });
    }

    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    // Check if connection request already exists
    const existingResult = await pool.query(
      'SELECT id, status FROM connects WHERE user_id = $1 AND connected_user_id = $2',
      [user.id, connectedUserId]
    );

    const existingConnection = existingResult.rows[0];

    // Only create/update request and notification if it's new or was rejected
    if (!existingConnection || existingConnection.status === 'rejected') {
      if (existingConnection?.status === 'rejected') {
        // Update rejected request back to pending
        await pool.query(
          `UPDATE connects 
           SET status = 'pending', created_at = NOW() 
           WHERE user_id = $1 AND connected_user_id = $2`,
          [user.id, connectedUserId]
        );
      } else {
        // Insert new connection request with pending status
        await pool.query(
          `INSERT INTO connects (user_id, connected_user_id, status) 
           VALUES ($1, $2, 'pending')`,
          [user.id, connectedUserId]
        );
      }

      // Get requester's name for notification
      const requesterResult = await pool.query(
        'SELECT full_name FROM users WHERE id = $1',
        [user.id]
      );
      const requesterName = requesterResult.rows[0]?.full_name || 'Someone';

      // Create notification for the user being requested to connect
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, from_user_id, read) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          connectedUserId,
          'connection_request',
          'Connection Request',
          `${requesterName} wants to connect with you`,
          user.id,
          false
        ]
      );
    }

    await pool.end();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error connecting with user:', error);
    return NextResponse.json({ error: 'Failed to connect with user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectedUserId = searchParams.get('connectedUserId');

    if (!connectedUserId) {
      return NextResponse.json({ error: 'Missing connectedUserId' }, { status: 400 });
    }

    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    // Delete connection in both directions for bidirectional relationship
    await pool.query(
      `DELETE FROM connects 
       WHERE (user_id = $1 AND connected_user_id = $2) 
       OR (user_id = $2 AND connected_user_id = $1)`,
      [user.id, connectedUserId]
    );

    // Also delete any pending connection_request notifications
    await pool.query(
      `DELETE FROM notifications 
       WHERE type = 'connection_request' 
       AND ((user_id = $1 AND from_user_id = $2) OR (user_id = $2 AND from_user_id = $1))`,
      [user.id, connectedUserId]
    );

    await pool.end();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting from user:', error);
    return NextResponse.json({ error: 'Failed to disconnect from user' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectedUserId = searchParams.get('connectedUserId');

    if (!connectedUserId) {
      return NextResponse.json({ error: 'Missing connectedUserId' }, { status: 400 });
    }

    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    // Check for connection in both directions
    const result = await pool.query(
      `SELECT status FROM connects 
       WHERE (user_id = $1 AND connected_user_id = $2) 
       OR (user_id = $2 AND connected_user_id = $1)
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id, connectedUserId]
    );

    await pool.end();

    const connection = result.rows[0];
    return NextResponse.json({ 
      isConnected: connection?.status === 'accepted',
      status: connection?.status || null,
      isPending: connection?.status === 'pending'
    });
  } catch (error) {
    console.error('Error checking connect status:', error);
    return NextResponse.json({ error: 'Failed to check connect status' }, { status: 500 });
  }
}
