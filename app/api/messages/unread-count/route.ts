import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count unread messages using Supabase
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .is('read_at', null);

    if (error) {
      console.error('Error fetching unread messages count:', error);
      return NextResponse.json(
        { error: 'Failed to fetch unread messages count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error('Error fetching unread messages count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread messages count' },
      { status: 500 }
    );
  }
}
