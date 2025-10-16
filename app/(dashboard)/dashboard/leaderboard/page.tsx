import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { LeaderboardClient } from '@/components/leaderboard-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LeaderboardPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // Fetch all auctions
  const { data: allAuctions } = await supabase
    .from('auctions')
    .select('*')
    .order('end_date', { ascending: false });

  // Fetch creator avatars for auctions
  const creatorIds = [...new Set(allAuctions?.map(a => a.created_by).filter(Boolean) || [])];
  const { data: creators } = await supabase
    .from('users')
    .select('id, avatar_url')
    .in('id', creatorIds.length > 0 ? creatorIds : ['']);

  // Create a map of creator avatars
  const creatorAvatarMap = new Map(creators?.map(c => [c.id, c.avatar_url]) || []);

  // Attach creator avatars to auctions
  const auctionsWithAvatars = (allAuctions || []).map(auction => ({
    ...auction,
    creator_avatar: creatorAvatarMap.get(auction.created_by) || null
  }));

  // Fetch all auction items with their auction data and bid information
  const { data: allItems } = await supabase
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
    .order('created_at', { ascending: false });

  // Fetch all bids to get the latest bid time for each item
  const { data: allBids } = await supabase
    .from('bids')
    .select('auction_item_id, created_at, bid_amount')
    .order('created_at', { ascending: false });

  // Create a map of latest bid time and count for each item
  const itemBidData = new Map();
  
  allBids?.forEach(bid => {
    if (!itemBidData.has(bid.auction_item_id)) {
      itemBidData.set(bid.auction_item_id, {
        latestBidTime: bid.created_at,
        bidCount: 1
      });
    } else {
      const current = itemBidData.get(bid.auction_item_id);
      itemBidData.set(bid.auction_item_id, {
        latestBidTime: current.latestBidTime, // Already has the latest
        bidCount: current.bidCount + 1
      });
    }
  });

  // Attach bid data to items
  const itemsWithBidData = (allItems || []).map(item => ({
    ...item,
    latestBidTime: itemBidData.get(item.id)?.latestBidTime || null,
    bidCount: itemBidData.get(item.id)?.bidCount || 0
  }));

  return (
    <LeaderboardClient
      items={itemsWithBidData}
      auctions={auctionsWithAvatars}
    />
  );
}
