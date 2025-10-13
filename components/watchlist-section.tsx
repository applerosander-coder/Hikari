'use client';

import { Heart } from 'lucide-react';
import { UnifiedAuctionCard } from './unified-auction-card';
import { useRouter } from 'next/navigation';
import { removeFromWatchlist } from '@/app/actions/watchlist';
import { useState } from 'react';
import { toast } from 'sonner';

interface WatchlistSectionProps {
  watchlistItems: any[];
  searchQuery: string;
  userId: string;
}

export function WatchlistSection({ watchlistItems, searchQuery }: WatchlistSectionProps) {
  const router = useRouter();
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const filterItems = (items: any[]) => {
    const now = new Date();
    
    const activeItems = items.filter((item: any) => {
      const auction = item.auction_items?.auction || item.auctions;
      if (!auction) return false;
      const endDate = new Date(auction.end_date);
      const hasEnded = endDate < now;
      return auction.status !== 'ended' && !hasEnded;
    });
    
    if (!searchQuery.trim()) return activeItems;
    const query = searchQuery.toLowerCase();
    return activeItems.filter((item: any) => {
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

  const filtered = filterItems(watchlistItems);

  const handleRemove = async (auctionId: string) => {
    setRemovingIds(prev => new Set(prev).add(auctionId));
    const result = await removeFromWatchlist(auctionId);
    
    if (result.error) {
      toast.error(result.error);
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(auctionId);
        return newSet;
      });
    } else {
      toast.success('Removed from watchlist');
      router.refresh();
    }
  };

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Watchlist Items</h3>
        <p className="text-muted-foreground">
          {searchQuery ? `No items found for "${searchQuery}"` : 'Add items to your watchlist to track them here!'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted-foreground mb-6">
        Items you're watching. Click to bid or remove from watchlist.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item: any) => {
          const auction = item.auction_items?.auction || item.auctions;
          const auctionId = auction?.id;
          
          return (
            <UnifiedAuctionCard
              key={item.id}
              item={item}
              variant="watchlist"
              onRemoveFromWatchlist={handleRemove}
              isRemoving={removingIds.has(auctionId)}
            />
          );
        })}
      </div>
    </div>
  );
}
