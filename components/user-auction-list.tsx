'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback } from 'react';

interface AuctionItem {
  id: string;
  image_url: string | null;
  image_urls: string[] | null;
  title: string;
}

interface Auction {
  id: string;
  name: string | null;
  status: 'draft' | 'upcoming' | 'active' | 'ended' | 'cancelled';
  created_at: string;
  end_date: string;
  auction_items?: AuctionItem[];
}

interface UserAuctionListProps {
  auctions: Auction[];
}

export function UserAuctionList({ auctions }: UserAuctionListProps) {
  if (auctions.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No auctions hosted yet.
      </p>
    );
  }

  const getActualStatus = (auction: Auction): Auction['status'] => {
    const now = new Date();
    const endDate = new Date(auction.end_date);
    
    // If auction has ended (end_date is in the past), show as ended
    if (endDate < now && auction.status !== 'draft' && auction.status !== 'cancelled') {
      return 'ended';
    }
    
    // Otherwise use the database status
    return auction.status;
  };

  const getStatusColor = (status: Auction['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'ended':
        return 'bg-gray-500';
      case 'draft':
        return 'bg-yellow-500';
      case 'upcoming':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-3">
      {auctions.map((auction) => {
        const actualStatus = getActualStatus(auction);
        
        return (
          <div key={auction.id} className="border rounded-lg p-4">
            <Link
              href={`/auctions/${auction.id}`}
              className="block hover:opacity-80 transition-opacity"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 break-words">
                    {auction.name || 'Untitled Auction'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Created {formatDistanceToNow(new Date(auction.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Badge className={getStatusColor(actualStatus)}>
                  {actualStatus}
                </Badge>
              </div>
            </Link>

            {auction.auction_items && auction.auction_items.length > 0 && (
              <AuctionItemCarousel items={auction.auction_items} auctionId={auction.id} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function AuctionItemCarousel({ items, auctionId }: { items: AuctionItem[]; auctionId: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const getItemImage = (item: AuctionItem): string | null => {
    if (item.image_urls && item.image_urls.length > 0) {
      return item.image_urls[0];
    }
    return item.image_url;
  };

  return (
    <div className="relative group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2">
          {items.map((item) => {
            const imageUrl = getItemImage(item);
            return (
              <Link
                key={item.id}
                href={`/auctions/${auctionId}/items/${item.id}`}
                className="flex-shrink-0 w-24 h-24 relative rounded-md overflow-hidden border hover:border-primary transition-colors"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground p-2 text-center">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {items.length > 3 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background border rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous items"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background border rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next items"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
