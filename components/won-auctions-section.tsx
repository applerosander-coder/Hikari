'use client';

import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { UnifiedAuctionCard } from './unified-auction-card';
import { Button } from '@/components/ui/button';

interface WonAuctionsSectionProps {
  wonAuctions: any[];
  endedLostBids: any[];
  searchQuery: string;
  userId: string;
}

export function WonAuctionsSection({ wonAuctions, endedLostBids, searchQuery }: WonAuctionsSectionProps) {
  const [view, setView] = useState<'won' | 'lost'>('won');
  const filterWonAuctions = (auctions: any[]) => {
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

  const filterLostBids = (bids: any[]) => {
    if (!searchQuery.trim()) return bids;
    const query = searchQuery.toLowerCase();
    return bids.filter((bidItem: any) => {
      const auction = bidItem.auction_items?.auction || bidItem.auctions || bidItem.auction;
      const title = bidItem.auction_items?.title || auction?.title || bidItem.auction?.title || '';
      const description = bidItem.auction_items?.description || auction?.description || bidItem.auction?.description || '';
      const category = auction?.category || '';
      
      return (
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query)
      );
    });
  };

  const filteredWon = filterWonAuctions(wonAuctions);
  const filteredLost = filterLostBids(endedLostBids);

  const currentItems = view === 'won' ? filteredWon : filteredLost;
  const hasWon = filteredWon.length > 0;
  const hasLost = filteredLost.length > 0;

  if (!hasWon && !hasLost) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Ended Auctions</h3>
        <p className="text-muted-foreground">
          {searchQuery ? `No ended items found for "${searchQuery}"` : 'Ended auctions will appear here!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toggle Buttons */}
      <div className="flex gap-2 border-b border-border pb-4">
        <Button
          variant={view === 'won' ? 'default' : 'outline'}
          onClick={() => setView('won')}
          className="flex items-center gap-2"
          disabled={!hasWon}
        >
          <Trophy className="h-4 w-4" />
          Won ({filteredWon.length})
        </Button>
        <Button
          variant={view === 'lost' ? 'default' : 'outline'}
          onClick={() => setView('lost')}
          className="flex items-center gap-2"
          disabled={!hasLost}
        >
          <Trophy className="h-4 w-4" />
          Lost ({filteredLost.length})
        </Button>
      </div>

      {/* Content based on selected view */}
      {view === 'won' && hasWon && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
            Won ({filteredWon.length})
          </h2>
          <p className="text-muted-foreground mb-4">
            Congratulations on your wins! Complete payment and track your items below.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWon.map((wonItem) => (
              <UnifiedAuctionCard
                key={wonItem.id}
                item={wonItem}
                variant="won"
              />
            ))}
          </div>
        </div>
      )}

      {view === 'lost' && hasLost && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-red-600 dark:text-red-400" />
            Lost - Recent 10 ({filteredLost.length})
          </h2>
          <p className="text-muted-foreground mb-4">
            Your most recent ended auctions where you didn't win.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLost.map((bidItem) => (
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
