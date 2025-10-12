'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, AlertCircle, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { AuctionCountdown } from './auction-countdown';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';

interface ActiveBidsSectionProps {
  activeBids: any[];
  outbidBids: any[];
  searchQuery: string;
  userId: string;
}

export function ActiveBidsSection({ activeBids, outbidBids, searchQuery }: ActiveBidsSectionProps) {
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
      auction.title.toLowerCase().includes(query) ||
      auction.description?.toLowerCase().includes(query) ||
      auction.category?.toLowerCase().includes(query)
    );
  };

  const filteredActive = filterBids(activeBids);
  const filteredOutbid = filterBids(outbidBids);

  const renderBidCard = (bidWithAuction: any, isActive: boolean) => {
    const { bid, auction } = bidWithAuction;
    const currentPrice = auction.current_bid || auction.starting_price;

    return (
      <Card key={auction.id} className={cn(
        "overflow-hidden hover:shadow-lg transition-shadow",
        isActive && "ring-2 ring-black dark:ring-white"
      )}>
        <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {isActive && (
            <Badge className="absolute top-4 right-4 z-10 bg-black dark:bg-white text-white dark:text-black">
              <Heart className="h-3 w-3 mr-1 fill-current" />
              High Bid
            </Badge>
          )}
          {!isActive && (
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
                isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {formatPrice(currentPrice)}
              </span>
            </div>
          </div>
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              Ends in
            </div>
            <AuctionCountdown endDate={auction.end_date} />
          </div>
          <Button
            onClick={() => router.push(auction.path || `/auctions/${auction.id}`)}
            className="w-full"
            variant={isActive ? "default" : "outline"}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            {isActive ? 'View Auction' : 'Place Higher Bid'}
          </Button>
        </CardContent>
      </Card>
    );
  };

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
            <Heart className="h-5 w-5 fill-current" />
            High Bids ({filteredActive.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActive.map((bidWithAuction) => renderBidCard(bidWithAuction, true))}
          </div>
        </div>
      )}

      {filteredOutbid.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Outbid ({filteredOutbid.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOutbid.map((bidWithAuction) => renderBidCard(bidWithAuction, false))}
          </div>
        </div>
      )}
    </div>
  );
}
