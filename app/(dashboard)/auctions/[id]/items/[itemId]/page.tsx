'use client';

import { createClient } from '@/utils/supabase/client';
import { AuctionCountdown } from '@/components/auction-countdown';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BidDialog } from '@/components/bid-dialog';
import { WatchlistButton } from '@/components/watchlist-button';
import { Hammer, TrendingUp, User, MapPin, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AuctionItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInCents / 100);
  };

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch auction item with auction details
      const { data: itemData, error: itemError } = await supabase
        .from('auction_items')
        .select(`
          *,
          auction:auctions (
            id,
            name,
            place,
            start_date,
            end_date,
            status,
            created_by,
            category
          )
        `)
        .eq('id', params.itemId)
        .eq('auction_id', params.id)
        .single();

      if (itemError) {
        console.error('Error fetching item:', itemError);
        toast.error('Failed to load auction item');
        setLoading(false);
        return;
      }

      setItem(itemData);
      setAuction(itemData.auction);

      // Fetch bids for this item
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select(`
          *,
          user:users(full_name, avatar_url)
        `)
        .eq('auction_item_id', params.itemId)
        .order('bid_amount', { ascending: false })
        .limit(10);

      if (!bidsError && bidsData) {
        setBids(bidsData);
      }

      // Check watchlist status (support both new item-based and legacy auction-based)
      if (user) {
        // First check for item-based watchlist entry
        const { data: itemWatchlist } = await supabase
          .from('watchlist')
          .select('id')
          .eq('auction_item_id', params.itemId)
          .eq('user_id', user.id)
          .maybeSingle();

        // Fallback to legacy auction-based entry for backward compatibility
        const { data: legacyWatchlist } = await supabase
          .from('watchlist')
          .select('id')
          .eq('auction_id', params.id)
          .eq('user_id', user.id)
          .maybeSingle();

        setIsInWatchlist(!!(itemWatchlist || legacyWatchlist));
      }

      setLoading(false);
    }

    fetchData();
  }, [params.id, params.itemId]);

  const handleOpenBidDialog = () => {
    if (!user) {
      toast.error('Please sign in to place a bid');
      router.push('/signin');
      return;
    }
    setBidDialogOpen(true);
  };

  const handleBidPlaced = () => {
    router.refresh();
    const fetchData = async () => {
      const supabase = createClient();
      
      const { data: itemData } = await supabase
        .from('auction_items')
        .select('*')
        .eq('id', params.itemId)
        .single();

      if (itemData) {
        setItem(itemData);
      }

      const { data: bidsData } = await supabase
        .from('bids')
        .select(`
          *,
          user:users(full_name, avatar_url)
        `)
        .eq('auction_item_id', params.itemId)
        .order('bid_amount', { ascending: false })
        .limit(10);

      if (bidsData) {
        setBids(bidsData);
      }
    };
    
    fetchData();
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p>Loading auction item...</p>
        </div>
      </div>
    );
  }

  if (!item || !auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <Hammer className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold">Auction Item Not Found</h2>
        </div>
      </div>
    );
  }

  const isAuctionEnded = auction.status === 'ended' || new Date(auction.end_date) < new Date();
  const userIsWinner = item.winner_id === user?.id;
  const userBids = bids.filter(bid => bid.user_id === user?.id);
  const highestBid = bids[0];
  const userIsHighestBidder = highestBid?.user_id === user?.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Auction Context Banner */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-lg">{auction.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {auction.place}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <AuctionCountdown endDate={auction.end_date} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Hammer className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Additional Images */}
          {item.image_urls && item.image_urls.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {item.image_urls.slice(0, 4).map((url: string, idx: number) => (
                <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                  <Image
                    src={url}
                    alt={`${item.title} - ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
              <Badge variant="outline" className="mb-4">
                {auction.category || 'General'}
              </Badge>
            </div>
            <WatchlistButton
              auctionId={auction.id}
              itemId={item.id}
              isInWatchlist={isInWatchlist}
              variant="icon"
            />
          </div>

          {/* Price Information */}
          <Card className={userIsHighestBidder && !isAuctionEnded ? "border-green-500" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Bid</p>
                  <p className="text-3xl font-bold">
                    {formatPrice(item.current_bid || item.starting_price)}
                  </p>
                  {userIsHighestBidder && !isAuctionEnded && (
                    <p className="text-sm font-medium text-green-600 mt-1">✓ You're winning!</p>
                  )}
                </div>
                <TrendingUp className={`h-8 w-8 ${userIsHighestBidder && !isAuctionEnded ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Starting Price</p>
                  <p className="font-semibold">{formatPrice(item.starting_price)}</p>
                </div>
                {item.reserve_price && (
                  <div>
                    <p className="text-muted-foreground">Reserve Price</p>
                    <p className="font-semibold">{formatPrice(item.reserve_price)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            {isAuctionEnded ? (
              <div className="p-4 bg-muted rounded-lg text-center">
                {userIsWinner ? (
                  <div>
                    <p className="text-lg font-semibold text-green-600">You won this auction!</p>
                    <p className="text-sm text-muted-foreground mt-1">Check your email for next steps</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">This auction has ended</p>
                )}
              </div>
            ) : (
              <Button 
                onClick={handleOpenBidDialog} 
                className="w-full"
                size="lg"
              >
                <Hammer className="mr-2 h-5 w-5" />
                Place Bid
              </Button>
            )}

            {userIsHighestBidder && !isAuctionEnded && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                <p className="text-sm font-medium text-green-600">You have the highest bid!</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {item.description || 'No description available.'}
            </p>
          </div>
        </div>
      </div>

      {/* Bid History */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Bid History</h2>
        {bids.length > 0 ? (
          <div className="space-y-3">
            {bids.map((bid, idx) => (
              <Card key={bid.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {bid.user?.full_name || 'Anonymous'}
                          {bid.user_id === user?.id && (
                            <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(bid.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{formatPrice(bid.bid_amount)}</p>
                      {idx === 0 && (
                        <Badge variant="default" className="mt-1">Highest Bid</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No bids yet. Be the first to bid!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bid Dialog */}
      {item && user && (
        <BidDialog
          open={bidDialogOpen}
          onOpenChange={setBidDialogOpen}
          auctionId={item.id}
          auctionTitle={item.title}
          currentBid={item.current_bid || item.starting_price || 0}
          userId={user.id}
          onBidPlaced={handleBidPlaced}
        />
      )}
    </div>
  );
}
