import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Auction {
  id: string;
  name: string | null;
  status: 'draft' | 'upcoming' | 'active' | 'ended' | 'cancelled';
  created_at: string;
  end_date: string;
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
      {auctions.map((auction) => (
        <Link
          key={auction.id}
          href={`/auctions/${auction.id}`}
          className="block border rounded-lg p-4 hover:bg-accent transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">
                {auction.name || 'Untitled Auction'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Created {formatDistanceToNow(new Date(auction.created_at), { addSuffix: true })}
              </p>
            </div>
            <Badge className={getStatusColor(auction.status)}>
              {auction.status}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
