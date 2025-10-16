import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CreateAuctionForm from './create-auction-form';
import { SellerAuctionsList } from '@/components/seller-auctions-list';
import { DevTools } from '@/components/dev-tools';

export default async function SellerPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  // Fetch seller's auctions with their items
  const { data: sellerAuctions } = await supabase
    .from('auctions')
    .select(`
      *,
      auction_items (
        id,
        title,
        description,
        starting_price,
        current_bid,
        image_url,
        position
      )
    `)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="w-full px-4 sm:px-6 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 hidden sm:block">
          <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
        </div>

        {/* Create Auction Form */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create New Auction</h2>
          <CreateAuctionForm userId={user.id} />
        </div>

        {/* Your Auctions */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Auctions</h2>
          <SellerAuctionsList auctions={sellerAuctions || []} />
        </div>
      </div>
      <DevTools />
    </div>
  );
}
