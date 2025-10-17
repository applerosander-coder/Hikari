'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { ConnectionConfirmDialog } from './connection-confirm-dialog';
import { useRouter } from 'next/navigation';

interface ConnectionRequestActionsProps {
  requesterId: string;
  requesterName: string;
  skipConfirmation: boolean;
}

export function ConnectionRequestActions({
  requesterId,
  requesterName,
  skipConfirmation,
}: ConnectionRequestActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleAccept = async () => {
    if (!skipConfirmation) {
      setShowConfirmDialog(true);
      return;
    }
    
    await processAccept(false);
  };

  const handleConfirmAccept = async (skipFuture: boolean) => {
    setShowConfirmDialog(false);
    await processAccept(skipFuture);
  };

  const processAccept = async (skipFuture: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/connect/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterId,
          action: 'accept',
          skipConfirmation: skipFuture,
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/connect/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterId,
          action: 'reject',
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error rejecting connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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

      <ConnectionConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmAccept}
        requesterName={requesterName}
      />
    </>
  );
}
