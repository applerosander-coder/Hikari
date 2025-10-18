import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invitationId = params.id;

    // Fetch pending invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('connection_invitations')
      .select('id, sender_id, recipient_id, status')
      .eq('id', invitationId)
      .eq('recipient_id', user.id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Update invitation to accepted
    const { error: updateError } = await supabase
      .from('connection_invitations')
      .update({ 
        status: 'accepted', 
        responded_at: new Date().toISOString() 
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
    }

    // Insert connection (normalized order: smallest UUID first)
    const [userId, peerId] = user.id < invitation.sender_id 
      ? [user.id, invitation.sender_id] 
      : [invitation.sender_id, user.id];

    const { error: connectionError } = await supabase
      .from('connections')
      .insert({ user_id: userId, peer_id: peerId })
      .select()
      .single();

    // Ignore duplicate key error (connection already exists)
    if (connectionError && !connectionError.message.includes('duplicate')) {
      console.error('Error creating connection:', connectionError);
    }

    // Insert notification to sender
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: invitation.sender_id,
        type: 'invite_accepted',
        title: 'Connection Accepted',
        message: 'Your connection request was accepted',
        from_user_id: user.id,
        read: false
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
