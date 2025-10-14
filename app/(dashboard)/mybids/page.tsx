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

  // Fetch all bids made by the user with auction/item details
  // Support both auction items (new) and legacy auctions
  const { data: userBidsData } = await supabase
    .from('bids')
    .select(`
      *,
      auction_items (
        *,
        auction:auctions (*)
      ),
      auctions (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch watchlist items (support both auction items and legacy auctions)
  const { data: watchlistData } = await supabase
    .from('watchlist')
    .select(`
      *,
      auction_items (
        *,
        auction:auctions (*)
      ),
      auctions (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch won auction items (where user is the winner)
  const { data: wonItemsData } = await supabase
    .from('auction_items')
    .select(`
      *,
      auction:auctions(*),
      payments(*)
    `)
    .eq('winner_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch won legacy auctions (where user is the winner)
  const { data: wonAuctionsData } = await supabase
    .from('auctions')
    .select('*, payments(*)')
    .eq('winner_id', user.id)
    .eq('status', 'ended')
    .order('end_date', { ascending: false });
  
  // Normalize won items to match UnifiedAuctionCard expected structure
  const normalizedWonItems = (wonItemsData || []).map(item => ({
    ...item,
    auction_items: item, // Wrap in expected structure
  }));

  // Normalize won auctions to match UnifiedAuctionCard expected structure
  const normalizedWonAuctions = (wonAuctionsData || []).map(auction => ({
    ...auction,
    auctions: auction, // Wrap in expected structure
  }));
  
  // Combine won items and won auctions
  const combinedWonData = [...normalizedWonItems, ...normalizedWonAuctions];

  return (
    <MyBidsPageClient
      userBidsData={userBidsData || []}
      watchlistData={watchlistData || []}
      wonAuctionsData={combinedWonData}
      userId={user.id}
    />
  );
}
