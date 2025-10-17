'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MarkAsReadButtonProps {
  notificationId: string;
}

export function MarkAsReadButton({ notificationId }: MarkAsReadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleMarkAsRead = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleMarkAsRead}
      disabled={isLoading}
      size="sm"
      variant="outline"
    >
      {isLoading ? (
        'Marking...'
      ) : (
        <>
          <Check className="h-3 w-3 mr-1" />
          Mark Read
        </>
      )}
    </Button>
  );
}
