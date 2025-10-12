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

  // Fetch all auctions that are active or upcoming
  const { data: activeAuctions } = await supabase
    .from('auctions')
    .select('id')
    .in('status', ['active', 'upcoming']);

  const activeAuctionIds = activeAuctions?.map(a => a.id) || [];

  // Early return if no active auctions
  let auctionItems: any[] = [];
  let sortedItems: any[] = [];
  
  if (activeAuctionIds.length > 0) {
    // Fetch auction items with parent auction data
    const { data } = await supabase
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
      .in('auction_id', activeAuctionIds);
    
    auctionItems = data || [];

    // Sort by auction end_date (client-side since Supabase doesn't easily support ordering by foreign columns)
    sortedItems = auctionItems.sort((a, b) => {
      const aEndDate = a.auction?.end_date || '';
      const bEndDate = b.auction?.end_date || '';
      return new Date(aEndDate).getTime() - new Date(bEndDate).getTime();
    });
  }

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

  // Get bid counts per item (only for items we're displaying to reduce data transfer)
  const itemIds = sortedItems.map(item => item.id);
  let itemBids: any[] = [];
  
  if (itemIds.length > 0) {
    const { data } = await supabase
      .from('bids')
      .select('auction_item_id')
      .in('auction_item_id', itemIds);
    itemBids = data || [];
  }

  const bidCountMap = new Map<string, number>();
  itemBids.forEach((bid) => {
    if (!bid.auction_item_id) return;
    const current = bidCountMap.get(bid.auction_item_id) || 0;
    bidCountMap.set(bid.auction_item_id, current + 1);
  });

  const itemsWithBidCounts = sortedItems.map(item => ({
    ...item,
    bid_count: bidCountMap.get(item.id) || 0
  }));

  // Watchlist now tracks individual items
  const { data: watchlistData } = await supabase
    .from('watchlist')
    .select('auction_item_id')
    .eq('user_id', user.id);

  const watchlistItemIds = watchlistData?.map((item) => item.auction_item_id).filter(Boolean) || [];

  // Get list of all auctions for filter dropdown
  const { data: allAuctions } = await supabase
    .from('auctions')
    .select('id, name, place')
    .in('status', ['active', 'upcoming'])
    .order('created_at', { ascending: false });

  return (
    <CategorizedAuctionBrowser
      items={itemsWithBidCounts}
      auctions={allAuctions || []}
      userBidItemIds={userBidItemIds}
      userBidAmounts={userBidAmounts}
      userId={user.id}
      watchlistItemIds={watchlistItemIds}
    />
  );
}
