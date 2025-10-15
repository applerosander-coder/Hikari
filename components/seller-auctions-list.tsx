'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Package, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
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

interface AuctionItem {
  id: string;
  title: string;
  description: string;
  starting_price: number;
  current_bid: number | null;
  image_url: string | null;
  position: number;
}

interface Auction {
  id: string;
  name: string | null;
  place: string | null;
  title: string;
  description: string;
  status: string;
  starting_price: number;
  start_date: string;
  end_date: string;
  created_at: string;
  auction_items?: AuctionItem[];
}

interface SellerAuctionsListProps {
  auctions: Auction[];
}

export function SellerAuctionsList({ auctions }: SellerAuctionsListProps) {
  const router = useRouter();
  const [publishingStates, setPublishingStates] = useState<Record<string, boolean>>({});
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, string>>({});
  const [deletingStates, setDeletingStates] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  if (auctions.length === 0) {
    return (
      <div className="border border-dashed rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          You haven't created any auctions yet. Use the form to create your first auction!
        </p>
      </div>
    );
  }

  const handleAuctionClick = (auction: Auction, action: 'edit' | 'preview' = 'edit') => {
    if (auction.status === 'draft') {
      if (action === 'preview') {
        router.push(`/seller/preview/${auction.id}`);
      } else {
        router.push(`/seller/edit/${auction.id}`);
      }
    } else {
      router.push(`/auctions/${auction.id}`);
    }
  };

  const handlePublishToggle = async (auctionId: string, currentStatus: string, checked: boolean) => {
    const newStatus = checked ? 'active' : 'draft';
    
    // Optimistic update
    setOptimisticStatuses(prev => ({ ...prev, [auctionId]: newStatus }));
    setPublishingStates(prev => ({ ...prev, [auctionId]: true }));

    try {
      const response = await fetch('/api/auctions/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update auction status');
      }

      toast.success(checked ? 'Auction published!' : 'Auction unpublished');
      router.refresh();
    } catch (error) {
      console.error('Error updating auction status:', error);
      toast.error('Failed to update auction status');
      // Revert optimistic update on error
      setOptimisticStatuses(prev => ({ ...prev, [auctionId]: currentStatus }));
    } finally {
      setPublishingStates(prev => ({ ...prev, [auctionId]: false }));
    }
  };

  const getDisplayStatus = (auction: Auction) => {
    return optimisticStatuses[auction.id] || auction.status;
  };

  const handleDeleteAuction = async (auctionId: string) => {
    setDeletingStates(prev => ({ ...prev, [auctionId]: true }));

    try {
      const response = await fetch(`/api/auctions/${auctionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete auction');
      }

      toast.success('Auction deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting auction:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete auction');
    } finally {
      setDeletingStates(prev => ({ ...prev, [auctionId]: false }));
      setDeleteDialogOpen(null);
    }
  };

  return (
    <div className="space-y-4">
      {auctions.map((auction) => {
        const itemCount = auction.auction_items?.length || 0;
        const hasItems = itemCount > 0;
        const displayStatus = getDisplayStatus(auction);
        
        return (
          <div
            key={auction.id}
            className={`border rounded-lg p-4 transition-all ${
              displayStatus === 'draft'
                ? 'hover:shadow-lg hover:border-gray-400'
                : 'cursor-pointer hover:shadow-md'
            }`}
            onClick={() => displayStatus !== 'draft' && handleAuctionClick(auction)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {auction.name || auction.title}
                </h3>
                {auction.place && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    📍 {auction.place}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={displayStatus === 'draft' ? 'secondary' : 'default'}
                  className="capitalize"
                >
                  {displayStatus}
                </Badge>
                <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                  <Switch
                    checked={displayStatus !== 'draft'}
                    onCheckedChange={(checked) => handlePublishToggle(auction.id, auction.status, checked)}
                    disabled={publishingStates[auction.id]}
                    className="data-[state=checked]:bg-black"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialogOpen(auction.id);
                    }}
                    disabled={deletingStates[auction.id]}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Item Count and Preview */}
            {hasItems ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                </div>
                
                {/* Show first 3 items as preview */}
                <div className="grid grid-cols-3 gap-2">
                  {auction.auction_items?.slice(0, 3).map((item) => (
                    <div key={item.id} className="relative aspect-square rounded border overflow-hidden">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {itemCount > 3 && (
                    <div className="relative aspect-square rounded border overflow-hidden bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">+{itemCount - 3}</span>
                    </div>
                  )}
                </div>

                {/* Item titles preview */}
                <div className="text-xs text-muted-foreground">
                  {auction.auction_items?.slice(0, 2).map((item, i) => (
                    <div key={item.id}>
                      • {item.title}
                    </div>
                  ))}
                  {itemCount > 2 && <div>• and {itemCount - 2} more...</div>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {auction.description}
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm border-t pt-3">
              <div>
                <span className="text-muted-foreground">Start: </span>
                <span className="font-medium">
                  {new Date(auction.start_date).toLocaleDateString('en-US', { 
                    timeZone: 'UTC',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">End: </span>
                <span className="font-medium">
                  {new Date(auction.end_date).toLocaleDateString('en-US', { 
                    timeZone: 'UTC',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {displayStatus === 'draft' && (
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleAuctionClick(auction, 'edit');
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleAuctionClick(auction, 'preview');
                  }}
                >
                  Preview
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen !== null} onOpenChange={(open) => !open && setDeleteDialogOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this auction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the auction and all of its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialogOpen && handleDeleteAuction(deleteDialogOpen)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
