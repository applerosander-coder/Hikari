import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

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

    // Check if the connection request notification exists
    const { data: notification } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('from_user_id', requesterId)
      .eq('type', 'connection_request')
      .maybeSingle();

    if (!notification) {
      return NextResponse.json({ error: 'Connection request not found or already processed' }, { status: 404 });
    }

    if (action === 'accept') {
      // Create connection (single row for bidirectional relationship)
      // Use the normalized order to avoid duplicates
      const [userId, peerId] = user.id < requesterId ? [user.id, requesterId] : [requesterId, user.id];
      
      await supabase
        .from('connections')
        .insert({
          user_id: userId,
          peer_id: peerId
        });
    }

    // If user chose to skip confirmation in the future, save preference
    if (skipConfirmation && action === 'accept') {
      // Check if preference exists
      const { data: existingPref } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingPref) {
        await supabase
          .from('user_preferences')
          .update({ 
            skip_connection_confirmation: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            skip_connection_confirmation: true
          });
      }
    }

    // Delete the connection request notification
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
      .eq('from_user_id', requesterId)
      .eq('type', 'connection_request');

    return NextResponse.json({ success: true, status: action === 'accept' ? 'accepted' : 'rejected' });
  } catch (error) {
    console.error('Error responding to connection request:', error);
    return NextResponse.json({ error: 'Failed to respond to connection request' }, { status: 500 });
  }
}
