'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface InvitationActionsProps {
  invitationId: string;
  senderName: string;
  onOptimisticRemove?: () => void;
  onRestoreAfterError?: () => void;
}

export function InvitationActions({
  invitationId,
  senderName,
  onOptimisticRemove,
  onRestoreAfterError,
}: InvitationActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    
    // Optimistically remove from UI
    onOptimisticRemove?.();

    try {
      const response = await fetch(`/api/invitations/${invitationId}/accept`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }

      toast.success(`Connected with ${senderName}`);
      router.refresh();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept connection request');
      
      // Restore the invitation in UI
      onRestoreAfterError?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    
    // Optimistically remove from UI
    onOptimisticRemove?.();

    try {
      const response = await fetch(`/api/invitations/${invitationId}/reject`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reject invitation');
      }

      toast.success('Connection request declined');
      router.refresh();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error('Failed to decline connection request');
      
      // Restore the invitation in UI
      onRestoreAfterError?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="default"
        onClick={handleAccept}
        disabled={isLoading}
        className="flex items-center gap-1"
      >
        <Check className="h-4 w-4" />
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleReject}
        disabled={isLoading}
        className="flex items-center gap-1"
      >
        <X className="h-4 w-4" />
        Reject
      </Button>
    </div>
  );
}
