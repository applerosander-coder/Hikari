'use client';

import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
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
import { createBidPaymentIntent, confirmBidPlacement } from '@/app/actions/bid-actions';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface BidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auctionId: string;
  auctionTitle: string;
  currentBid: number;
  userId: string;
  onBidPlaced?: () => void;
}

function BidCheckoutForm({
  auctionId,
  bidAmount,
  userId,
  onSuccess,
  onCancel,
}: {
  auctionId: string;
  bidAmount: number;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast.error(submitError.message || 'Payment validation failed');
        setIsProcessing(false);
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/auctions/${auctionId}?bid_success=true`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      const result = await confirmBidPlacement(auctionId, userId, bidAmount);

      if (result.error) {
        toast.error(result.error);
        setIsProcessing(false);
        return;
      }

      toast.success('Bid placed successfully!');
      onSuccess();
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error('An error occurred during payment');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${(bidAmount / 100).toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
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
  const [bidAmount, setBidAmount] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const minBid = (currentBid + 100) / 100;

  const handleCreatePaymentIntent = async () => {
    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue < minBid) {
      toast.error(`Bid must be at least $${minBid.toFixed(2)}`);
      return;
    }

    setIsCreatingIntent(true);

    const result = await createBidPaymentIntent(auctionId, Math.round(bidValue * 100));

    if (result.error) {
      toast.error(result.error);
      setIsCreatingIntent(false);
      return;
    }

    if (result.clientSecret) {
      setClientSecret(result.clientSecret);
      setShowPayment(true);
    }

    setIsCreatingIntent(false);
  };

  const handleSuccess = () => {
    onOpenChange(false);
    setShowPayment(false);
    setClientSecret('');
    setBidAmount('');
    onBidPlaced?.();
  };

  const handleCancel = () => {
    setShowPayment(false);
    setClientSecret('');
  };

  useEffect(() => {
    if (!open) {
      setShowPayment(false);
      setClientSecret('');
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

        {!showPayment ? (
          <div className="space-y-4">
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
            <Button
              onClick={handleCreatePaymentIntent}
              disabled={isCreatingIntent}
              className="w-full"
            >
              {isCreatingIntent ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing...
                </>
              ) : (
                'Continue to Payment'
              )}
            </Button>
          </div>
        ) : (
          clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <BidCheckoutForm
                auctionId={auctionId}
                bidAmount={Math.round(parseFloat(bidAmount) * 100)}
                userId={userId}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </Elements>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
