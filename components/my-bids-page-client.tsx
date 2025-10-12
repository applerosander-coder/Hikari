'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, X, Heart, Clock, Trophy } from 'lucide-react';
import { ActiveBidsSection } from './active-bids-section';
import { EndingSoonSection } from './ending-soon-section';
import { WonAuctionsSection } from './won-auctions-section';
import { WatchlistSection } from './watchlist-section';
import { BidSuccessCelebration } from './bid-success-celebration';

interface MyBidsPageClientProps {
  userBidsData: any[];
  watchlistData: any[];
  wonAuctionsData: any[];
  userId: string;
}

export function MyBidsPageClient({
  userBidsData,
  watchlistData,
  wonAuctionsData,
  userId
}: MyBidsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationBid, setCelebrationBid] = useState<{
    amount: number;
    auctionTitle: string;
  } | null>(null);

  // Check for tab parameter in URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['active', 'ending-soon', 'won', 'watchlist'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Check for celebration params in URL
  useEffect(() => {
    const bidSuccess = searchParams.get('bid_success');
    const auctionId = searchParams.get('auction_id');
    const auctionTitle = searchParams.get('auction_title');
    const bidAmount = searchParams.get('bid_amount');

    if (bidSuccess === 'true' && auctionId && auctionTitle && bidAmount) {
      setCelebrationBid({
        amount: parseInt(bidAmount),
        auctionTitle: decodeURIComponent(auctionTitle)
      });
      setShowCelebration(true);

      // Clean up URL params after showing celebration
      const newUrl = '/mybids';
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  // Group bids by auction/item and get the user's highest bid for each
  // Support both auction items (new) and legacy auctions
  const bidsMap = new Map<string, { bid: any; auction: any; isItem: boolean }>();
  
  userBidsData.forEach((bidData) => {
    // Determine if this is an item bid or legacy auction bid
    const isItemBid = !!bidData.auction_item_id;
    const rawId = isItemBid ? bidData.auction_item_id : bidData.auction_id;
    
    // Prefix with type to prevent ID collisions between items and auctions
    const uniqueKey = isItemBid ? `item:${rawId}` : `auction:${rawId}`;
    
    // Get auction/item data
    const auctionData = isItemBid 
      ? bidData.auction_items // Item with nested auction container
      : bidData.auctions; // Legacy auction
    
    if (!auctionData) return; // Skip if no auction data
    
    const existingBid = bidsMap.get(uniqueKey);
    if (!existingBid || bidData.bid_amount > existingBid.bid.bid_amount) {
      bidsMap.set(uniqueKey, {
        bid: bidData,
        auction: auctionData,
        isItem: isItemBid
      });
    }
  });

  const auctionsWithBids = Array.from(bidsMap.values());

  // Separate into active and outbid
  const now = new Date();
  
  const activeBids = auctionsWithBids.filter(({ bid, auction, isItem }) => {
    // For items, use item's current_bid; for legacy, use auction's current_bid
    const currentBid = auction.current_bid || auction.starting_price;
    // For items, get dates from nested auction container; for legacy, from auction itself
    const auctionContainer = isItem ? auction.auction : auction;
    const endDate = new Date(auctionContainer?.end_date || auction.end_date);
    const status = auctionContainer?.status || auction.status;
    const hasEnded = endDate < now;
    return bid.bid_amount >= currentBid && status !== 'ended' && !hasEnded;
  });

  const outbidBids = auctionsWithBids.filter(({ bid, auction, isItem }) => {
    const currentBid = auction.current_bid || auction.starting_price;
    const auctionContainer = isItem ? auction.auction : auction;
    const endDate = new Date(auctionContainer?.end_date || auction.end_date);
    const status = auctionContainer?.status || auction.status;
    const hasEnded = endDate < now;
    return bid.bid_amount < currentBid && status !== 'ended' && !hasEnded;
  });

  // Get ending soon items (within 24 hours)
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const endingSoonBids = auctionsWithBids.filter(({ auction, isItem }) => {
    const auctionContainer = isItem ? auction.auction : auction;
    const endDate = new Date(auctionContainer?.end_date || auction.end_date);
    const status = auctionContainer?.status || auction.status;
    return endDate > now && endDate <= twentyFourHoursFromNow && status !== 'ended';
  });

  // Get counts
  const activeBidsCount = activeBids.length;
  const endingSoonCount = endingSoonBids.length;
  const wonCount = wonAuctionsData.length;
  const watchlistCount = watchlistData.length;

  // Normalize data: add routing path to each entry
  const normalizedActiveBids = activeBids.map(({ bid, auction, isItem }) => ({
    bid,
    auction: {
      ...auction,
      // Add routing path based on type
      path: isItem 
        ? `/auctions/${auction.auction.id}/items/${auction.id}`
        : `/auctions/${auction.id}`
    },
    isItem
  }));

  const normalizedOutbidBids = outbidBids.map(({ bid, auction, isItem }) => ({
    bid,
    auction: {
      ...auction,
      path: isItem 
        ? `/auctions/${auction.auction.id}/items/${auction.id}`
        : `/auctions/${auction.id}`
    },
    isItem
  }));

  const normalizedEndingSoonBids = endingSoonBids.map(({ bid, auction, isItem }) => ({
    bid,
    auction: {
      ...auction,
      path: isItem 
        ? `/auctions/${auction.auction.id}/items/${auction.id}`
        : `/auctions/${auction.id}`
    },
    isItem
  }));

  // Normalize watchlist data with routing paths
  const normalizedWatchlistData = watchlistData.map((item) => {
    // Determine if this is an item or legacy auction
    const isItemWatch = !!item.auction_items;
    const auctionData = isItemWatch ? item.auction_items : item.auctions;
    
    if (!auctionData) return item;
    
    return {
      ...item,
      auctions: {
        ...auctionData,
        path: isItemWatch
          ? `/auctions/${auctionData.auction.id}/items/${auctionData.id}`
          : `/auctions/${auctionData.id}`
      }
    };
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Bids</h1>
        <p className="text-muted-foreground">Track your bids, watchlist, and won auctions</p>
      </div>

      <div className="mb-6">
        <div className="relative">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="active" className="flex items-center gap-1 sm:gap-2">
            <Heart className="h-4 w-4 hidden sm:block" />
            <span className="text-xs sm:text-sm">Active</span>
            {activeBidsCount > 0 && (
              <span className="rounded-full bg-black dark:bg-white text-white dark:text-black px-1.5 sm:px-2 py-0.5 text-xs font-bold">
                {activeBidsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ending-soon" className="flex items-center gap-1 sm:gap-2">
            <Clock className="h-4 w-4 hidden sm:block" />
            <span className="text-xs sm:text-sm">Soon</span>
            {endingSoonCount > 0 && (
              <span className="rounded-full bg-black dark:bg-white text-white dark:text-black px-1.5 sm:px-2 py-0.5 text-xs font-bold">
                {endingSoonCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="won" className="flex items-center gap-1 sm:gap-2">
            <Trophy className="h-4 w-4 hidden sm:block" />
            <span className="text-xs sm:text-sm">Won</span>
            {wonCount > 0 && (
              <span className="rounded-full bg-black dark:bg-white text-white dark:text-black px-1.5 sm:px-2 py-0.5 text-xs font-bold">
                {wonCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="flex items-center gap-1 sm:gap-2">
            <Heart className="h-4 w-4 hidden sm:block" />
            <span className="text-xs sm:text-sm">Watch</span>
            {watchlistCount > 0 && (
              <span className="rounded-full bg-black dark:bg-white text-white dark:text-black px-1.5 sm:px-2 py-0.5 text-xs font-bold">
                {watchlistCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ActiveBidsSection 
            activeBids={normalizedActiveBids}
            outbidBids={normalizedOutbidBids}
            searchQuery={searchQuery}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="ending-soon">
          <EndingSoonSection 
            endingSoonBids={normalizedEndingSoonBids}
            searchQuery={searchQuery}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="won">
          <WonAuctionsSection 
            wonAuctions={wonAuctionsData}
            searchQuery={searchQuery}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="watchlist">
          <WatchlistSection 
            watchlistItems={normalizedWatchlistData}
            searchQuery={searchQuery}
            userId={userId}
          />
        </TabsContent>
      </Tabs>

      {celebrationBid && (
        <BidSuccessCelebration
          bidAmount={celebrationBid.amount}
          auctionTitle={celebrationBid.auctionTitle}
          show={showCelebration}
          onClose={() => {
            setShowCelebration(false);
            setCelebrationBid(null);
          }}
        />
      )}
    </div>
  );
}
