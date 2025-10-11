'use client';

import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, X, Heart, Clock, Trophy, Eye } from 'lucide-react';
import { ActiveBidsSection } from './active-bids-section';
import { EndingSoonSection } from './ending-soon-section';
import { WonAuctionsSection } from './won-auctions-section';
import { WatchlistSection } from './watchlist-section';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  // Group bids by auction and get the user's highest bid for each
  const bidsMap = new Map<string, { bid: any; auction: any }>();
  
  userBidsData.forEach((bidData) => {
    const existingBid = bidsMap.get(bidData.auction_id);
    if (!existingBid || bidData.bid_amount > existingBid.bid.bid_amount) {
      bidsMap.set(bidData.auction_id, {
        bid: bidData,
        auction: bidData.auctions
      });
    }
  });

  const auctionsWithBids = Array.from(bidsMap.values());

  // Separate into active and outbid
  const activeBids = auctionsWithBids.filter(({ bid, auction }) => {
    const currentBid = auction.current_bid || auction.starting_price;
    return bid.bid_amount >= currentBid && auction.status !== 'ended';
  });

  const outbidBids = auctionsWithBids.filter(({ bid, auction }) => {
    const currentBid = auction.current_bid || auction.starting_price;
    return bid.bid_amount < currentBid && auction.status !== 'ended';
  });

  // Get ending soon items (within 24 hours)
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const endingSoonBids = auctionsWithBids.filter(({ auction }) => {
    const endDate = new Date(auction.end_date);
    return endDate > now && endDate <= twentyFourHoursFromNow && auction.status !== 'ended';
  });

  // Get counts
  const activeBidsCount = activeBids.length;
  const endingSoonCount = endingSoonBids.length;
  const wonCount = wonAuctionsData.length;
  const watchlistCount = watchlistData.length;

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
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Active
            {activeBidsCount > 0 && (
              <span className="ml-1 rounded-full bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 text-xs font-bold">
                {activeBidsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ending-soon" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Ending Soon
            {endingSoonCount > 0 && (
              <span className="ml-1 rounded-full bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 text-xs font-bold">
                {endingSoonCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="won" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Won
            {wonCount > 0 && (
              <span className="ml-1 rounded-full bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 text-xs font-bold">
                {wonCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Watchlist
            {watchlistCount > 0 && (
              <span className="ml-1 rounded-full bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 text-xs font-bold">
                {watchlistCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ActiveBidsSection 
            activeBids={activeBids}
            outbidBids={outbidBids}
            searchQuery={searchQuery}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="ending-soon">
          <EndingSoonSection 
            endingSoonBids={endingSoonBids}
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
            watchlistItems={watchlistData}
            searchQuery={searchQuery}
            userId={userId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
