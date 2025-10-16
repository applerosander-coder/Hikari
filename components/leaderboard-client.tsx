'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Clock, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  'Electronics',
  'Fashion & Accessories',
  'Services & Experiences',
  'Collectibles & Art',
  'Home & Living',
  'Sports & Hobbies',
  'Other'
];

type SortType = 'latest' | 'highest';

interface LeaderboardClientProps {
  items: any[];
  auctions: any[];
}

export function LeaderboardClient({ items, auctions }: LeaderboardClientProps) {
  const router = useRouter();
  const [selectedAuction, setSelectedAuction] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortType>('latest');

  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    // Filter by auction
    if (selectedAuction !== 'all') {
      filtered = filtered.filter(item => item.auction_id === selectedAuction);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Sort items
    if (sortBy === 'latest') {
      filtered.sort((a, b) => {
        const aTime = a.latestBidTime ? new Date(a.latestBidTime).getTime() : 0;
        const bTime = b.latestBidTime ? new Date(b.latestBidTime).getTime() : 0;
        return bTime - aTime;
      });
    } else {
      filtered.sort((a, b) => {
        const aPrice = a.current_bid || a.starting_bid || 0;
        const bPrice = b.current_bid || b.starting_bid || 0;
        return bPrice - aPrice;
      });
    }

    return filtered;
  }, [items, selectedAuction, selectedCategory, sortBy]);

  // Calculate total amount raised for selected auction (regardless of category filter)
  const totalAmountRaised = useMemo(() => {
    if (selectedAuction === 'all') return 0;
    
    // Filter only by auction, not by category, to get the full auction total
    const auctionItems = items.filter(item => item.auction_id === selectedAuction);
    
    return auctionItems.reduce((total, item) => {
      const highestBid = item.current_bid || item.starting_bid || 0;
      return total + highestBid;
    }, 0) / 100; // Convert from cents to dollars
  }, [items, selectedAuction]);

  const getTimeStatus = (item: any) => {
    const endDate = item.auction?.end_date ? new Date(item.auction.end_date) : null;
    const now = new Date();

    if (!endDate) return 'No end date';
    
    if (endDate <= now) {
      return <span className="text-muted-foreground">Ended</span>;
    }

    return (
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {formatDistanceToNow(endDate, { addSuffix: true })}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 hidden sm:block">
        <h1 className="text-2xl sm:text-3xl font-bold">Leaderboard</h1>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide mb-4">
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
          All Items ({items.length})
        </button>

        {/* Category Pills */}
        {CATEGORIES.map((category) => {
          const categoryCount = items.filter(item => item.category === category).length;
          if (categoryCount === 0) return null;
          
          return (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSelectedAuction('all');
              }}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                ${selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              {category} ({categoryCount})
            </button>
          );
        })}

        {/* Auction Pills */}
        {(() => {
          const now = new Date();
          
          // Map all auctions with their metadata
          const mappedAuctions = auctions.map((auction) => {
            const auctionItems = items.filter(i => i.auction_id === auction.id);
            const endDate = auction.end_date ? new Date(auction.end_date) : null;
            const hasEnded = endDate && endDate <= now;
            const isActive = !hasEnded && auctionItems.length > 0;
            
            return {
              auction,
              itemCount: auctionItems.length,
              isActive,
              endDate
            };
          });
          
          // Separate live and ended auctions
          const liveAuctions = mappedAuctions.filter(a => a.isActive);
          const endedAuctions = mappedAuctions
            .filter(a => !a.isActive && a.itemCount > 0)
            .sort((a, b) => {
              if (!a.endDate) return 1;
              if (!b.endDate) return -1;
              return b.endDate.getTime() - a.endDate.getTime();
            })
            .slice(0, 3); // Limit to 3 most recent ended auctions
          
          // Combine: live auctions first, then limited ended auctions
          return [...liveAuctions, ...endedAuctions].map(({ auction, itemCount }) => (
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
              {auction.name} ({itemCount})
            </button>
          ));
        })()}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortType)}
          className="w-auto px-4 py-2 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="latest">Latest Bid First</option>
          <option value="highest">Highest Bid First</option>
        </select>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? 'item' : 'items'}
        </div>
        {selectedAuction !== 'all' && (
          <div className="mt-2 text-lg font-semibold">
            Total amount raised: ${totalAmountRaised.toFixed(2)}
          </div>
        )}
      </div>

      {/* Table - Desktop view */}
      <div className="border rounded-lg overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold w-[40%]">Item</th>
                <th className="text-left px-6 py-3 text-sm font-semibold w-[20%]">Category</th>
                <th className="text-right px-6 py-3 text-sm font-semibold w-[20%]">Highest Bid</th>
                <th className="text-center px-6 py-3 text-sm font-semibold w-[20%]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAndSortedItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No items found</p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedItems.map((item) => {
                  const endDate = item.auction?.end_date ? new Date(item.auction.end_date) : null;
                  const hasEnded = endDate && endDate <= new Date();
                  
                  // Display logic:
                  // - If active and has current_bid: show current bid
                  // - If active and no current_bid: show starting bid
                  // - If ended and has current_bid: show winning bid
                  // - If ended and no current_bid: show starting bid
                  // Note: All prices are stored in cents, so divide by 100 for display
                  const displayBid = (item.current_bid || item.starting_bid || 0) / 100;
                  const hasBids = item.current_bid && item.current_bid > 0;
                  
                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => router.push(`/auctions/${item.auction_id}/items/${item.id}`)}
                      className={`hover:bg-muted/30 transition-colors cursor-pointer ${hasEnded ? 'opacity-60' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{item.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                        {item.category || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="font-semibold">${displayBid.toFixed(2)}</div>
                        {!hasBids && (
                          <div className="text-xs text-muted-foreground">Starting bid</div>
                        )}
                        {hasBids && hasEnded && (
                          <div className="text-xs text-muted-foreground">Winning bid</div>
                        )}
                        {hasBids && !hasEnded && (
                          <div className="text-xs text-muted-foreground">Current bid</div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center text-sm">
                        {getTimeStatus(item)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No items found</p>
          </div>
        ) : (
          filteredAndSortedItems.map((item) => {
            const endDate = item.auction?.end_date ? new Date(item.auction.end_date) : null;
            const hasEnded = endDate && endDate <= new Date();
            const displayBid = (item.current_bid || item.starting_bid || 0) / 100;
            const hasBids = item.current_bid && item.current_bid > 0;

            return (
              <div 
                key={item.id}
                onClick={() => router.push(`/auctions/${item.auction_id}/items/${item.id}`)}
                className={`border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-muted/30 transition-colors ${hasEnded ? 'opacity-60' : ''}`}
              >
                {/* Item with Image */}
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.category || 'Uncategorized'}</p>
                  </div>
                </div>

                {/* Bid and Status Info */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <div className="text-lg font-semibold">${displayBid.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {!hasBids && 'Starting bid'}
                      {hasBids && hasEnded && 'Winning bid'}
                      {hasBids && !hasEnded && 'Current bid'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{getTimeStatus(item)}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
