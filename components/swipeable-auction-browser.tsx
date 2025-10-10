'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { Heart, Clock, TrendingUp, Sparkles, Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';

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

interface SwipeableAuctionBrowserProps {
  auctions: Auction[];
  userBidAuctionIds: string[];
  userId: string;
}

export function SwipeableAuctionBrowser({
  auctions,
  userBidAuctionIds,
  userId
}: SwipeableAuctionBrowserProps) {
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const filteredAuctions = useMemo(() => {
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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
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
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-black dark:text-white">
            Live Auctions
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Swipe through amazing items and services. Your bids are highlighted!
          </p>
        </div>
      </div>

      {filteredAuctions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            {searchQuery ? `No auctions found for "${searchQuery}"` : 'No active auctions at the moment.'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {searchQuery ? 'Try a different search term' : 'Check back soon for new items!'}
          </p>
        </div>
      ) : (
        <>
          <Carousel
            setApi={setApi}
            className="w-full"
            opts={{
              align: 'center',
              loop: true
            }}
          >
            <CarouselContent>
              {filteredAuctions.map((auction) => {
                const hasUserBid = userBidAuctionIds.includes(auction.id);
                const currentPrice = auction.current_bid || auction.starting_price;

                return (
                  <CarouselItem key={auction.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-2">
                      <Card
                        className={cn(
                          'overflow-hidden transition-all duration-300 hover:shadow-2xl',
                          hasUserBid &&
                            'ring-4 ring-black dark:ring-white ring-offset-2 shadow-xl relative'
                        )}
                      >
                        {hasUserBid && (
                          <div className="absolute top-4 right-4 z-10">
                            <Badge className="bg-black dark:bg-white text-white dark:text-black flex items-center gap-1 px-3 py-1">
                              <Heart className="h-4 w-4 fill-current" />
                              Your Bid
                            </Badge>
                          </div>
                        )}

                        <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                          {auction.image_url ? (
                            <img
                              src={auction.image_url}
                              alt={auction.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Sparkles className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                          
                          {auction.category && (
                            <Badge className="absolute top-4 left-4 bg-white/90 dark:bg-black/90 text-black dark:text-white">
                              {auction.category}
                            </Badge>
                          )}
                        </div>

                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-2 line-clamp-2">
                            {auction.title}
                          </h3>
                          
                          {auction.description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {auction.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Current Bid</p>
                              <p className="text-2xl font-bold text-black dark:text-white">
                                {formatPrice(currentPrice)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                <Clock className="inline h-3 w-3 mr-1" />
                                Ends In
                              </p>
                              <AuctionCountdown endDate={auction.end_date} compact />
                            </div>
                          </div>

                          <Button
                            onClick={() => handleBidNow(auction.id)}
                            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all"
                            size="lg"
                          >
                            <TrendingUp className="mr-2 h-4 w-4" />
                            {hasUserBid ? 'View Your Bid' : 'Bid Now'}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>

          <div className="flex justify-center gap-2 mt-6">
            {filteredAuctions.map((_, index) => (
              <button
                key={index}
                className={cn(
                  'h-2 rounded-full transition-all',
                  current === index ? 'w-8 bg-black dark:bg-white' : 'w-2 bg-gray-300 dark:bg-gray-600'
                )}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {current + 1} of {filteredAuctions.length} auctions
            </p>
          </div>
        </>
      )}
    </div>
  );
}
