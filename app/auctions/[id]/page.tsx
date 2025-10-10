'use client';

import { createClient } from '@/utils/supabase/client';
import { AuctionCountdown } from '@/components/auction-countdown';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BidDialog } from '@/components/bid-dialog';
import { BidSuccessCelebration } from '@/components/bid-success-celebration';
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
  const [user, setUser] = useState<any>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationBid, setCelebrationBid] = useState<{ amount: number; title: string } | null>(null);

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

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('bid_success') === 'true') {
        const checkBidInterval = setInterval(async () => {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { data: userBid } = await supabase
              .from('bids')
              .select('*')
              .eq('auction_id', params.id)
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            if (userBid) {
              clearInterval(checkBidInterval);
              
              const { data: auctionData } = await supabase
                .from('auctions')
                .select('*')
                .eq('id', params.id)
                .single();
              
              if (auctionData && auctionData.current_bid === userBid.bid_amount) {
                setCelebrationBid({
                  amount: userBid.bid_amount,
                  title: auctionData.title
                });
                setShowCelebration(true);
              }
              
              fetchData();
              window.history.replaceState({}, '', `/auctions/${params.id}`);
            }
          }
        }, 1000);

        setTimeout(() => clearInterval(checkBidInterval), 10000);
      }
    }
  }, [params.id]);

  const handleOpenBidDialog = () => {
    if (!user) {
      toast.error('Please sign in to place a bid');
      router.push('/signin');
      return;
    }
    setBidDialogOpen(true);
  };

  const handleBidPlaced = () => {
    window.location.reload();
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
                <p className="text-sm text-muted-foreground mb-4">
                  Minimum bid: ${((currentBid + 100) / 100).toFixed(2)}
                </p>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleOpenBidDialog}
                >
                  Bid Now
                </Button>
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

      {user && auction && (
        <BidDialog
          open={bidDialogOpen}
          onOpenChange={setBidDialogOpen}
          auctionId={auction.id}
          auctionTitle={auction.title}
          currentBid={currentBid}
          userId={user.id}
          onBidPlaced={handleBidPlaced}
        />
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
