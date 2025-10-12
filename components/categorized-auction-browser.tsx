'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { AuctionItemCard } from './auction-item-card';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

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
  userBidAmounts: Record<string, number>;
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
  userBidAmounts,
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
              userBidAmounts={userBidAmounts}
              watchlistAuctionIds={watchlistAuctionIds}
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
                userBidAmounts={userBidAmounts}
                watchlistAuctionIds={watchlistAuctionIds}
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
  userBidAmounts: Record<string, number>;
  watchlistAuctionIds: string[];
  handleBidNow: (id: string) => void;
  highlight?: boolean;
}

function AuctionRow({
  title,
  subtitle,
  auctions,
  userBidAuctionIds,
  userBidAmounts,
  watchlistAuctionIds,
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
        <h2 className={highlight ? "text-2xl sm:text-3xl font-bold" : "text-xl sm:text-2xl font-bold"}>
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
          {auctions.map((auction) => {
            const userBidAmount = userBidAmounts[auction.id];
            const currentPrice = auction.current_bid || auction.starting_price;
            const userHasHighestBid = userBidAmount !== undefined && userBidAmount >= currentPrice;

            return (
              <AuctionItemCard
                key={auction.id}
                auction={auction}
                userBidAmount={userBidAmount}
                isInWatchlist={watchlistAuctionIds.includes(auction.id)}
                showWatchlist={true}
                variant={highlight ? 'highlight' : 'compact'}
                badgeType={highlight ? 'hot' : userHasHighestBid ? 'high-bid' : null}
                onClick={handleBidNow}
              />
            );
          })}
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
