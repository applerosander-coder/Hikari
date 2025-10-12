'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addToWatchlist, removeFromWatchlist } from '@/app/actions/watchlist';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';

interface WatchlistButtonProps {
  auctionId: string;
  isInWatchlist: boolean;
  variant?: 'default' | 'icon';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function WatchlistButton({ 
  auctionId, 
  isInWatchlist, 
  variant = 'default',
  size = 'default',
  className 
}: WatchlistButtonProps) {
  const [isAdded, setIsAdded] = useState(isInWatchlist);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Watchlist button clicked!', { auctionId, isAdded });
    
    setIsLoading(true);
    
    if (isAdded) {
      console.log('Removing from watchlist...');
      const result = await removeFromWatchlist(auctionId);
      if (result.error) {
        console.error('Remove error:', result.error);
        toast.error(result.error);
      } else {
        console.log('Removed successfully');
        setIsAdded(false);
        toast.success('Removed from watchlist');
        router.refresh();
      }
    } else {
      console.log('Adding to watchlist...');
      const result = await addToWatchlist(auctionId);
      if (result.error) {
        console.error('Add error:', result.error);
        if (result.error === 'Already in watchlist') {
          setIsAdded(true);
        }
        toast.error(result.error);
      } else {
        console.log('Added successfully');
        setIsAdded(true);
        toast.success('Added to watchlist');
        router.refresh();
      }
    }
    
    setIsLoading(false);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          "p-2 rounded-full transition-all disabled:opacity-50",
          isAdded 
            ? "bg-red-500 text-white hover:bg-red-600" 
            : "bg-white dark:bg-black text-black dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800",
          "hover:scale-110",
          className
        )}
        aria-label={isAdded ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <Heart className={cn("h-4 w-4", isAdded && "fill-current")} />
      </button>
    );
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={isAdded ? 'default' : 'outline'}
      size={size}
      className={className}
    >
      {isAdded ? (
        <>
          <Heart className="mr-2 h-4 w-4 fill-current" />
          Watching
        </>
      ) : (
        <>
          <Heart className="mr-2 h-4 w-4" />
          Watch
        </>
      )}
    </Button>
  );
}
