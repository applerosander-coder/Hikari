'use client';

import { Clock } from 'lucide-react';
import { UnifiedAuctionCard } from './unified-auction-card';

interface EndingSoonSectionProps {
  endingSoonBids: any[];
  searchQuery: string;
}

export function EndingSoonSection({ endingSoonBids, searchQuery }: EndingSoonSectionProps) {
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

  const filtered = filterBids(endingSoonBids);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Bids Ending Soon</h3>
        <p className="text-muted-foreground">
          {searchQuery ? `No items found for "${searchQuery}"` : 'Bids ending within 24 hours will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted-foreground mb-6">
        Your bids that are ending within the next 24 hours. Act fast!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((bidItem) => (
          <UnifiedAuctionCard
            key={bidItem.bid?.id || bidItem.id}
            item={bidItem}
            variant="ending-soon"
            userBidAmount={bidItem.bid?.bid_amount}
          />
        ))}
      </div>
    </div>
  );
}
