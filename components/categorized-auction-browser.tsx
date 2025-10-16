'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuctionItemCard } from './auction-item-card';
import { Search, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface Auction {
  id: string;
  name: string;
  place: string;
}

interface CategorizedAuctionBrowserProps {
  items: AuctionItem[];
  endedItems?: AuctionItem[];
  auctions: Auction[];
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
  'Sports & Hobbies',
  'Other'
];

export function CategorizedAuctionBrowser({
  items,
  endedItems = [],
  auctions,
  userBidItemIds,
  userBidAmounts,
  userId,
  watchlistItemIds
}: CategorizedAuctionBrowserProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuction, setSelectedAuction] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showArchive, setShowArchive] = useState(false);

  const filteredItems = React.useMemo(() => {
    const now = new Date();
    
    // First, exclude items from ended auctions (by time)
    let filtered = items.filter(item => {
      const endDate = item.auction?.end_date ? new Date(item.auction.end_date) : null;
      return !endDate || endDate > now;
    });

    // Debug logging
    if (selectedCategory !== 'all') {
      console.log('Selected category:', selectedCategory);
      console.log('Items with categories:', filtered.map(item => ({ 
        id: item.id, 
        title: item.title, 
        category: item.category 
      })));
    }

    // Filter by selected auction
    if (selectedAuction !== 'all') {
      filtered = filtered.filter(item => item.auction_id === selectedAuction);
    }

    // Filter by selected category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
      console.log('Filtered items after category filter:', filtered.length);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.auction?.name.toLowerCase().includes(query) ||
          item.auction?.place.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [items, searchQuery, selectedAuction, selectedCategory]);

  const filteredEndedItems = React.useMemo(() => {
    const now = new Date();
    
    // Include both:
    // 1. Items explicitly marked as ended
    // 2. Items from active auctions that have ended by time
    const allEndedItems = [
      ...endedItems,
      ...items.filter(item => {
        const endDate = item.auction?.end_date ? new Date(item.auction.end_date) : null;
        return endDate && endDate <= now;
      })
    ];
    
    // Remove duplicates
    const uniqueEndedItems = allEndedItems.filter((item, index, self) => 
      index === self.findIndex((t) => t.id === item.id)
    );
    
    let filtered = uniqueEndedItems;

    // Filter by selected auction
    if (selectedAuction !== 'all') {
      filtered = filtered.filter(item => item.auction_id === selectedAuction);
    }

    // Filter by selected category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.auction?.name.toLowerCase().includes(query) ||
          item.auction?.place.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [items, endedItems, searchQuery, selectedAuction, selectedCategory]);

  const hotItems = React.useMemo(() => {
    return [...filteredItems]
      .sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0))
      .slice(0, 10);
  }, [filteredItems]);

  // Group active items by auction
  const auctionGroups = React.useMemo(() => {
    const grouped: Record<string, AuctionItem[]> = {};
    
    filteredItems.forEach(item => {
      const auctionKey = item.auction?.name || 'Other';
      if (!grouped[auctionKey]) {
        grouped[auctionKey] = [];
      }
      grouped[auctionKey].push(item);
    });

    return grouped;
  }, [filteredItems]);

  // Group ended items by auction
  const endedAuctionGroups = React.useMemo(() => {
    const grouped: Record<string, AuctionItem[]> = {};
    
    filteredEndedItems.forEach(item => {
      const auctionKey = item.auction?.name || 'Other';
      if (!grouped[auctionKey]) {
        grouped[auctionKey] = [];
      }
      grouped[auctionKey].push(item);
    });

    return grouped;
  }, [filteredEndedItems]);

  const handleBidNow = (itemId: string) => {
    // Find the item to get its auction_id
    const item = items.find(i => i.id === itemId);
    if (item?.auction_id) {
      router.push(`/auctions/${item.auction_id}/items/${itemId}`);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8 max-w-5xl mx-auto space-y-4">
        {/* Filter Pills - Auctions Only */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {/* All Items Pill */}
          <button
            onClick={() => {
              setSelectedAuction('all');
              setSelectedCategory('all');
            }}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${selectedAuction === 'all' && selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }
            `}
          >
            All Items ({items.length + endedItems.length})
          </button>

          {/* Auction Pills */}
          {(() => {
            const now = new Date();
            
            // Map all auctions with their metadata
            const mappedAuctions = auctions.map((auction) => {
              const activeCount = items.filter(i => i.auction_id === auction.id).length;
              const endedCount = endedItems.filter(i => i.auction_id === auction.id).length;
              const totalCount = activeCount + endedCount;
              
              // Check if auction has ended by time
              const auctionItem = [...items, ...endedItems].find(i => i.auction_id === auction.id);
              const endDate = auctionItem?.auction?.end_date ? new Date(auctionItem.auction.end_date) : null;
              const hasEnded = endDate && endDate <= now;
              
              const isActive = !hasEnded && activeCount > 0;
              
              return {
                auction,
                totalCount,
                isActive,
                endDate
              };
            });
            
            // Separate live and ended auctions
            const liveAuctions = mappedAuctions.filter(a => a.isActive && a.totalCount > 0);
            const endedAuctions = mappedAuctions
              .filter(a => !a.isActive && a.totalCount > 0)
              .sort((a, b) => {
                if (!a.endDate) return 1;
                if (!b.endDate) return -1;
                return b.endDate.getTime() - a.endDate.getTime();
              })
              .slice(0, 3); // Limit to 3 most recent ended auctions
            
            // Combine: live auctions first, then limited ended auctions
            return [...liveAuctions, ...endedAuctions].map(({ auction, totalCount }) => (
              <button
                key={auction.id}
                onClick={() => {
                  setSelectedAuction(auction.id);
                  setSelectedCategory('all');
                }}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                  ${selectedAuction === auction.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                {auction.name} ({totalCount})
              </button>
            ));
          })()}
        </div>

        {/* Search Bar and Category Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search items, auctions, or locations..."
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

          {/* Category Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex-shrink-0 gap-2"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {selectedCategory === 'all' ? 'Category' : selectedCategory}
                </span>
                <span className="sm:hidden">
                  {selectedCategory === 'all' ? 'Filter' : selectedCategory}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'bg-muted' : ''}
              >
                All Categories
              </DropdownMenuItem>
              {CATEGORIES.map((category) => {
                const categoryCount = [...items, ...endedItems].filter(item => item.category === category).length;
                if (categoryCount === 0) return null;
                
                return (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedAuction('all');
                    }}
                    className={selectedCategory === category ? 'bg-muted' : ''}
                  >
                    <span className="flex-1">{category}</span>
                    <span className="text-xs text-muted-foreground ml-2">({categoryCount})</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredItems.length === 0 && filteredEndedItems.length === 0 ? (
        <div className="text-center py-12 max-w-5xl mx-auto">
          <p className="text-xl text-muted-foreground">
            {searchQuery ? `No items found for "${searchQuery}"` : 'No auction items at the moment.'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {searchQuery ? 'Try a different search term' : 'Check back soon for new items!'}
          </p>
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-12">
          {/* Active Auctions Section */}
          {filteredItems.length > 0 && (
            <>
              {hotItems.length > 0 && selectedAuction === 'all' && (
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

              {Object.entries(auctionGroups).map(([auctionName, auctionItems]) => {
                const auctionInfo = auctionItems[0]?.auction;
                const subtitle = auctionInfo ? `${auctionInfo.place} • ${auctionItems.length} items` : undefined;
                
                return auctionItems.length > 0 ? (
                  <AuctionRow
                    key={auctionName}
                    title={auctionName}
                    subtitle={subtitle}
                    items={auctionItems}
                    userBidItemIds={userBidItemIds}
                    userBidAmounts={userBidAmounts}
                    watchlistItemIds={watchlistItemIds}
                    handleBidNow={handleBidNow}
                  />
                ) : null;
              })}
            </>
          )}

          {/* Ended Auctions Section */}
          {filteredEndedItems.length > 0 && (
            <>
              <div className="border-t border-border pt-8 sm:pt-12">
                <div className="px-4 mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-muted-foreground">Ended Auctions</h2>
                    <p className="text-sm text-muted-foreground mt-1">Browse completed auctions</p>
                  </div>
                  {Object.entries(endedAuctionGroups).length > 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowArchive(!showArchive)}
                      className="text-sm"
                    >
                      {showArchive ? 'Show Less' : 'View Archive'}
                    </Button>
                  )}
                </div>
              </div>

              {Object.entries(endedAuctionGroups)
                .sort((a, b) => {
                  const aEndDate = a[1][0]?.auction?.end_date || '';
                  const bEndDate = b[1][0]?.auction?.end_date || '';
                  return new Date(bEndDate).getTime() - new Date(aEndDate).getTime();
                })
                .slice(0, showArchive ? undefined : 5)
                .map(([auctionName, auctionItems]) => {
                  const auctionInfo = auctionItems[0]?.auction;
                  const subtitle = auctionInfo ? `${auctionInfo.place} • ${auctionItems.length} items • Ended` : undefined;
                  
                  return auctionItems.length > 0 ? (
                    <AuctionRow
                      key={`ended-${auctionName}`}
                      title={auctionName}
                      subtitle={subtitle}
                      items={auctionItems}
                      userBidItemIds={userBidItemIds}
                      userBidAmounts={userBidAmounts}
                      watchlistItemIds={watchlistItemIds}
                      handleBidNow={handleBidNow}
                      ended
                    />
                  ) : null;
                })}
            </>
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
  ended?: boolean;
}

function AuctionRow({
  title,
  subtitle,
  items,
  userBidItemIds,
  userBidAmounts,
  watchlistItemIds,
  handleBidNow,
  highlight = false,
  ended = false
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
    <div className={`relative ${ended ? 'opacity-60' : ''}`}>
      <div className="mb-4 px-4">
        <h2 className={`${highlight ? "text-2xl sm:text-3xl font-bold" : "text-xl sm:text-2xl font-bold"} ${ended ? 'text-muted-foreground' : ''}`}>
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
          className="flex gap-4 overflow-x-auto overflow-y-visible scrollbar-hide px-4 pb-4 pt-2"
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
