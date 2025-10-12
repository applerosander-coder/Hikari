'use client';

import { createClient } from '@/utils/supabase/client';
import { AuctionCountdown } from '@/components/auction-countdown';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hammer, TrendingUp, User, ArrowLeft, Eye } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AuctionPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        toast.error('Please sign in to preview auctions');
        router.push('/signin');
        return;
      }

      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', params.id)
        .eq('created_by', user.id)
        .eq('status', 'draft')
        .single();

      if (auctionError || !auctionData) {
        console.error('Error fetching auction:', auctionError);
        toast.error('Draft auction not found or access denied');
        router.push('/seller');
        return;
      }

      setAuction(auctionData);
      setLoading(false);
    }

    fetchData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p>Loading preview...</p>
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Preview Mode Banner */}
      <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Preview Mode</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                This is how your auction will appear when published. This preview is only visible to you.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/seller/edit/${auction.id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Edit
            </Button>
          </div>
        </div>
      </div>

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
        </div>

        <div>
          <div className="mb-4">
            <Badge className="mb-2">
              {new Date(auction.start_date) > new Date() ? 'Upcoming' : 'Live Auction'}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{auction.title}</h1>
            <p className="text-muted-foreground">{auction.description || 'No description provided'}</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Starting Bid</p>
                  <p className="text-4xl font-bold text-primary">{formattedCurrentBid}</p>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <TrendingUp className="h-5 w-5 mr-1" />
                  <span className="text-lg font-medium">0 bids</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AuctionCountdown 
                endDate={new Date(auction.start_date) > new Date() ? auction.start_date : auction.end_date} 
              />
            </CardContent>
          </Card>

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
                disabled
              >
                Bid Now (Preview Only)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Auction Details</h3>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {auction.category && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{auction.category}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Starts:</span>
                <span className="font-medium">{new Date(auction.start_date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ends:</span>
                <span className="font-medium">{new Date(auction.end_date).toLocaleString()}</span>
              </div>
              {auction.reserve_price && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reserve Price:</span>
                  <span className="font-medium">
                    ${(auction.reserve_price / 100).toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
