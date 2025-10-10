import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { SwipeableAuctionBrowser } from '@/components/swipeable-auction-browser';

export default async function DashboardPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const { data: auctions } = await supabase
    .from('auctions')
    .select('*')
    .in('status', ['active', 'upcoming'])
    .order('end_date', { ascending: true });

  const { data: userBids } = await supabase
    .from('bids')
    .select('auction_id')
    .eq('user_id', user.id);

  const userBidAuctionIds = userBids?.map((bid) => bid.auction_id) || [];

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      <SwipeableAuctionBrowser
        auctions={auctions || []}
        userBidAuctionIds={userBidAuctionIds}
        userId={user.id}
      />
    </div>
  );
}
