'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AuctionCountdown } from './auction-countdown';
import { BidSuccessCelebration } from './bid-success-celebration';
import { Heart, Clock, TrendingUp, Sparkles, Search, X, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { createClient } from '@/utils/supabase/client';

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
}

interface BidWithAuction {
  bid: {
    id: string;
    auction_id: string;
    user_id: string;
    bid_amount: number;
    created_at: string;
  };
  auction: Auction;
}

interface MyBidsDisplayProps {
  activeBids: BidWithAuction[];
  nonActiveBids: BidWithAuction[];
  userId: string;
}

export function MyBidsDisplay({
  activeBids,
  nonActiveBids,
  userId
}: MyBidsDisplayProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeApi, setActiveApi] = useState<CarouselApi>();
  const [activeCurrent, setActiveCurrent] = useState(0);
  const [outbidApi, setOutbidApi] = useState<CarouselApi>();
  const [outbidCurrent, setOutbidCurrent] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationBid, setCelebrationBid] = useState<{ amount: number; title: string } | null>(null);

  React.useEffect(() => {
    if (!activeApi) return;
    
    const onSelect = () => {
      setActiveCurrent(activeApi.selectedScrollSnap());
    };
    
    setActiveCurrent(activeApi.selectedScrollSnap());
    activeApi.on('select', onSelect);
    
    return () => {
      activeApi.off('select', onSelect);
    };
  }, [activeApi]);

  React.useEffect(() => {
    if (!outbidApi) return;
    
    const onSelect = () => {
      setOutbidCurrent(outbidApi.selectedScrollSnap());
    };
    
    setOutbidCurrent(outbidApi.selectedScrollSnap());
    outbidApi.on('select', onSelect);
    
    return () => {
      outbidApi.off('select', onSelect);
    };
  }, [outbidApi]);

  useEffect(() => {
    const bidSuccess = searchParams.get('bid_success');
    const auctionId = searchParams.get('auction_id');
    const auctionTitle = searchParams.get('auction_title');
    const bidAmount = searchParams.get('bid_amount');

    if (bidSuccess === 'true' && auctionId && auctionTitle && bidAmount) {
      const checkBidWithRetry = async () => {
        const supabase = createClient();
        const maxRetries = 5;
        const delays = [0, 500, 1000, 1500, 2000]; // Total max: ~5 seconds
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          if (attempt > 0) {
            await new Promise(resolve => setTimeout(resolve, delays[attempt]));
          }
          
          const { data: userBid } = await supabase
            .from('bids')
            .select('*')
            .eq('auction_id', auctionId)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (userBid) {
            const { data: auctionData } = await supabase
              .from('auctions')
              .select('*')
              .eq('id', auctionId)
              .single();
            
            if (auctionData && auctionData.current_bid === userBid.bid_amount) {
              setCelebrationBid({
                amount: userBid.bid_amount,
                title: auctionTitle
              });
              setShowCelebration(true);
            }
            
            break; // Found the bid, exit retry loop
          }
        }
        
        router.replace('/dashboard/mybids');
        router.refresh();
      };
      
      checkBidWithRetry();
    }
  }, [searchParams, userId, router]);

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInCents / 100);
  };

  const handleViewAuction = (auctionId: string) => {
    router.push(`/auctions/${auctionId}`);
  };

  const filterBids = (bids: BidWithAuction[]) => {
    if (!searchQuery.trim()) {
      return bids;
    }

    const query = searchQuery.toLowerCase();
    return bids.filter(({ auction }) => {
      return (
        auction.title.toLowerCase().includes(query) ||
        auction.description?.toLowerCase().includes(query) ||
        auction.category?.toLowerCase().includes(query)
      );
    });
  };

  const filteredActiveBids = useMemo(() => filterBids(activeBids), [activeBids, searchQuery]);
  const filteredNonActiveBids = useMemo(() => filterBids(nonActiveBids), [nonActiveBids, searchQuery]);

  const activeLength = filteredActiveBids.length;
  const outbidLength = filteredNonActiveBids.length;

  // Reset current indices when filtered data changes
  React.useEffect(() => {
    if (activeApi && activeCurrent >= activeLength && activeLength > 0) {
      const newIndex = Math.max(0, activeLength - 1);
      setActiveCurrent(newIndex);
      activeApi.scrollTo(newIndex);
    }
  }, [activeLength, activeApi, activeCurrent]);

  React.useEffect(() => {
    if (outbidApi && outbidCurrent >= outbidLength && outbidLength > 0) {
      const newIndex = Math.max(0, outbidLength - 1);
      setOutbidCurrent(newIndex);
      outbidApi.scrollTo(newIndex);
    }
  }, [outbidLength, outbidApi, outbidCurrent]);

  const renderBidCard = (bidWithAuction: BidWithAuction, isActive: boolean, index: number, currentIndex: number) => {
    const { bid, auction } = bidWithAuction;
    const currentPrice = auction.current_bid || auction.starting_price;
    const isCentered = index === currentIndex;

    return (
      <CarouselItem key={auction.id} className="basis-[85%] sm:basis-[70%] md:basis-[65%]">
        <div className="p-2 h-full transition-all duration-500 ease-out">
          <Card
            className={cn(
              'overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl h-full flex flex-col relative',
              isActive &&
                'ring-4 ring-black dark:ring-white ring-offset-2 shadow-xl'
            )}
          >
            {isActive && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-black dark:bg-white text-white dark:text-black flex items-center gap-1 px-3 py-1">
                  <Heart className="h-4 w-4 fill-current" />
                  Your Bid
                </Badge>
              </div>
            )}
            {!isActive && (
              <div className="absolute top-4 right-4 z-10">
                <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-1 px-3 py-1">
                  <AlertCircle className="h-4 w-4" />
                  Outbid
                </Badge>
              </div>
            )}
            <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
              {auction.image_url ? (
                <img
                  src={auction.image_url}
                  alt={auction.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Sparkles className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="mb-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold line-clamp-2 flex-1 text-black dark:text-white min-h-[3.5rem]">
                    {auction.title}
                  </h3>
                </div>
                <div className="min-h-[1.5rem]">
                  {auction.category && (
                    <Badge variant="outline" className="text-xs">
                      {auction.category}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex-1" />

              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Your Bid:</span>
                  <span className="font-bold text-black dark:text-white">{formatPrice(bid.bid_amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Price:</span>
                  <span className={cn(
                    "font-bold",
                    isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {formatPrice(currentPrice)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Clock className="h-4 w-4" />
                  <span>Ends in</span>
                </div>
                <AuctionCountdown endDate={auction.end_date} />
              </div>

              <Button
                onClick={() => handleViewAuction(auction.id)}
                className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Auction
              </Button>
            </CardContent>
          </Card>
        </div>
      </CarouselItem>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-2 sm:py-4">
      <div className="mb-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search your bids..."
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

      {/* Active Bids Section */}
      {filteredActiveBids.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-black dark:text-white flex items-center gap-2">
            <Heart className="h-6 w-6 fill-current" />
            Active Bids ({filteredActiveBids.length})
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You're currently the highest bidder on these auctions
          </p>
          <div className="py-4">
            <Carousel
              setApi={setActiveApi}
              opts={{
                align: 'start',
                loop: true,
                duration: 25,
                skipSnaps: false
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {filteredActiveBids.map((bidWithAuction, index) => renderBidCard(bidWithAuction, true, index, activeCurrent))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
            
            <div className="flex justify-center gap-2 mt-6">
              {filteredActiveBids.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    activeCurrent === index ? 'w-8 bg-black dark:bg-white' : 'w-2 bg-gray-300 dark:bg-gray-600'
                  )}
                  onClick={() => activeApi?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Non-Active Bids Section */}
      {filteredNonActiveBids.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-black dark:text-white flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Outbid ({filteredNonActiveBids.length})
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Someone has placed a higher bid on these auctions
          </p>
          <div className="py-4">
            <Carousel
              setApi={setOutbidApi}
              opts={{
                align: 'start',
                loop: true,
                duration: 25,
                skipSnaps: false
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {filteredNonActiveBids.map((bidWithAuction, index) => renderBidCard(bidWithAuction, false, index, outbidCurrent))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
            
            <div className="flex justify-center gap-2 mt-6">
              {filteredNonActiveBids.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    outbidCurrent === index ? 'w-8 bg-black dark:bg-white' : 'w-2 bg-gray-300 dark:bg-gray-600'
                  )}
                  onClick={() => outbidApi?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  />
              ))}
            </div>
          </div>
        </div>
      )}

      {filteredActiveBids.length === 0 && filteredNonActiveBids.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            {searchQuery ? `No bids found for "${searchQuery}"` : 'No bids to display'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {searchQuery ? 'Try a different search term' : 'Start bidding on auctions to see them here!'}
          </p>
        </div>
      )}

      {celebrationBid && (
        <BidSuccessCelebration
          show={showCelebration}
          bidAmount={celebrationBid.amount}
          auctionTitle={celebrationBid.title}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}
