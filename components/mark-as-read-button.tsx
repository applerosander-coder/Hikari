'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MarkAsReadButtonProps {
  notificationId: string;
}

export function MarkAsReadButton({ notificationId }: MarkAsReadButtonProps) {
  const [isChecked, setIsChecked] = useState(false);
  const router = useRouter();

  const handleMarkAsRead = async () => {
    setIsChecked(true);
    
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setTimeout(() => {
          router.refresh();
        }, 400);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      setIsChecked(false);
    }
  };

  return (
    <Button
      onClick={handleMarkAsRead}
      disabled={isChecked}
      size="icon"
      variant="outline"
      className="h-10 w-10 sm:h-12 sm:w-12 rounded-md border-2 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      title="Mark as read"
    >
      <Check 
        className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300 ${
          isChecked 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-0'
        }`} 
      />
    </Button>
  );
}
