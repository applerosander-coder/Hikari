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
import { createBidPaymentIntent, placeBidWithSavedCard } from '@/app/actions/bid-actions';
import { useRouter } from 'next/navigation';
import { AddCardModal } from '@/components/add-card-modal';
import { Spinner } from '@/components/ui/spinner';

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
  auctionTitle,
  bidAmount,
  userId,
  onSuccess,
  onCancel,
}: {
  auctionId: string;
  auctionTitle: string;
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

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/mybids?bid_success=true&auction_id=${auctionId}&auction_title=${encodeURIComponent(auctionTitle)}&bid_amount=${bidAmount}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      // Payment succeeded - the webhook will create the bid
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful! Your bid is being processed.');
        onSuccess();
      } else {
        toast.error('Payment status unclear. Please check your bids.');
        setIsProcessing(false);
      }
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
          loading={isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Processing...' : `Pay $${(bidAmount / 100).toFixed(2)}`}
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
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [isProcessingBid, setIsProcessingBid] = useState(false);

  const minBid = (currentBid + 100) / 100;

  const handleCreatePaymentIntent = async () => {
    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue < minBid) {
      toast.error(`Bid must be at least $${minBid.toFixed(2)}`);
      return;
    }

    setIsCreatingIntent(true);

    // First, try to place bid with saved card
    const savedCardResult = await placeBidWithSavedCard(auctionId, Math.round(bidValue * 100));

    if (savedCardResult.success) {
      // Payment succeeded with saved card - redirect to mybids with celebration
      setIsProcessingBid(true);
      toast.success('Bid placed successfully!', { id: 'bid-success' });
      setIsCreatingIntent(false);
      onOpenChange(false);
      
      // Redirect to mybids with celebration params
      router.push(
        `/mybids?bid_success=true&auction_id=${auctionId}&auction_title=${encodeURIComponent(auctionTitle)}&bid_amount=${Math.round(bidValue * 100)}`
      );
      return;
    }

    // If no saved card, show add card modal
    if (savedCardResult.error === 'no_payment_method') {
      setIsCreatingIntent(false);
      setShowAddCard(true);
      return;
    }

    // If saved card payment failed, fall back to manual payment flow
    if (savedCardResult.error) {
      toast.error(`${savedCardResult.error}. Falling back to manual payment...`, { duration: 3000 });
      
      // Fall back to creating payment intent for manual authentication
      const result = await createBidPaymentIntent(auctionId, Math.round(bidValue * 100));

      if (result.error) {
        if (result.error.includes('add a payment method')) {
          setIsCreatingIntent(false);
          setShowAddCard(true);
          return;
        }
        toast.error(result.error);
        setIsCreatingIntent(false);
        return;
      }

      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
        setShowPayment(true);
      }
      
      setIsCreatingIntent(false);
      return;
    }

    setIsCreatingIntent(false);
  };

  const handleCardAdded = async () => {
    setShowAddCard(false);
    
    // Give user visual confirmation
    toast.success('✓ Card saved successfully! Placing your bid...', { 
      duration: 2000,
      id: 'card-saved'
    });
    
    // Wait to ensure database is updated
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.dismiss('card-saved');
    toast.loading('Processing bid...', { id: 'processing-bid' });
    
    // Small delay then retry with saved card
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const bidValue = parseFloat(bidAmount);
    const savedCardResult = await placeBidWithSavedCard(auctionId, Math.round(bidValue * 100));
    
    toast.dismiss('processing-bid');
    
    if (savedCardResult.success) {
      setIsProcessingBid(true);
      toast.success('Bid placed successfully!', { id: 'bid-success' });
      onOpenChange(false);
      
      // Redirect to mybids with celebration
      router.push(
        `/mybids?bid_success=true&auction_id=${auctionId}&auction_title=${encodeURIComponent(auctionTitle)}&bid_amount=${Math.round(bidValue * 100)}`
      );
      return;
    }
    
    // If automatic charge failed, fall back to manual payment
    if (savedCardResult.error) {
      toast.error(`${savedCardResult.error}. Please complete payment manually.`, { duration: 3000 });
      
      // Fall back to manual payment flow
      const result = await createBidPaymentIntent(auctionId, Math.round(bidValue * 100));

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
        setShowPayment(true);
      }
    }
  };

  const handleSuccess = () => {
    setIsProcessingBid(true);
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
    <>
      {isProcessingBid && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Spinner size="lg" className="mx-auto" />
            <p className="text-white text-lg font-medium">Processing your bid...</p>
            <p className="text-white/70 text-sm">Please wait while we confirm your bid</p>
          </div>
        </div>
      )}
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Place Your Bid</DialogTitle>
          <DialogDescription>{auctionTitle}</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
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
                loading={isCreatingIntent}
                className="w-full"
              >
                {isCreatingIntent ? 'Preparing...' : 'Continue to Payment'}
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
                  auctionTitle={auctionTitle}
                  bidAmount={Math.round(parseFloat(bidAmount) * 100)}
                  userId={userId}
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                />
              </Elements>
            )
          )}
        </div>
      </DialogContent>
      <AddCardModal
        open={showAddCard}
        onOpenChange={setShowAddCard}
        onSuccess={handleCardAdded}
      />
    </Dialog>
    </>
  );
}
