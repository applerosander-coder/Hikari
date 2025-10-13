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
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface AddCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function CardSetupForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
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
        // Provide specific error guidance
        let errorMessage = submitError.message || 'Card validation failed';
        if (submitError.code === 'incomplete_number') {
          errorMessage = 'Please enter a valid card number';
        } else if (submitError.code === 'incomplete_expiry') {
          errorMessage = 'Please enter a valid expiration date';
        } else if (submitError.code === 'incomplete_cvc') {
          errorMessage = 'Please enter a valid security code';
        } else if (submitError.code === 'incomplete_zip') {
          errorMessage = 'Please enter a valid ZIP code';
        }
        toast.error(errorMessage);
        setIsProcessing(false);
        return;
      }

      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Provide specific error guidance
        let errorMessage = error.message || 'Failed to save card';
        if (error.code === 'card_declined') {
          errorMessage = 'Your card was declined. Please try a different card.';
        } else if (error.code === 'expired_card') {
          errorMessage = 'Your card has expired. Please use a different card.';
        } else if (error.code === 'incorrect_cvc') {
          errorMessage = 'Incorrect security code. Please check and try again.';
        } else if (error.code === 'processing_error') {
          errorMessage = 'An error occurred processing your card. Please try again.';
        }
        toast.error(errorMessage);
        setIsProcessing(false);
        return;
      }

      if (setupIntent && setupIntent.status === 'succeeded' && setupIntent.payment_method) {
        // Attach payment method to customer and save in database
        const res = await fetch('/api/payments/attach-default', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethodId: setupIntent.payment_method }),
        });

        if (!res.ok) {
          const data = await res.json();
          console.error('Attach payment method failed:', data);
          
          // Provide helpful error message
          let errorMsg = 'Failed to save card. ';
          if (data.error === 'no_stripe_customer') {
            errorMsg += 'Please refresh the page and try again.';
          } else {
            errorMsg += data.error || 'Please try again.';
          }
          
          toast.error(errorMsg, { duration: 5000 });
          setIsProcessing(false);
          return;
        }

        console.log('Card saved successfully, calling onSuccess');
        // Success - let parent component handle the success message
        onSuccess();
      } else {
        console.error('SetupIntent status:', setupIntent?.status);
        toast.error('Card setup incomplete. Please try again.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Setup error:', err);
      toast.error('An error occurred while saving card');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-muted/50 p-3 rounded-md text-sm">
        <p className="text-muted-foreground">
          Save a payment method to place bids. You won't be charged until you win an auction.
        </p>
      </div>
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
          {isProcessing ? (
            'Saving...'
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Save Card
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function AddCardModal({ open, onOpenChange, onSuccess }: AddCardModalProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Only create new SetupIntent if modal is opening fresh (not after success)
    if (open && !clientSecret && !isSuccess) {
      setIsLoading(true);
      fetch('/api/payments/setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else if (data.error) {
            toast.error(data.error);
            onOpenChange(false);
          }
        })
        .catch((err) => {
          console.error('Setup intent error:', err);
          toast.error('Failed to initialize card setup');
          onOpenChange(false);
        })
        .finally(() => setIsLoading(false));
    }
  }, [open, clientSecret, isSuccess, onOpenChange]);

  const handleSuccess = () => {
    setIsSuccess(true); // Mark as success to prevent new SetupIntent
    setClientSecret('');
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    setClientSecret('');
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      // Reset everything when modal closes
      setClientSecret('');
      setIsSuccess(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Save your card to participate in auctions
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" className="text-muted-foreground" />
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
                <CardSetupForm onSuccess={handleSuccess} onCancel={handleCancel} />
              </Elements>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
