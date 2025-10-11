import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { MyBidsPageClient } from '@/components/my-bids-page-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MyBidsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // Fetch all bids made by the user with auction details
  const { data: userBidsData } = await supabase
    .from('bids')
    .select('*, auctions(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch watchlist items
  const { data: watchlistData } = await supabase
    .from('watchlist')
    .select('*, auctions(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch won auctions (where user is the winner)
  const { data: wonAuctionsData } = await supabase
    .from('auctions')
    .select('*, payments(*)')
    .eq('winner_id', user.id)
    .eq('status', 'ended')
    .order('end_date', { ascending: false });

  return (
    <MyBidsPageClient
      userBidsData={userBidsData || []}
      watchlistData={watchlistData || []}
      wonAuctionsData={wonAuctionsData || []}
      userId={user.id}
    />
  );
}
