import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

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

    // Check if connection already exists (bidirectional check)
    const { data: existing } = await supabase
      .from('connections')
      .select('id')
      .or(`and(user_id.eq.${user.id},peer_id.eq.${connectedUserId}),and(user_id.eq.${connectedUserId},peer_id.eq.${user.id})`)
      .maybeSingle();

    // Check if there's already a pending notification (request sent but not accepted)
    const { data: pendingNotification } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', connectedUserId)
      .eq('from_user_id', user.id)
      .eq('type', 'connection_request')
      .maybeSingle();

    // Only create notification if no connection exists and no pending request
    if (!existing && !pendingNotification) {
      // Get requester's name for notification
      const { data: requesterData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      const requesterName = requesterData?.full_name || 'Someone';

      // Create notification for connection request
      await supabase
        .from('notifications')
        .insert({
          user_id: connectedUserId,
          type: 'connection_request',
          title: 'Connection Request',
          message: `${requesterName} wants to connect with you`,
          from_user_id: user.id,
          read: false
        });
    }

    return NextResponse.json({ success: true, isConnected: !!existing });
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

    // Delete connection (bidirectional)
    // RLS ensures user can only delete their own connections
    await supabase
      .from('connections')
      .delete()
      .or(`and(user_id.eq.${user.id},peer_id.eq.${connectedUserId}),and(user_id.eq.${connectedUserId},peer_id.eq.${user.id})`);

    // Also delete any pending connection_request notifications
    await supabase
      .from('notifications')
      .delete()
      .eq('type', 'connection_request')
      .or(`and(user_id.eq.${user.id},from_user_id.eq.${connectedUserId}),and(user_id.eq.${connectedUserId},from_user_id.eq.${user.id})`);

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

    // Check for connection (bidirectional)
    const { data: connection } = await supabase
      .from('connections')
      .select('id')
      .or(`and(user_id.eq.${user.id},peer_id.eq.${connectedUserId}),and(user_id.eq.${connectedUserId},peer_id.eq.${user.id})`)
      .maybeSingle();

    // Check for pending notification (connection request sent)
    const { data: pendingNotification } = await supabase
      .from('notifications')
      .select('id')
      .eq('type', 'connection_request')
      .or(`and(user_id.eq.${connectedUserId},from_user_id.eq.${user.id}),and(user_id.eq.${user.id},from_user_id.eq.${connectedUserId})`)
      .maybeSingle();

    return NextResponse.json({ 
      isConnected: !!connection,
      status: connection ? 'accepted' : (pendingNotification ? 'pending' : null),
      isPending: !!pendingNotification && !connection
    });
  } catch (error) {
    console.error('Error checking connect status:', error);
    return NextResponse.json({ error: 'Failed to check connect status' }, { status: 500 });
  }
}
