import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { CategorizedAuctionBrowser } from '@/components/categorized-auction-browser';
import { DevTools } from '@/components/dev-tools';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // Fetch active/upcoming auctions
  const { data: activeAuctions } = await supabase
    .from('auctions')
    .select('id')
    .in('status', ['active', 'upcoming']);

  const activeAuctionIds = activeAuctions?.map(a => a.id) || [];

  // Fetch ended auctions (last 10 for freshness)
  const { data: endedAuctions } = await supabase
    .from('auctions')
    .select('id')
    .eq('status', 'ended')
    .order('end_date', { ascending: false })
    .limit(10);

  const endedAuctionIds = endedAuctions?.map(a => a.id) || [];

  // Fetch active/ongoing items
  let activeItems: any[] = [];
  if (activeAuctionIds.length > 0) {
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
          created_by
        )
      `)
      .in('auction_id', activeAuctionIds);
    
    activeItems = (data || []).sort((a, b) => {
      const aEndDate = a.auction?.end_date || '';
      const bEndDate = b.auction?.end_date || '';
      return new Date(aEndDate).getTime() - new Date(bEndDate).getTime();
    });
  }

  // Fetch ended items
  let endedItems: any[] = [];
  if (endedAuctionIds.length > 0) {
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
          created_by
        )
      `)
      .in('auction_id', endedAuctionIds);
    
    endedItems = (data || []).sort((a, b) => {
      const aEndDate = a.auction?.end_date || '';
      const bEndDate = b.auction?.end_date || '';
      return new Date(bEndDate).getTime() - new Date(aEndDate).getTime();
    });
  }

  const allItems = [...activeItems, ...endedItems];
  const sortedItems = activeItems;

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

  // Get bid counts for ended items too
  const endedItemIds = endedItems.map(item => item.id);
  let endedItemBids: any[] = [];
  
  if (endedItemIds.length > 0) {
    const { data } = await supabase
      .from('bids')
      .select('auction_item_id')
      .in('auction_item_id', endedItemIds);
    endedItemBids = data || [];
  }

  endedItemBids.forEach((bid) => {
    if (!bid.auction_item_id) return;
    const current = bidCountMap.get(bid.auction_item_id) || 0;
    bidCountMap.set(bid.auction_item_id, current + 1);
  });

  const endedItemsWithBidCounts = endedItems.map(item => ({
    ...item,
    bid_count: bidCountMap.get(item.id) || 0
  }));

  // Get list of all auctions for filter dropdown with seller info
  const { data: allAuctions, error: auctionsError } = await supabase
    .from('auctions')
    .select(`
      id, 
      title, 
      location, 
      status,
      created_by
    `)
    .in('status', ['active', 'upcoming', 'ended'])
    .order('created_at', { ascending: false });

  if (auctionsError) {
    console.error('Error fetching auctions:', auctionsError);
  }

  // Fetch seller info for each auction separately to avoid RLS issues
  let auctionsWithSellers = allAuctions || [];
  if (allAuctions && allAuctions.length > 0) {
    const sellerIds = [...new Set(allAuctions.map(a => a.created_by).filter(Boolean))];
    
    if (sellerIds.length > 0) {
      const { data: sellers } = await supabase
        .from('users')
        .select('id, avatar_url, full_name')
        .in('id', sellerIds);
      
      const sellerMap = new Map(sellers?.map(s => [s.id, s]) || []);
      
      auctionsWithSellers = allAuctions.map(auction => ({
        ...auction,
        users: auction.created_by ? sellerMap.get(auction.created_by) : null
      }));
    }
  }

  // Map to match expected interface (name -> title, place -> location)
  const auctionsWithMapping = auctionsWithSellers.map(auction => ({
    ...auction,
    name: auction.title,
    place: auction.location
  }));

  return (
    <>
      <div className="w-full px-4 sm:px-6 pt-4 sm:pt-8">
        <div className="mb-6 hidden sm:block">
          <h1 className="text-3xl font-bold">Auctions</h1>
        </div>
      </div>
      <CategorizedAuctionBrowser
        items={itemsWithBidCounts}
        endedItems={endedItemsWithBidCounts}
        auctions={auctionsWithMapping}
        userBidItemIds={userBidItemIds}
        userBidAmounts={userBidAmounts}
        userId={user.id}
        watchlistItemIds={watchlistItemIds}
      />
      <DevTools />
    </>
  );
}
