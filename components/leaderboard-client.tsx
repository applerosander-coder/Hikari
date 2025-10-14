'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Clock, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">Track all auction items and their bidding activity</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={selectedAuction}
          onChange={(e) => setSelectedAuction(e.target.value)}
          className="w-auto max-w-[280px] sm:max-w-none px-4 py-2 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Auctions ({items.length} items)</option>
          {auctions.map((auction) => {
            const auctionItems = items.filter(i => i.auction_id === auction.id);
            const now = new Date();
            const endDate = auction.end_date ? new Date(auction.end_date) : null;
            const hasEnded = endDate && endDate <= now;
            const statusLabel = hasEnded ? 'Ended' : 'Live';
            
            return (
              <option key={auction.id} value={auction.id}>
                {auction.name} - {auction.place} ({auctionItems.length} items • {statusLabel})
              </option>
            );
          })}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-auto max-w-[280px] sm:max-w-none px-4 py-2 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortType)}
          className="w-auto max-w-[280px] sm:max-w-none px-4 py-2 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
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

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold">Item</th>
                <th className="text-left px-4 py-3 text-sm font-semibold hidden sm:table-cell">Category</th>
                <th className="text-right px-4 py-3 text-sm font-semibold">Highest Bid</th>
                <th className="text-right px-4 py-3 text-sm font-semibold hidden md:table-cell">Status</th>
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
                    <tr key={item.id} className={`hover:bg-muted/30 transition-colors ${hasEnded ? 'opacity-60' : ''}`}>
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
                            <p className="text-xs text-muted-foreground truncate sm:hidden">
                              {item.category || 'Uncategorized'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {item.category || 'Uncategorized'}
                      </td>
                      <td className="px-4 py-3 text-right">
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
                      <td className="px-4 py-3 text-right text-sm hidden md:table-cell">
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
    </div>
  );
}
