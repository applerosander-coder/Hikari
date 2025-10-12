import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CreateAuctionForm from './create-auction-form';
import { SellerAuctionsList } from '@/components/seller-auctions-list';

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your auction containers with multiple items
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Auction Form */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Create New Auction</h2>
            <CreateAuctionForm userId={user.id} />
          </div>

          {/* Auction Preview & My Auctions */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Auctions</h2>
            <SellerAuctionsList auctions={sellerAuctions || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
