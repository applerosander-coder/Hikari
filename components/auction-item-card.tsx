'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuctionCountdown } from './auction-countdown';
import { WatchlistButton } from './watchlist-button';
import { Heart, Flame, Clock, TrendingUp, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import Image from 'next/image';

interface Auction {
  id: string;
  title: string;
  description?: string | null;
  starting_price: number;
  current_bid: number | null;
  image_url?: string | null;
  category?: string | null;
  end_date: string;
  status: string;
  bid_count?: number;
  winner_id?: string | null;
}

interface AuctionItemCardProps {
  auction: Auction;
  userId?: string;
  userBidAmount?: number;
  isInWatchlist?: boolean;
  showWatchlist?: boolean;
  variant?: 'default' | 'highlight' | 'compact';
  badgeType?: 'hot' | 'high-bid' | 'ending-soon' | 'won' | 'outbid' | 'watching' | null;
  onClick?: (id: string) => void;
}

export function AuctionItemCard({
  auction,
  userId,
  userBidAmount,
  isInWatchlist = false,
  showWatchlist = true,
  variant = 'default',
  badgeType = null,
  onClick
}: AuctionItemCardProps) {
  const router = useRouter();
  const currentPrice = auction.current_bid || auction.starting_price;
  
  const userHasHighestBid = userBidAmount !== undefined && userBidAmount >= currentPrice;
  const isAuctionEnded = auction.status === 'ended';

  const handleClick = () => {
    if (onClick) {
      onClick(auction.id);
    } else {
      router.push(`/auctions/${auction.id}`);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInCents / 100);
  };

  const cardWidth = variant === 'highlight' 
    ? 'w-[280px] sm:w-[320px]' 
    : variant === 'compact'
    ? 'w-[240px] sm:w-[280px]'
    : '';

  const imageHeight = variant === 'highlight' 
    ? 'h-[180px]' 
    : variant === 'compact'
    ? 'h-[160px]'
    : 'h-48';

  const determineBadge = () => {
    if (badgeType === 'won') {
      return (
        <Badge className="absolute top-4 left-4 z-10 bg-black dark:bg-white text-white dark:text-black">
          <Trophy className="h-3 w-3 mr-1" />
          Won
        </Badge>
      );
    }

    if (badgeType === 'hot' && auction.bid_count && auction.bid_count > 0) {
      return (
        <Badge className="absolute top-4 left-4 bg-black dark:bg-white text-white dark:text-black font-bold">
          <Flame className="h-3 w-3 mr-1" />
          {auction.bid_count} {auction.bid_count === 1 ? 'bid' : 'bids'}
        </Badge>
      );
    }

    if (badgeType === 'ending-soon') {
      return (
        <Badge className="absolute top-4 left-4 z-10 bg-black dark:bg-white text-white dark:text-black">
          <Clock className="h-3 w-3 mr-1" />
          Ending Soon
        </Badge>
      );
    }

    if (auction.category && !badgeType && variant !== 'highlight') {
      return (
        <Badge className="absolute top-2 left-2 bg-white/90 dark:bg-black/90 text-black dark:text-white pointer-events-none">
          {auction.category}
        </Badge>
      );
    }

    return null;
  };

  const determineStatusBadge = () => {
    if (badgeType === 'high-bid' || (userHasHighestBid && !isAuctionEnded)) {
      return (
        <Badge className="absolute top-4 right-4 z-10 bg-black dark:bg-white text-white dark:text-black">
          <Heart className="h-3 w-3 mr-1 fill-current" />
          High Bid
        </Badge>
      );
    }

    if (badgeType === 'outbid') {
      return (
        <Badge className="absolute top-4 right-4 z-10" variant="outline">
          Outbid
        </Badge>
      );
    }

    if (badgeType === 'watching') {
      return (
        <Badge className="absolute top-4 left-4 z-10 bg-white dark:bg-black text-black dark:text-white">
          <Heart className="h-3 w-3 mr-1" />
          Watching
        </Badge>
      );
    }

    return null;
  };

  return (
    <Card
      className={cn(
        "flex-shrink-0 overflow-hidden transition-all hover:scale-105 hover:shadow-lg",
        cardWidth,
        (badgeType === 'high-bid' || userHasHighestBid) && "ring-2 ring-black dark:ring-white"
      )}
    >
      <div 
        className={cn("relative bg-muted cursor-pointer", imageHeight)}
        onClick={handleClick}
      >
        {auction.image_url ? (
          <Image
            src={auction.image_url}
            alt={auction.title}
            fill
            className="object-cover pointer-events-none"
          />
        ) : (
          <div className="flex items-center justify-center h-full pointer-events-none">
            {badgeType === 'won' ? (
              <Trophy className="h-12 w-12 text-muted-foreground" />
            ) : (
              <TrendingUp className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
        )}

        {determineBadge()}
        {determineStatusBadge()}

        {showWatchlist && !badgeType?.includes('won') && (
          <div className="absolute top-2 right-2 z-50 pointer-events-auto">
            <WatchlistButton
              auctionId={auction.id}
              isInWatchlist={isInWatchlist}
              variant="icon"
            />
          </div>
        )}
      </div>

      <CardContent 
        className="p-4 cursor-pointer"
        onClick={handleClick}
      >
        <h3 className="font-semibold text-sm mb-2 line-clamp-1">
          {auction.title}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {isAuctionEnded ? 'Final Price' : 'Current Bid'}
            </span>
            <span className="font-bold">{formatPrice(currentPrice)}</span>
          </div>

          <div className="text-xs text-muted-foreground">
            {isAuctionEnded ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Auction Ended</span>
              </div>
            ) : (
              <AuctionCountdown endDate={auction.end_date} compact />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
