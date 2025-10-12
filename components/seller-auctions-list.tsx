'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Auction {
  id: string;
  title: string;
  description: string;
  status: string;
  starting_price: number;
  start_date: string;
  end_date: string;
  created_at: string;
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
      {auctions.map((auction) => (
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
            <h3 className="font-semibold text-lg">{auction.title}</h3>
            <Badge 
              variant={auction.status === 'draft' ? 'secondary' : 'default'}
              className="capitalize"
            >
              {auction.status}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {auction.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <span className="text-muted-foreground">Starting Price: </span>
              <span className="font-medium">
                ${(auction.starting_price / 100).toFixed(2)}
              </span>
            </div>
            {auction.status === 'draft' && (
              <div>
                <span className="text-muted-foreground">Planned Start: </span>
                <span className="font-medium">
                  {new Date(auction.start_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          
          <div className="text-sm mt-2">
            <span className="text-muted-foreground">Ends: </span>
            <span>{new Date(auction.end_date).toLocaleString()}</span>
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
      ))}
    </div>
  );
}
