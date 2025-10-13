'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, TrendingUp, Clock, Trophy, CheckCircle2, AlertCircle, CreditCard, Package, Truck, X } from 'lucide-react';
import { AuctionCountdown } from './auction-countdown';
import { WatchlistButton } from './watchlist-button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface UnifiedAuctionCardProps {
  item: any;
  variant: 'active' | 'outbid' | 'won' | 'watchlist' | 'ending-soon';
  userBidAmount?: number;
  onRemoveFromWatchlist?: (id: string) => void;
  isRemoving?: boolean;
}

export function UnifiedAuctionCard({ 
  item, 
  variant, 
  userBidAmount,
  onRemoveFromWatchlist,
  isRemoving = false 
}: UnifiedAuctionCardProps) {
  const router = useRouter();

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInCents / 100);
  };

  const getAuctionData = () => {
    // Handle MyBids page structure: { bid, auction, isItem }
    if (item.bid && item.auction) {
      const auction = item.auction;
      const isItem = item.isItem;
      
      if (isItem) {
        // auction is an auction_item with nested auction container
        const auctionContainer = auction.auction;
        return {
          id: auction.id,
          auctionId: auctionContainer?.id || auction.auction_id,
          itemId: auction.id,
          title: auction.title,
          description: auction.description,
          category: auctionContainer?.category || auction.category,
          image_url: auction.image_url,
          current_bid: auction.current_bid,
          starting_price: auction.starting_price,
          reserve_price: auction.reserve_price,
          end_date: auctionContainer?.end_date || auction.end_date,
          status: auctionContainer?.status || auction.status,
          path: auction.path || `/auctions/${auctionContainer?.id || auction.auction_id}/items/${auction.id}`,
          isItem: true,
          winner_id: auction.winner_id,
          payments: auction.payments
        };
      } else {
        // auction is a legacy auction
        return {
          id: auction.id,
          auctionId: auction.id,
          itemId: null,
          title: auction.title,
          description: auction.description,
          category: auction.category,
          image_url: auction.image_url,
          current_bid: auction.current_bid,
          starting_price: auction.starting_price,
          reserve_price: auction.reserve_price,
          end_date: auction.end_date,
          status: auction.status,
          path: auction.path || `/auctions/${auction.id}`,
          isItem: false,
          winner_id: auction.winner_id,
          payments: auction.payments
        };
      }
    }
    // Handle watchlist/won structure: { auction_items } or { auctions }
    else if (item.auction_items) {
      const auctionItem = item.auction_items;
      return {
        id: auctionItem.id,
        auctionId: auctionItem.auction_id,
        itemId: auctionItem.id,
        title: auctionItem.title,
        description: auctionItem.description,
        category: auctionItem.auction?.category,
        image_url: auctionItem.image_url,
        current_bid: auctionItem.current_bid,
        starting_price: auctionItem.starting_price,
        reserve_price: auctionItem.reserve_price,
        end_date: auctionItem.auction?.end_date,
        status: auctionItem.auction?.status,
        path: `/auctions/${auctionItem.auction_id}/items/${auctionItem.id}`,
        isItem: true,
        winner_id: auctionItem.winner_id,
        payments: item.payments
      };
    } else if (item.auctions) {
      const auction = item.auctions;
      return {
        id: auction.id,
        auctionId: auction.id,
        itemId: null,
        title: auction.title,
        description: auction.description,
        category: auction.category,
        image_url: auction.image_url,
        current_bid: auction.current_bid,
        starting_price: auction.starting_price,
        reserve_price: auction.reserve_price,
        end_date: auction.end_date,
        status: auction.status,
        path: `/auctions/${auction.id}`,
        isItem: false,
        winner_id: auction.winner_id,
        payments: auction.payments
      };
    } else if (item.auction) {
      const auction = item.auction;
      return {
        id: item.id,
        auctionId: auction.id,
        itemId: item.id,
        title: item.title,
        description: item.description,
        category: auction.category,
        image_url: item.image_url,
        current_bid: item.current_bid,
        starting_price: item.starting_price,
        reserve_price: item.reserve_price,
        end_date: auction.end_date,
        status: auction.status,
        path: `/auctions/${auction.id}/items/${item.id}`,
        isItem: true,
        winner_id: item.winner_id,
        payments: item.payments
      };
    }
    return null;
  };

  const auction = getAuctionData();
  if (!auction) return null;

  const currentPrice = auction.current_bid || auction.starting_price;
  const userIsWinning = userBidAmount !== undefined && userBidAmount >= currentPrice;
  const isWinning = variant === 'active';
  const isOutbid = variant === 'outbid';

  const getBadge = () => {
    switch (variant) {
      case 'active':
        return (
          <Badge className="absolute top-4 left-4 z-10 bg-green-600 text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Winning
          </Badge>
        );
      case 'outbid':
        return (
          <Badge className="absolute top-4 left-4 z-10 bg-red-600 text-white">
            <AlertCircle className="h-3 w-3 mr-1" />
            Outbid
          </Badge>
        );
      case 'won':
        return (
          <Badge className="absolute top-4 left-4 z-10 bg-green-600 text-white">
            <Trophy className="h-3 w-3 mr-1" />
            Won
          </Badge>
        );
      case 'watchlist':
        return (
          <Badge className="absolute top-4 left-4 z-10 bg-black dark:bg-white text-white dark:text-black">
            <Heart className="h-3 w-3 mr-1" />
            Watching
          </Badge>
        );
      case 'ending-soon':
        return (
          <Badge className="absolute top-4 left-4 z-10 bg-orange-600 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Ending Soon
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPaymentStatus = () => {
    if (!auction.payments || auction.payments.length === 0) {
      return { status: 'pending', label: 'Payment Required', icon: CreditCard };
    }
    const payment = auction.payments[0];
    
    switch (payment.status) {
      case 'succeeded':
        return { status: 'paid', label: 'Paid', icon: CheckCircle2 };
      case 'processing':
        return { status: 'processing', label: 'Processing', icon: CreditCard };
      default:
        return { status: 'failed', label: 'Payment Failed', icon: CreditCard };
    }
  };

  const getShippingStatus = () => {
    if (!auction.payments || auction.payments.length === 0) {
      return { status: 'pending', label: 'Awaiting Payment', icon: Package };
    }
    const payment = auction.payments[0];
    
    if (payment.status !== 'succeeded') {
      return { status: 'pending', label: 'Awaiting Payment', icon: Package };
    }

    const shippingStatus = payment.shipping_status || 'pending';
    
    switch (shippingStatus) {
      case 'shipped':
        return { status: 'shipped', label: 'Shipped', icon: Truck };
      case 'delivered':
        return { status: 'delivered', label: 'Delivered', icon: CheckCircle2 };
      default:
        return { status: 'pending', label: 'Processing', icon: Package };
    }
  };

  const paymentStatus = variant === 'won' ? getPaymentStatus() : null;
  const shippingStatus = variant === 'won' ? getShippingStatus() : null;

  return (
    <Card className={cn(
      "overflow-hidden hover:shadow-lg transition-shadow relative"
    )}>
      {variant === 'watchlist' && onRemoveFromWatchlist && (
        <button
          onClick={() => onRemoveFromWatchlist(auction.auctionId)}
          disabled={isRemoving}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white dark:bg-black border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors disabled:opacity-50"
          aria-label="Remove from watchlist"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      {variant !== 'watchlist' && (
        <div className="absolute top-4 right-4 z-10">
          <WatchlistButton 
            auctionId={auction.auctionId}
            itemId={auction.itemId}
            isInWatchlist={false}
          />
        </div>
      )}

      <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {getBadge()}
        {auction.image_url ? (
          <img
            src={auction.image_url}
            alt={auction.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Sparkles className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-base mb-2 line-clamp-2">{auction.title}</h3>
        {auction.category && (
          <Badge variant="outline" className="text-xs mb-3">{auction.category}</Badge>
        )}

        <div className="space-y-2 mb-3">
          {userBidAmount !== undefined && (
            <div className="flex justify-between text-sm">
              <span className={cn(
                "font-medium",
                userIsWinning && "text-green-600 dark:text-green-400",
                !userIsWinning && "text-red-600 dark:text-red-400"
              )}>
                Your Bid:
              </span>
              <span className={cn(
                "font-semibold",
                userIsWinning && "text-green-600 dark:text-green-400",
                !userIsWinning && "text-red-600 dark:text-red-400"
              )}>
                {formatPrice(userBidAmount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {variant === 'won' ? 'Final Price:' : 'Current Price:'}
            </span>
            <span className={cn(
              "font-semibold",
              userIsWinning && variant !== 'won' && "text-green-600 dark:text-green-400",
              isOutbid && "text-red-600 dark:text-red-400"
            )}>
              {formatPrice(currentPrice)}
            </span>
          </div>
        </div>

        {variant === 'won' && paymentStatus && shippingStatus && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div className="flex items-center gap-2">
                <paymentStatus.icon className="h-4 w-4" />
                <span className="text-sm font-medium">Payment:</span>
              </div>
              <Badge variant={paymentStatus.status === 'paid' ? 'default' : 'outline'}>
                {paymentStatus.label}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div className="flex items-center gap-2">
                <shippingStatus.icon className="h-4 w-4" />
                <span className="text-sm font-medium">Shipping:</span>
              </div>
              <Badge variant={shippingStatus.status === 'delivered' ? 'default' : 'outline'}>
                {shippingStatus.label}
              </Badge>
            </div>
          </div>
        )}

        {auction.status !== 'ended' && auction.end_date && (
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              Ends in
            </div>
            <AuctionCountdown endDate={auction.end_date} compact />
          </div>
        )}

        {variant === 'won' && paymentStatus?.status === 'pending' ? (
          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/checkout/${auction.auctionId}`)}
              className="flex-1"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now
            </Button>
            <Button
              onClick={() => router.push('/support')}
              variant="outline"
            >
              Contact Support
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => router.push(auction.path)}
            className="w-full"
            variant={isWinning ? 'default' : 'outline'}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            {variant === 'won' ? 'View Details' : variant === 'watchlist' ? 'Place Bid' : isWinning ? 'View Auction' : 'Place Higher Bid'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
