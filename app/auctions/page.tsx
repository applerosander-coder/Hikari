'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hammer, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AuctionCountdown } from '@/components/auction-countdown';

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAuctions() {
      try {
        const response = await fetch('/api/auctions');
        if (!response.ok) throw new Error('Failed to fetch auctions');
        const data = await response.json();
        setAuctions(data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAuctions();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p>Loading auctions...</p>
        </div>
      </div>
    );
  }

  const activeAuctions = auctions.filter(a => a.status === 'active');
  const upcomingAuctions = auctions.filter(a => a.status === 'upcoming');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Live Auctions</h1>
        <p className="text-muted-foreground">Place your bids on amazing items before time runs out!</p>
      </div>

      {activeAuctions.length === 0 && upcomingAuctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Hammer className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Active Auctions</h2>
          <p className="text-muted-foreground max-w-md">
            There are no active auctions at the moment. Check back soon for exciting new items!
          </p>
        </div>
      ) : (
        <>
          {activeAuctions.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Active Auctions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeAuctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            </section>
          )}

          {upcomingAuctions.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Upcoming Auctions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingAuctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} isUpcoming />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function AuctionCard({ auction, isUpcoming = false }: { auction: any; isUpcoming?: boolean }) {
  const currentBid = auction.current_bid || auction.starting_price;
  const formattedPrice = (currentBid / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  const creator = auction.users;
  const creatorName = creator?.full_name || 'Unknown';
  const creatorAvatar = creator?.avatar_url;

  return (
    <Link href={`/auctions/${auction.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 w-full bg-muted">
          {auction.image_url ? (
            <Image
              src={auction.image_url}
              alt={auction.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Hammer className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <Badge className="absolute top-2 right-2">
            {isUpcoming ? 'Upcoming' : 'Live'}
          </Badge>
        </div>
        
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link 
              href={`/profile/${auction.created_by}`} 
              onClick={(e) => e.stopPropagation()}
              className="hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={creatorAvatar || ''} alt={creatorName} />
                <AvatarFallback className="text-xs">
                  {creatorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <h3 className="font-semibold text-lg line-clamp-2">{auction.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{creatorName}</p>
          {auction.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{auction.description}</p>
          )}
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Current Bid</p>
              <p className="text-2xl font-bold text-primary">{formattedPrice}</p>
            </div>
            {auction.current_bid && (
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  {Math.floor(Math.random() * 15) + 3} bids
                </span>
              </div>
            )}
          </div>

          <AuctionCountdown 
            endDate={isUpcoming ? auction.start_date : auction.end_date} 
            compact 
          />
        </CardContent>

        <CardFooter>
          <Button className="w-full" variant={isUpcoming ? "outline" : "default"}>
            {isUpcoming ? 'View Details' : 'Place Bid'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
