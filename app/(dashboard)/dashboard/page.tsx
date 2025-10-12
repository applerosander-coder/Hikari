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

  // Fetch auction items with parent auction data
  const { data: auctionItems } = await supabase
    .from('auction_items')
    .select(`
      *,
      auction:auctions (
        id,
        name,
        place,
        start_date,
        end_date,
        status,
        seller_id
      )
    `)
    .in('auction.status', ['active', 'upcoming'])
    .order('auction.end_date', { ascending: true });

  // Fetch user's bids (now references auction_item_id)
  const { data: userBids } = await supabase
    .from('bids')
    .select('auction_item_id, bid_amount')
    .eq('user_id', user.id);

  const userBidItemIds = userBids?.map((bid) => bid.auction_item_id) || [];
  
  const userBidAmounts: Record<string, number> = {};
  userBids?.forEach((bid) => {
    if (!bid.auction_item_id) return;
    const existing = userBidAmounts[bid.auction_item_id];
    if (!existing || bid.bid_amount > existing) {
      userBidAmounts[bid.auction_item_id] = bid.bid_amount;
    }
  });

  // Get bid counts per item
  const { data: allBids } = await supabase
    .from('bids')
    .select('auction_item_id');

  const bidCountMap = new Map<string, number>();
  allBids?.forEach((bid) => {
    if (!bid.auction_item_id) return;
    const current = bidCountMap.get(bid.auction_item_id) || 0;
    bidCountMap.set(bid.auction_item_id, current + 1);
  });

  const itemsWithBidCounts = (auctionItems || []).map(item => ({
    ...item,
    bid_count: bidCountMap.get(item.id) || 0
  }));

  // Watchlist now tracks individual items
  const { data: watchlistData } = await supabase
    .from('watchlist')
    .select('auction_item_id')
    .eq('user_id', user.id);

  const watchlistItemIds = watchlistData?.map((item) => item.auction_item_id).filter(Boolean) || [];

  return (
    <CategorizedAuctionBrowser
      items={itemsWithBidCounts}
      userBidItemIds={userBidItemIds}
      userBidAmounts={userBidAmounts}
      userId={user.id}
      watchlistItemIds={watchlistItemIds}
    />
  );
}
