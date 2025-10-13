'use client';

import { Trophy } from 'lucide-react';
import { UnifiedAuctionCard } from './unified-auction-card';

interface WonAuctionsSectionProps {
  wonAuctions: any[];
  searchQuery: string;
  userId: string;
}

export function WonAuctionsSection({ wonAuctions, searchQuery }: WonAuctionsSectionProps) {
  const filterAuctions = (auctions: any[]) => {
    if (!searchQuery.trim()) return auctions;
    const query = searchQuery.toLowerCase();
    return auctions.filter((item: any) => {
      const title = item.title || '';
      const description = item.description || '';
      const category = item.category || item.auction?.category || '';
      
      return (
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query)
      );
    });
  };

  const filtered = filterAuctions(wonAuctions);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Won Auctions</h3>
        <p className="text-muted-foreground">
          {searchQuery ? `No won items found for "${searchQuery}"` : 'Win an auction to see it here!'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted-foreground mb-6">
        Congratulations on your wins! Complete payment and track your items below.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((wonItem) => (
          <UnifiedAuctionCard
            key={wonItem.id}
            item={wonItem}
            variant="won"
          />
        ))}
      </div>
    </div>
  );
}
