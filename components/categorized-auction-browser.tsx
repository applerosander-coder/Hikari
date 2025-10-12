'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { AuctionItemCard } from './auction-item-card';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuctionItem {
  id: string;
  auction_id: string;
  title: string;
  description: string | null;
  starting_price: number;
  current_bid: number | null;
  image_url: string | null;
  category: string | null;
  bid_count?: number;
  auction: {
    id: string;
    name: string;
    place: string;
    start_date: string;
    end_date: string;
    status: string;
    seller_id: string;
  } | null;
}

interface CategorizedAuctionBrowserProps {
  items: AuctionItem[];
  userBidItemIds: string[];
  userBidAmounts: Record<string, number>;
  userId: string;
  watchlistItemIds: string[];
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
  items,
  userBidItemIds,
  userBidAmounts,
  userId,
  watchlistItemIds
}: CategorizedAuctionBrowserProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.auction?.name.toLowerCase().includes(query) ||
        item.auction?.place.toLowerCase().includes(query)
      );
    });
  }, [items, searchQuery]);

  const hotItems = React.useMemo(() => {
    return [...filteredItems]
      .sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0))
      .slice(0, 10);
  }, [filteredItems]);

  const categorizedItems = React.useMemo(() => {
    const grouped: Record<string, AuctionItem[]> = {};
    
    CATEGORIES.forEach(category => {
      grouped[category] = filteredItems.filter(
        item => item.category === category
      );
    });

    const uncategorized = filteredItems.filter(
      item => !item.category || !CATEGORIES.includes(item.category)
    );
    
    if (uncategorized.length > 0) {
      grouped['Other'] = uncategorized;
    }

    return grouped;
  }, [filteredItems]);

  const handleBidNow = (itemId: string) => {
    // Find the item to get its auction_id
    const item = items.find(i => i.id === itemId);
    if (item?.auction_id) {
      router.push(`/auctions/${item.auction_id}/items/${itemId}`);
    }
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

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 max-w-5xl mx-auto">
          <p className="text-xl text-muted-foreground">
            {searchQuery ? `No items found for "${searchQuery}"` : 'No active auction items at the moment.'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {searchQuery ? 'Try a different search term' : 'Check back soon for new items!'}
          </p>
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-12">
          {hotItems.length > 0 && (
            <AuctionRow
              title="🔥 Hot Items"
              subtitle="Most popular items right now"
              items={hotItems}
              userBidItemIds={userBidItemIds}
              userBidAmounts={userBidAmounts}
              watchlistItemIds={watchlistItemIds}
              handleBidNow={handleBidNow}
              highlight
            />
          )}

          {Object.entries(categorizedItems).map(([category, categoryItems]) => 
            categoryItems.length > 0 ? (
              <AuctionRow
                key={category}
                title={category}
                items={categoryItems}
                userBidItemIds={userBidItemIds}
                userBidAmounts={userBidAmounts}
                watchlistItemIds={watchlistItemIds}
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
  items: AuctionItem[];
  userBidItemIds: string[];
  userBidAmounts: Record<string, number>;
  watchlistItemIds: string[];
  handleBidNow: (id: string) => void;
  highlight?: boolean;
}

function AuctionRow({
  title,
  subtitle,
  items,
  userBidItemIds,
  userBidAmounts,
  watchlistItemIds,
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
  }, [items]);

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
          {items.map((item) => {
            const userBidAmount = userBidAmounts[item.id];
            const currentPrice = item.current_bid || item.starting_price;
            const userHasHighestBid = userBidAmount !== undefined && userBidAmount >= currentPrice;

            // Convert item to auction format for AuctionItemCard (temporary compatibility)
            const itemAsAuction = {
              ...item,
              end_date: item.auction?.end_date || '',
              status: item.auction?.status || 'active'
            };

            return (
              <AuctionItemCard
                key={item.id}
                auction={itemAsAuction}
                userBidAmount={userBidAmount}
                isInWatchlist={watchlistItemIds.includes(item.id)}
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
