'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, TrendingUp, Clock, X } from 'lucide-react';
import { AuctionCountdown } from './auction-countdown';
import { WatchlistButton } from './watchlist-button';
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

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInCents / 100);
  };

  const filterItems = (items: any[]) => {
    const now = new Date();
    
    // First filter out ended auctions
    const activeItems = items.filter((item: any) => {
      const auction = item.auctions;
      const endDate = new Date(auction.end_date);
      const hasEnded = endDate < now;
      return auction.status !== 'ended' && !hasEnded;
    });
    
    // Then filter by search query
    if (!searchQuery.trim()) return activeItems;
    const query = searchQuery.toLowerCase();
    return activeItems.filter((item: any) => {
      const auction = item.auctions;
      return (
        auction.title.toLowerCase().includes(query) ||
        auction.description?.toLowerCase().includes(query) ||
        auction.category?.toLowerCase().includes(query)
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
          const auction = item.auctions;
          const currentPrice = auction.current_bid || auction.starting_price;
          const isRemoving = removingIds.has(auction.id);

          return (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
              <button
                onClick={() => handleRemove(auction.id)}
                disabled={isRemoving}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white dark:bg-black border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors disabled:opacity-50"
                aria-label="Remove from watchlist"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Badge className="absolute top-4 left-4 z-10 bg-black dark:bg-white text-white dark:text-black">
                  <Heart className="h-3 w-3 mr-1" />
                  Watching
                </Badge>
                {auction.image_url ? (
                  <img
                    src={auction.image_url}
                    alt={auction.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Sparkles className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-base mb-2 line-clamp-2">{auction.title}</h3>
                {auction.category && (
                  <Badge variant="outline" className="text-xs mb-3">{auction.category}</Badge>
                )}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Price:</span>
                    <span className="font-bold">{formatPrice(currentPrice)}</span>
                  </div>
                </div>
                {auction.status !== 'ended' && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      Ends in
                    </div>
                    <AuctionCountdown endDate={auction.end_date} compact />
                  </div>
                )}
                <Button
                  onClick={() => router.push(auction.path || `/auctions/${auction.id}`)}
                  className="w-full"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Place Bid
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
