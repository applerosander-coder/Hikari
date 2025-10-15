import { supabaseAdmin } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Require ADMIN_SECRET to be set
    const adminSecret = process.env.ADMIN_SECRET;
    
    if (!adminSecret) {
      console.error('ADMIN_SECRET environment variable is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Check for admin authorization
    const authHeader = request.headers.get('authorization');
    const isAuthorized = authHeader === `Bearer ${adminSecret}`;
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client to list all users
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Extract relevant user information
    const userList = users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      confirmed_at: user.confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      phone: user.phone,
      user_metadata: user.user_metadata
    }));

    return NextResponse.json({
      total: userList.length,
      users: userList
    });
  } catch (error: any) {
    console.error('Error in admin/users endpoint:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
