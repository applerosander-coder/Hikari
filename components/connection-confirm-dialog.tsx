'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ConnectionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (skipFuture: boolean) => void;
  requesterName: string;
}

export function ConnectionConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  requesterName,
}: ConnectionConfirmDialogProps) {
  const [skipFuture, setSkipFuture] = useState(false);

  const handleConfirm = () => {
    onConfirm(skipFuture);
    setSkipFuture(false); // Reset for next time
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Connect with {requesterName}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>Only connect with people you know. Do you want to continue?</p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skip-future"
                checked={skipFuture}
                onCheckedChange={(checked) => setSkipFuture(checked as boolean)}
              />
              <Label
                htmlFor="skip-future"
                className="text-sm font-normal cursor-pointer"
              >
                Don&apos;t show this again
              </Label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setSkipFuture(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
