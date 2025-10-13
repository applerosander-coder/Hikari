'use client';

import { Heart, AlertCircle } from 'lucide-react';
import { UnifiedAuctionCard } from './unified-auction-card';

interface ActiveBidsSectionProps {
  activeBids: any[];
  outbidBids: any[];
  searchQuery: string;
}

export function ActiveBidsSection({ activeBids, outbidBids, searchQuery }: ActiveBidsSectionProps) {
  const filterBids = (bids: any[]) => {
    if (!searchQuery.trim()) return bids;
    const query = searchQuery.toLowerCase();
    return bids.filter((item: any) => {
      const auction = item.auction_items?.auction || item.auctions;
      const title = item.auction_items?.title || auction?.title || '';
      const description = item.auction_items?.description || auction?.description || '';
      const category = auction?.category || '';
      
      return (
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query)
      );
    });
  };

  const filteredActive = filterBids(activeBids);
  const filteredOutbid = filterBids(outbidBids);

  if (filteredActive.length === 0 && filteredOutbid.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Active Bids</h3>
        <p className="text-muted-foreground">
          {searchQuery ? `No bids found for "${searchQuery}"` : 'Start bidding on auctions to see them here!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {filteredActive.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 fill-current text-red-600 dark:text-red-400" />
            Winning Bids ({filteredActive.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActive.map((bidItem) => (
              <UnifiedAuctionCard
                key={bidItem.bid?.id || bidItem.id}
                item={bidItem}
                variant="active"
                userBidAmount={bidItem.bid?.bid_amount}
              />
            ))}
          </div>
        </div>
      )}

      {filteredOutbid.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            Outbid ({filteredOutbid.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOutbid.map((bidItem) => (
              <UnifiedAuctionCard
                key={bidItem.bid?.id || bidItem.id}
                item={bidItem}
                variant="outbid"
                userBidAmount={bidItem.bid?.bid_amount}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
