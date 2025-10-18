import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { receiver_id, content } = body;

    if (!receiver_id || !content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Receiver ID and content are required' },
        { status: 400 }
      );
    }

    const { data: connection, error: connectionError } = await supabase
      .from('connects')
      .select('status')
      .or(`and(user_id.eq.${user.id},connected_user_id.eq.${receiver_id}),and(user_id.eq.${receiver_id},connected_user_id.eq.${user.id})`)
      .eq('status', 'accepted')
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'You can only message connected users' },
        { status: 403 }
      );
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id,
        content: content.trim(),
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error in send message API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
