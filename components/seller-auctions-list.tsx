'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import Image from 'next/image';

interface AuctionItem {
  id: string;
  title: string;
  description: string;
  starting_price: number;
  current_bid: number | null;
  image_url: string | null;
  position: number;
}

interface Auction {
  id: string;
  name: string | null;
  place: string | null;
  title: string;
  description: string;
  status: string;
  starting_price: number;
  start_date: string;
  end_date: string;
  created_at: string;
  auction_items?: AuctionItem[];
}

interface SellerAuctionsListProps {
  auctions: Auction[];
}

export function SellerAuctionsList({ auctions }: SellerAuctionsListProps) {
  const router = useRouter();

  if (auctions.length === 0) {
    return (
      <div className="border border-dashed rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          You haven't created any auctions yet. Use the form to create your first auction!
        </p>
      </div>
    );
  }

  const handleAuctionClick = (auction: Auction, action: 'edit' | 'preview' = 'edit') => {
    if (auction.status === 'draft') {
      if (action === 'preview') {
        router.push(`/seller/preview/${auction.id}`);
      } else {
        router.push(`/seller/edit/${auction.id}`);
      }
    } else {
      router.push(`/auctions/${auction.id}`);
    }
  };

  return (
    <div className="space-y-4">
      {auctions.map((auction) => {
        const itemCount = auction.auction_items?.length || 0;
        const hasItems = itemCount > 0;
        
        return (
          <div
            key={auction.id}
            className={`border rounded-lg p-4 transition-all ${
              auction.status === 'draft'
                ? 'hover:shadow-lg hover:border-gray-400'
                : 'cursor-pointer hover:shadow-md'
            }`}
            onClick={() => auction.status !== 'draft' && handleAuctionClick(auction)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {auction.name || auction.title}
                </h3>
                {auction.place && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    📍 {auction.place}
                  </p>
                )}
              </div>
              <Badge 
                variant={auction.status === 'draft' ? 'secondary' : 'default'}
                className="capitalize"
              >
                {auction.status}
              </Badge>
            </div>
            
            {/* Item Count and Preview */}
            {hasItems ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                </div>
                
                {/* Show first 3 items as preview */}
                <div className="grid grid-cols-3 gap-2">
                  {auction.auction_items?.slice(0, 3).map((item) => (
                    <div key={item.id} className="relative aspect-square rounded border overflow-hidden">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {itemCount > 3 && (
                    <div className="relative aspect-square rounded border overflow-hidden bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">+{itemCount - 3}</span>
                    </div>
                  )}
                </div>

                {/* Item titles preview */}
                <div className="text-xs text-muted-foreground">
                  {auction.auction_items?.slice(0, 2).map((item, i) => (
                    <div key={item.id}>
                      • {item.title}
                    </div>
                  ))}
                  {itemCount > 2 && <div>• and {itemCount - 2} more...</div>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {auction.description}
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm border-t pt-3">
              <div>
                <span className="text-muted-foreground">Start: </span>
                <span className="font-medium">
                  {new Date(auction.start_date).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">End: </span>
                <span className="font-medium">
                  {new Date(auction.end_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {auction.status === 'draft' && (
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleAuctionClick(auction, 'edit');
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleAuctionClick(auction, 'preview');
                  }}
                >
                  Preview
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
