import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { ConnectionsClient } from '@/components/connections-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ConnectionsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // Fetch followers (people following this user)
  const { data: followers } = await supabase
    .from('follows')
    .select('*, follower:users!follower_id(id, full_name, avatar_url, email)')
    .eq('following_id', user.id)
    .eq('status', 'accepted');

  // Fetch following (people this user follows)
  const { data: following } = await supabase
    .from('follows')
    .select('*, following:users!following_id(id, full_name, avatar_url, email)')
    .eq('follower_id', user.id)
    .eq('status', 'accepted');

  // Fetch pending follow requests sent by this user
  const { data: pendingSent } = await supabase
    .from('follows')
    .select('*, following:users!following_id(id, full_name, avatar_url, email)')
    .eq('follower_id', user.id)
    .eq('status', 'pending');

  // Fetch pending follow requests received by this user
  const { data: pendingReceived } = await supabase
    .from('follows')
    .select('*, follower:users!follower_id(id, full_name, avatar_url, email)')
    .eq('following_id', user.id)
    .eq('status', 'pending');

  return (
    <ConnectionsClient
      userId={user.id}
      followers={followers || []}
      following={following || []}
      pendingSent={pendingSent || []}
      pendingReceived={pendingReceived || []}
    />
  );
}
