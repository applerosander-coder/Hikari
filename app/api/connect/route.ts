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

    // Insert connect relationship
    await pool.query(
      `INSERT INTO connects (user_id, connected_user_id) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, connected_user_id) DO NOTHING`,
      [user.id, connectedUserId]
    );

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

    await pool.query(
      'DELETE FROM connects WHERE user_id = $1 AND connected_user_id = $2',
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

    const result = await pool.query(
      'SELECT id FROM connects WHERE user_id = $1 AND connected_user_id = $2',
      [user.id, connectedUserId]
    );

    await pool.end();

    return NextResponse.json({ isConnected: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking connect status:', error);
    return NextResponse.json({ error: 'Failed to check connect status' }, { status: 500 });
  }
}
