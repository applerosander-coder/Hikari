'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles, CreditCard, Truck, Package, CheckCircle2, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';

interface WonAuctionsSectionProps {
  wonAuctions: any[];
  searchQuery: string;
  userId: string;
}

export function WonAuctionsSection({ wonAuctions, searchQuery }: WonAuctionsSectionProps) {
  const router = useRouter();

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInCents / 100);
  };

  const filterAuctions = (auctions: any[]) => {
    if (!searchQuery.trim()) return auctions;
    const query = searchQuery.toLowerCase();
    return auctions.filter((auction: any) => 
      auction.title.toLowerCase().includes(query) ||
      auction.description?.toLowerCase().includes(query) ||
      auction.category?.toLowerCase().includes(query)
    );
  };

  const filtered = filterAuctions(wonAuctions);

  const getPaymentStatus = (auction: any) => {
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

  const getShippingStatus = (auction: any) => {
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

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Won Auctions</h3>
        <p className="text-muted-foreground">
          {searchQuery ? `No won items found for "${searchQuery}"` : 'Win your first auction to see it here!'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted-foreground mb-6">
        Congratulations! Here are the auctions you've won.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((auction: any) => {
          const paymentStatus = getPaymentStatus(auction);
          const shippingStatus = getShippingStatus(auction);
          const PaymentIcon = paymentStatus.icon;
          const ShippingIcon = shippingStatus.icon;

          return (
            <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Badge className="absolute top-4 left-4 z-10 bg-black dark:bg-white text-white dark:text-black">
                  <Trophy className="h-3 w-3 mr-1" />
                  Won
                </Badge>
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Final Price:</span>
                    <span className="font-bold">{formatPrice(auction.current_bid || auction.starting_price)}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <PaymentIcon className="h-4 w-4" />
                      Payment:
                    </span>
                    <Badge 
                      variant={paymentStatus.status === 'paid' ? 'default' : 'outline'}
                      className={cn(
                        paymentStatus.status === 'paid' && 'bg-green-600 dark:bg-green-500'
                      )}
                    >
                      {paymentStatus.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <ShippingIcon className="h-4 w-4" />
                      Shipping:
                    </span>
                    <Badge 
                      variant={shippingStatus.status === 'delivered' ? 'default' : 'outline'}
                      className={cn(
                        shippingStatus.status === 'delivered' && 'bg-green-600 dark:bg-green-500'
                      )}
                    >
                      {shippingStatus.label}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  {paymentStatus.status === 'pending' && (
                    <Button
                      onClick={() => router.push(`/auctions/${auction.id}`)}
                      className="w-full"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Now
                    </Button>
                  )}
                  <Button
                    onClick={() => router.push(`/support?auction=${auction.id}`)}
                    variant="outline"
                    className="w-full"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
