import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { MessagesClient } from '@/components/messages-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MessagesPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // Fetch received messages
  const { data: receivedMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('to_user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch sent messages  
  const { data: sentMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('from_user_id', user.id)
    .order('created_at', { ascending: false });

  // Get user details for all participants
  const userIds = [
    ...new Set([
      ...(receivedMessages || []).map(m => m.from_user_id),
      ...(sentMessages || []).map(m => m.to_user_id)
    ])
  ];

  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, avatar_url')
    .in('id', userIds.length > 0 ? userIds : ['']);

  const userMap = new Map(users?.map(u => [u.id, u]) || []);

  const receivedWithUsers = (receivedMessages || []).map(msg => ({
    ...msg,
    from_user: userMap.get(msg.from_user_id),
  }));

  const sentWithUsers = (sentMessages || []).map(msg => ({
    ...msg,
    to_user: userMap.get(msg.to_user_id),
  }));

  return (
    <MessagesClient
      userId={user.id}
      receivedMessages={receivedWithUsers}
      sentMessages={sentWithUsers}
    />
  );
}
