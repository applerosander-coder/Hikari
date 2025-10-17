import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name?: string | null;
  reviewer_avatar?: string | null;
  reviewer?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No comments yet. Be the first to leave a review!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={review.reviewer?.avatar_url || review.reviewer_avatar || ''} 
                alt={review.reviewer?.full_name || review.reviewer_name || 'Reviewer'} 
              />
              <AvatarFallback>
                {(review.reviewer?.full_name || review.reviewer_name)?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold">
                    {review.reviewer?.full_name || review.reviewer_name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {review.comment && (
                <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
