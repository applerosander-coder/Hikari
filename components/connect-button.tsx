'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConnectButtonProps {
  userId: string;
}

export function ConnectButton({ userId }: ConnectButtonProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    checkConnectStatus();
  }, [userId]);

  const checkConnectStatus = async () => {
    try {
      const response = await fetch(`/api/connect?connectedUserId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.isConnected);
        setIsPending(data.isPending);
      }
    } catch (error) {
      console.error('Error checking connect status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      if (isConnected || isPending) {
        // Disconnect or cancel request
        const response = await fetch(`/api/connect?connectedUserId=${userId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setIsConnected(false);
          setIsPending(false);
        }
      } else {
        // Send connection request
        const response = await fetch('/api/connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ connectedUserId: userId }),
        });
        if (response.ok) {
          setIsPending(true);
        }
      }
    } catch (error) {
      console.error('Error toggling connect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <Button disabled className="w-full" variant="outline">
        Loading...
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              'Loading...'
            ) : isConnected ? (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Connected
              </>
            ) : isPending ? (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Pending
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Connect
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Only connect with people you know</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
