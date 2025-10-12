'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AuctionCountdown } from './auction-countdown';
import { Heart, Clock, TrendingUp, Flame, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import { WatchlistButton } from './watchlist-button';

interface Auction {
  id: string;
  title: string;
  description: string | null;
  starting_price: number;
  current_bid: number | null;
  image_url: string | null;
  category: string | null;
  end_date: string;
  status: string;
  bid_count?: number;
}

interface CategorizedAuctionBrowserProps {
  auctions: Auction[];
  userBidAuctionIds: string[];
  userId: string;
  watchlistAuctionIds: string[];
}

const CATEGORIES = [
  'Electronics',
  'Fashion & Accessories',
  'Services & Experiences',
  'Collectibles & Art',
  'Home & Living',
  'Sports & Hobbies'
];

export function CategorizedAuctionBrowser({
  auctions,
  userBidAuctionIds,
  userId,
  watchlistAuctionIds
}: CategorizedAuctionBrowserProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAuctions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return auctions;
    }

    const query = searchQuery.toLowerCase();
    return auctions.filter((auction) => {
      return (
        auction.title.toLowerCase().includes(query) ||
        auction.description?.toLowerCase().includes(query) ||
        auction.category?.toLowerCase().includes(query)
      );
    });
  }, [auctions, searchQuery]);

  const hotAuctions = React.useMemo(() => {
    return [...filteredAuctions]
      .sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0))
      .slice(0, 10);
  }, [filteredAuctions]);

  const categorizedAuctions = React.useMemo(() => {
    const grouped: Record<string, Auction[]> = {};
    
    CATEGORIES.forEach(category => {
      grouped[category] = filteredAuctions.filter(
        auction => auction.category === category
      );
    });

    const uncategorized = filteredAuctions.filter(
      auction => !auction.category || !CATEGORIES.includes(auction.category)
    );
    
    if (uncategorized.length > 0) {
      grouped['Other'] = uncategorized;
    }

    return grouped;
  }, [filteredAuctions]);

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInCents / 100);
  };

  const handleBidNow = (auctionId: string) => {
    router.push(`/auctions/${auctionId}`);
  };

  return (
    <div className="w-full px-4 sm:px-6 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8 max-w-5xl mx-auto">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search auctions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 bg-background"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {filteredAuctions.length === 0 ? (
        <div className="text-center py-12 max-w-5xl mx-auto">
          <p className="text-xl text-muted-foreground">
            {searchQuery ? `No auctions found for "${searchQuery}"` : 'No active auctions at the moment.'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {searchQuery ? 'Try a different search term' : 'Check back soon for new items!'}
          </p>
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-12">
          {hotAuctions.length > 0 && (
            <AuctionRow
              title="🔥 Hot Auctions"
              subtitle="Most popular items right now"
              auctions={hotAuctions}
              userBidAuctionIds={userBidAuctionIds}
              watchlistAuctionIds={watchlistAuctionIds}
              formatPrice={formatPrice}
              handleBidNow={handleBidNow}
              highlight
            />
          )}

          {Object.entries(categorizedAuctions).map(([category, categoryAuctions]) => 
            categoryAuctions.length > 0 ? (
              <AuctionRow
                key={category}
                title={category}
                auctions={categoryAuctions}
                userBidAuctionIds={userBidAuctionIds}
                watchlistAuctionIds={watchlistAuctionIds}
                formatPrice={formatPrice}
                handleBidNow={handleBidNow}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

interface AuctionRowProps {
  title: string;
  subtitle?: string;
  auctions: Auction[];
  userBidAuctionIds: string[];
  watchlistAuctionIds: string[];
  formatPrice: (price: number) => string;
  handleBidNow: (id: string) => void;
  highlight?: boolean;
}

function AuctionRow({
  title,
  subtitle,
  auctions,
  userBidAuctionIds,
  watchlistAuctionIds,
  formatPrice,
  handleBidNow,
  highlight = false
}: AuctionRowProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  React.useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [auctions]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative">
      <div className="mb-4 px-4">
        <h2 className={cn(
          "font-bold",
          highlight ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
        )}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {auctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              userHasBid={userBidAuctionIds.includes(auction.id)}
              isInWatchlist={watchlistAuctionIds.includes(auction.id)}
              formatPrice={formatPrice}
              handleBidNow={handleBidNow}
              highlight={highlight}
            />
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}

interface AuctionCardProps {
  auction: Auction;
  userHasBid: boolean;
  isInWatchlist: boolean;
  formatPrice: (price: number) => string;
  handleBidNow: (id: string) => void;
  highlight?: boolean;
}

function AuctionCard({
  auction,
  userHasBid,
  isInWatchlist,
  formatPrice,
  handleBidNow,
  highlight = false
}: AuctionCardProps) {
  const currentPrice = auction.current_bid || auction.starting_price;

  return (
    <Card
      className={cn(
        "flex-shrink-0 overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-lg",
        highlight ? "w-[280px] sm:w-[320px]" : "w-[240px] sm:w-[280px]"
      )}
      onClick={() => handleBidNow(auction.id)}
    >
      <div className={cn("relative bg-muted", highlight ? "h-[180px]" : "h-[160px]")}>
        {auction.image_url ? (
          <Image
            src={auction.image_url}
            alt={auction.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <TrendingUp className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {auction.category && !highlight && (
          <Badge className="absolute top-2 left-2 bg-white/90 dark:bg-black/90 text-black dark:text-white">
            {auction.category}
          </Badge>
        )}

        <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
          <WatchlistButton
            auctionId={auction.id}
            isInWatchlist={isInWatchlist}
            variant="icon"
          />
        </div>

        {highlight && auction.bid_count && auction.bid_count > 0 && (
          <Badge className="absolute top-2 left-2 bg-black dark:bg-white text-white dark:text-black font-bold">
            <Flame className="h-3 w-3 mr-1" />
            {auction.bid_count} {auction.bid_count === 1 ? 'bid' : 'bids'}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-1">
          {auction.title}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Bid</span>
            <span className="font-bold">{formatPrice(currentPrice)}</span>
          </div>

          <div className="text-xs text-muted-foreground">
            <AuctionCountdown endDate={auction.end_date} compact />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
