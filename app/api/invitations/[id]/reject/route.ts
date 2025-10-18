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

    // Update invitation to rejected
    const { error: updateError } = await supabase
      .from('connection_invitations')
      .update({ 
        status: 'rejected', 
        responded_at: new Date().toISOString() 
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      return NextResponse.json({ error: 'Failed to reject invitation' }, { status: 500 });
    }

    // Insert notification to sender
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: invitation.sender_id,
        type: 'invite_rejected',
        title: 'Connection Declined',
        message: 'Your connection request was declined',
        from_user_id: user.id,
        read: false
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
