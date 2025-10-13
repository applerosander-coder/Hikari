'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles, TrendingUp, Heart, AlertCircle } from 'lucide-react';
import { AuctionCountdown } from './auction-countdown';
import { WatchlistButton } from './watchlist-button';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';

interface EndingSoonSectionProps {
  endingSoonBids: any[];
  searchQuery: string;
  userId: string;
}

export function EndingSoonSection({ endingSoonBids, searchQuery }: EndingSoonSectionProps) {
  const router = useRouter();

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInCents / 100);
  };

  const filterBids = (bids: any[]) => {
    if (!searchQuery.trim()) return bids;
    const query = searchQuery.toLowerCase();
    return bids.filter(({ auction }: any) => 
      (auction.title?.toLowerCase().includes(query) ||
      auction.description?.toLowerCase().includes(query) ||
      auction.category?.toLowerCase().includes(query))
    );
  };

  const filtered = filterBids(endingSoonBids);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Auctions Ending Soon</h3>
        <p className="text-muted-foreground">
          {searchQuery ? `No items found for "${searchQuery}"` : 'No auctions ending in the next 24 hours'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted-foreground mb-6">
        These auctions end within the next 24 hours. Act fast!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(({ bid, auction, isItem }: any) => {
          const currentPrice = auction.current_bid || auction.starting_price;
          const isHighBid = bid.bid_amount >= currentPrice;
          
          // Extract correct IDs for watchlist button
          const auctionId = isItem ? auction.auction?.id : auction.id;
          const itemId = isItem ? auction.id : undefined;

          return (
            <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Badge className="absolute top-4 left-4 z-10 bg-black dark:bg-white text-white dark:text-black">
                  <Clock className="h-3 w-3 mr-1" />
                  Ending Soon
                </Badge>
                <WatchlistButton
                  auctionId={auctionId}
                  itemId={itemId}
                  variant="icon"
                  className="absolute bottom-2 left-2 z-10"
                />
                {isHighBid && (
                  <Badge className="absolute top-4 right-4 z-10 bg-black dark:bg-white text-white dark:text-black">
                    <Heart className="h-3 w-3 mr-1 fill-current" />
                    High Bid
                  </Badge>
                )}
                {!isHighBid && (
                  <Badge className="absolute top-4 right-4 z-10" variant="outline">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Outbid
                  </Badge>
                )}
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
                    <span className="text-muted-foreground">Your Bid:</span>
                    <span className="font-semibold">{formatPrice(bid.bid_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current:</span>
                    <span className={cn(
                      "font-semibold",
                      isHighBid ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {formatPrice(currentPrice)}
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <AuctionCountdown endDate={auction.end_date} compact />
                </div>
                <Button
                  onClick={() => router.push(auction.path || `/auctions/${auction.id}`)}
                  className="w-full"
                  variant={isHighBid ? "default" : "outline"}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {isHighBid ? 'View Auction' : 'Place Higher Bid'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
