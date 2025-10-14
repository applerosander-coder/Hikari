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
import { placeBidWithSavedCard } from '@/app/actions/bid-actions';
import { useRouter } from 'next/navigation';
import { AddCardModal } from '@/components/add-card-modal';
import { Spinner } from '@/components/ui/spinner';

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
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [isProcessingBid, setIsProcessingBid] = useState(false);

  const minBid = (currentBid + 100) / 100;

  const handlePlaceBid = async () => {
    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue < minBid) {
      toast.error(`Bid must be at least $${minBid.toFixed(2)}`);
      return;
    }

    setIsCreatingIntent(true);

    // Place bid (no payment - payment only happens when auction ends if user wins)
    const result = await placeBidWithSavedCard(auctionId, Math.round(bidValue * 100));

    if (result.success) {
      // Bid placed successfully - redirect to mybids with celebration
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
    if (result.error === 'no_payment_method') {
      setIsCreatingIntent(false);
      setShowAddCard(true);
      return;
    }

    // If bid placement failed, show error
    if (result.error) {
      toast.error(result.error);
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
    toast.loading('Placing bid...', { id: 'placing-bid' });
    
    // Small delay then retry placing bid
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const bidValue = parseFloat(bidAmount);
    const result = await placeBidWithSavedCard(auctionId, Math.round(bidValue * 100));
    
    toast.dismiss('placing-bid');
    
    if (result.success) {
      setIsProcessingBid(true);
      toast.success('Bid placed successfully!', { id: 'bid-success' });
      onOpenChange(false);
      
      // Redirect to mybids with celebration
      router.push(
        `/mybids?bid_success=true&auction_id=${auctionId}&auction_title=${encodeURIComponent(auctionTitle)}&bid_amount=${Math.round(bidValue * 100)}`
      );
      return;
    }
    
    // If bid placement failed, show error
    if (result.error) {
      toast.error(result.error);
    }
  };

  useEffect(() => {
    if (!open) {
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
              <p className="text-xs text-muted-foreground mt-2">
                💡 Payment will only be charged if you win when the auction ends
              </p>
            </div>
            <Button
              onClick={handlePlaceBid}
              disabled={isCreatingIntent}
              loading={isCreatingIntent}
              className="w-full"
            >
              {isCreatingIntent ? 'Placing Bid...' : 'Place Bid'}
            </Button>
          </div>
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
