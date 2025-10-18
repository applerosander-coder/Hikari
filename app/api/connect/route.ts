import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectedUserId, message } = await request.json();

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

    if (existing) {
      return NextResponse.json({ success: true, isConnected: true });
    }

    // Check if there's already a pending invitation
    const { data: pendingInvitation } = await supabase
      .from('connection_invitations')
      .select('id')
      .eq('sender_id', user.id)
      .eq('recipient_id', connectedUserId)
      .eq('status', 'pending')
      .maybeSingle();

    if (pendingInvitation) {
      return NextResponse.json({ success: true, isConnected: false, isPending: true });
    }

    // Create new connection invitation
    const { error: inviteError } = await supabase
      .from('connection_invitations')
      .insert({
        sender_id: user.id,
        recipient_id: connectedUserId,
        message: message || null,
        status: 'pending',
      });

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      return NextResponse.json({ error: 'Failed to send connection request' }, { status: 500 });
    }

    return NextResponse.json({ success: true, isConnected: false, isPending: true });
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
    await supabase
      .from('connections')
      .delete()
      .or(`and(user_id.eq.${user.id},peer_id.eq.${connectedUserId}),and(user_id.eq.${connectedUserId},peer_id.eq.${user.id})`);

    // Also delete any pending invitations (sent or received)
    await supabase
      .from('connection_invitations')
      .delete()
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${connectedUserId}),and(sender_id.eq.${connectedUserId},recipient_id.eq.${user.id})`);

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

    if (connection) {
      return NextResponse.json({ 
        isConnected: true,
        status: 'accepted',
        isPending: false,
      });
    }

    // Check for pending invitation (sent or received)
    const { data: pendingInvitation } = await supabase
      .from('connection_invitations')
      .select('id, sender_id')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${connectedUserId}),and(sender_id.eq.${connectedUserId},recipient_id.eq.${user.id})`)
      .eq('status', 'pending')
      .maybeSingle();

    return NextResponse.json({ 
      isConnected: false,
      status: pendingInvitation ? 'pending' : null,
      isPending: !!pendingInvitation,
      sentByMe: pendingInvitation?.sender_id === user.id,
    });
  } catch (error) {
    console.error('Error checking connect status:', error);
    return NextResponse.json({ error: 'Failed to check connect status' }, { status: 500 });
  }
}
