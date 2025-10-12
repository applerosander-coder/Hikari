import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { CategorizedAuctionBrowser } from '@/components/categorized-auction-browser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    .select('auction_id, bid_amount')
    .eq('user_id', user.id);

  const userBidAuctionIds = userBids?.map((bid) => bid.auction_id) || [];
  
  const userBidAmounts: Record<string, number> = {};
  userBids?.forEach((bid) => {
    const existing = userBidAmounts[bid.auction_id];
    if (!existing || bid.bid_amount > existing) {
      userBidAmounts[bid.auction_id] = bid.bid_amount;
    }
  });

  const { data: bidCounts } = await supabase.rpc('get_auction_bid_counts');

  const bidCountMap = new Map<string, number>();
  bidCounts?.forEach((item: { auction_id: string; bid_count: number }) => {
    bidCountMap.set(item.auction_id, item.bid_count);
  });

  const auctionsWithBidCounts = (auctions || []).map(auction => ({
    ...auction,
    bid_count: bidCountMap.get(auction.id) || 0
  }));

  const { data: watchlistData } = await supabase
    .from('watchlist')
    .select('auction_id')
    .eq('user_id', user.id);

  const watchlistAuctionIds = watchlistData?.map((item) => item.auction_id) || [];

  return (
    <CategorizedAuctionBrowser
      auctions={auctionsWithBidCounts}
      userBidAuctionIds={userBidAuctionIds}
      userBidAmounts={userBidAmounts}
      userId={user.id}
      watchlistAuctionIds={watchlistAuctionIds}
    />
  );
}
