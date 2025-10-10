import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { MyBidsDisplay } from '@/components/my-bids-display';

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

  if (!userBidsData || userBidsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h1 className="text-3xl font-bold mb-4">My Bids</h1>
        <p className="text-muted-foreground text-center">
          You haven't placed any bids yet. Start bidding on auctions to see them here!
        </p>
      </div>
    );
  }

  // Group bids by auction and get the user's highest bid for each
  const bidsMap = new Map<string, { bid: any; auction: any }>();
  
  userBidsData.forEach((bidData) => {
    const existingBid = bidsMap.get(bidData.auction_id);
    if (!existingBid || bidData.bid_amount > existingBid.bid.bid_amount) {
      bidsMap.set(bidData.auction_id, {
        bid: bidData,
        auction: bidData.auctions
      });
    }
  });

  const auctionsWithBids = Array.from(bidsMap.values());

  // Separate into active and non-active bids
  const activeBids = auctionsWithBids.filter(({ bid, auction }) => {
    const currentBid = auction.current_bid || auction.starting_price;
    return bid.bid_amount >= currentBid;
  });

  const nonActiveBids = auctionsWithBids.filter(({ bid, auction }) => {
    const currentBid = auction.current_bid || auction.starting_price;
    return bid.bid_amount < currentBid;
  });

  // Sort by end date (closest first)
  const sortByEndDate = (a: any, b: any) => {
    return new Date(a.auction.end_date).getTime() - new Date(b.auction.end_date).getTime();
  };

  activeBids.sort(sortByEndDate);
  nonActiveBids.sort(sortByEndDate);

  return (
    <MyBidsDisplay
      activeBids={activeBids}
      nonActiveBids={nonActiveBids}
      userId={user.id}
    />
  );
}
