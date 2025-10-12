import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CreateAuctionForm from './create-auction-form';

export default async function SellerPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  // Fetch seller's auctions
  const { data: sellerAuctions } = await supabase
    .from('auctions')
    .select('*, bids(count)')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="w-full px-4 sm:px-6 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your auctions
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
            
            {sellerAuctions && sellerAuctions.length > 0 ? (
              <div className="space-y-4">
                {sellerAuctions.map((auction) => (
                  <div
                    key={auction.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{auction.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {auction.description}
                        </p>
                        <div className="flex gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Status: </span>
                            <span className="font-medium capitalize">{auction.status}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Starting Price: </span>
                            <span className="font-medium">
                              ${(auction.starting_price / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm mt-2">
                          <span className="text-muted-foreground">Ends: </span>
                          <span>{new Date(auction.end_date).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  You haven't created any auctions yet. Use the form to create your first auction!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
