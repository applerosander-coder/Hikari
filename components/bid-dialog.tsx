'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { confirmBidPlacement } from '@/app/actions/bid-actions';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auctionId: string;
  auctionTitle: string;
  currentBid: number;
  userId: string;
  onBidPlaced?: () => void;
}

export function BidDialog({
  open,
  onOpenChange,
  auctionId,
  auctionTitle,
  currentBid,
  userId,
  onBidPlaced,
}: BidDialogProps) {
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);

  const minBid = (currentBid + 100) / 100;

  const handlePlaceBid = async () => {
    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue < minBid) {
      toast.error(`Bid must be at least $${minBid.toFixed(2)}`);
      return;
    }

    setIsPlacingBid(true);

    const result = await confirmBidPlacement(
      auctionId,
      Math.round(bidValue * 100)
    );

    if (result.error) {
      toast.error(result.error);
      setIsPlacingBid(false);
      return;
    }

    // Success
    toast.success('Bid placed successfully! You only pay if you win.');
    onOpenChange(false);
    setBidAmount('');
    setIsPlacingBid(false);
    onBidPlaced?.();
    
    // Redirect to My Bids page
    router.push('/dashboard/mybids');
  };

  useEffect(() => {
    if (!open) {
      setBidAmount('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place Your Bid</DialogTitle>
          <DialogDescription>{auctionTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
              💡 No payment required now!
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              You only pay if you win. Winner pays bid amount + 8% fees.
            </p>
          </div>

          <div>
            <Label htmlFor="bid-amount">Bid Amount (USD)</Label>
            <Input
              id="bid-amount"
              type="number"
              step="0.01"
              min={minBid.toFixed(2)}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Minimum: $${minBid.toFixed(2)}`}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Current bid: ${(currentBid / 100).toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Payment if you win:</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              • Bid amount + 8% fees (3% Stripe + 5% platform)
            </p>
            <p className="text-xs text-muted-foreground">
              • 48 hours to complete payment
            </p>
            <p className="text-xs text-muted-foreground">
              • Email with payment instructions sent
            </p>
          </div>

          <Button
            onClick={handlePlaceBid}
            disabled={isPlacingBid}
            className="w-full"
          >
            {isPlacingBid ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Bid...
              </>
            ) : (
              'Place Bid'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
