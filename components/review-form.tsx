'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ReviewFormProps {
  userId: string;
  currentUserId: string;
  existingRating?: number;
  existingComment?: string;
}

export function ReviewForm({ userId, currentUserId, existingRating = 0, existingComment = '' }: ReviewFormProps) {
  const [rating, setRating] = useState(existingRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingComment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);
  const router = useRouter();

  const submitReview = async (newRating: number, newComment?: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          reviewer_id: currentUserId,
          rating: newRating,
          comment: newComment?.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      router.refresh();
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to save review');
      return false;
    }
  };

  const handleStarClick = async (star: number) => {
    setRating(star);
    setIsSubmitting(true);
    
    const success = await submitReview(star, comment);
    if (success) {
      toast.success('Rating saved!');
    }
    
    setIsSubmitting(false);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating first');
      return;
    }

    setIsSavingComment(true);
    
    const success = await submitReview(rating, comment);
    if (success) {
      toast.success('Comment saved!');
    }
    
    setIsSavingComment(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 disabled:opacity-50"
              disabled={isSubmitting}
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {isSubmitting && (
          <p className="text-xs text-muted-foreground mt-1">Saving...</p>
        )}
      </div>

      {rating > 0 && (
        <form onSubmit={handleCommentSubmit}>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Comment (optional)
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              className="resize-none"
              disabled={isSavingComment}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSavingComment}
            className="mt-2"
            variant="outline"
          >
            {isSavingComment ? 'Saving...' : 'Save Comment'}
          </Button>
        </form>
      )}
    </div>
  );
}
