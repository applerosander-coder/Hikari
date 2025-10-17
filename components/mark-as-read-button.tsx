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
      size="icon"
      variant="outline"
      className="h-7 w-7 sm:h-8 sm:w-8 rounded-md"
      title="Mark as read"
    >
      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    </Button>
  );
}
