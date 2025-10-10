'use client';

import { createClient } from '@/utils/supabase/client';
import { AuctionCountdown } from '@/components/auction-countdown';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hammer, TrendingUp, User } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', params.id)
        .single();

      if (auctionError) {
        console.error('Error fetching auction:', auctionError);
        toast.error('Failed to load auction');
        return;
      }

      setAuction(auctionData);

      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select(`
          *,
          user:users(full_name, avatar_url)
        `)
        .eq('auction_id', params.id)
        .order('bid_amount', { ascending: false })
        .limit(10);

      if (!bidsError && bidsData) {
        setBids(bidsData);
      }

      setLoading(false);
    }

    fetchData();
  }, [params.id]);

  const handlePlaceBid = async () => {
    if (!user) {
      toast.error('Please sign in to place a bid');
      router.push('/signin');
      return;
    }

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    const currentBid = auction.current_bid || auction.starting_price;
    const minBid = currentBid + 100; // Minimum increment of $1.00

    if (bidValue * 100 < minBid) {
      toast.error(`Bid must be at least $${(minBid / 100).toFixed(2)}`);
      return;
    }

    setPlacingBid(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from('bids').insert({
        auction_id: auction.id,
        user_id: user.id,
        bid_amount: Math.round(bidValue * 100)
      });

      if (error) throw error;

      toast.success('Bid placed successfully!');
      
      setAuction({ ...auction, current_bid: Math.round(bidValue * 100) });
      setBidAmount('');
      
      window.location.reload();
    } catch (error: any) {
      console.error('Error placing bid:', error);
      toast.error('Failed to place bid');
    } finally {
      setPlacingBid(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p>Loading auction...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <Hammer className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold">Auction Not Found</h2>
        </div>
      </div>
    );
  }

  const currentBid = auction.current_bid || auction.starting_price;
  const formattedCurrentBid = (currentBid / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  const isActive = auction.status === 'active';
  const isUpcoming = auction.status === 'upcoming';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden mb-4">
            {auction.image_url ? (
              <Image
                src={auction.image_url}
                alt={auction.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Hammer className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {auction.image_urls && auction.image_urls.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {auction.image_urls.map((url: string, index: number) => (
                <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                  <Image src={url} alt={`${auction.title} ${index + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-4">
            <Badge className="mb-2">
              {isUpcoming ? 'Upcoming' : isActive ? 'Live Auction' : 'Ended'}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{auction.title}</h1>
            <p className="text-muted-foreground">{auction.description}</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Current Bid</p>
                  <p className="text-4xl font-bold text-primary">{formattedCurrentBid}</p>
                </div>
                {bids.length > 0 && (
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-5 w-5 mr-1" />
                    <span className="text-lg font-medium">{bids.length} bids</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <AuctionCountdown 
                endDate={isUpcoming ? auction.start_date : auction.end_date} 
              />
            </CardContent>
          </Card>

          {isActive && (
            <Card className="mb-6">
              <CardHeader>
                <h3 className="font-semibold">Place Your Bid</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bid-amount">Your Bid Amount (USD)</Label>
                    <Input
                      id="bid-amount"
                      type="number"
                      step="0.01"
                      min={(currentBid / 100 + 1).toFixed(2)}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Minimum: $${((currentBid + 100) / 100).toFixed(2)}`}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePlaceBid}
                    disabled={placingBid}
                  >
                    {placingBid ? 'Placing Bid...' : 'Place Bid'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {bids.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Bid History</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bids.map((bid, index) => (
                    <div key={bid.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {bid.user?.full_name || 'Anonymous Bidder'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(bid.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ${(bid.bid_amount / 100).toLocaleString()}
                        </p>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Highest Bid
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
