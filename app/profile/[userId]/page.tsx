import { createClient } from '@/utils/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ReviewForm } from '@/components/review-form';
import { ReviewList } from '@/components/review-list';
import { UserAuctionList } from '@/components/user-auction-list';

interface UserProfilePageProps {
  params: {
    userId: string;
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const supabase = await createClient();
  
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  const { data: profileUser, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.userId)
    .single();

  if (userError || !profileUser) {
    notFound();
  }

  const { data: auctionsData } = await supabase
    .from('auctions')
    .select('id, name, status, created_at, end_date')
    .eq('created_by', params.userId)
    .order('created_at', { ascending: false });

  const totalAuctions = auctionsData?.length || 0;
  const activeAuctions = auctionsData?.filter(a => a.status === 'active').length || 0;
  const endedAuctions = auctionsData?.filter(a => a.status === 'ended').length || 0;

  const { data: reviews } = await supabase
    .from('user_reviews')
    .select(`
      *,
      reviewer:reviewer_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false });

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  const isOwnProfile = currentUser?.id === params.userId;

  const existingReview = currentUser && reviews?.find(r => r.reviewer_id === currentUser.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profileUser.avatar_url || ''} alt={profileUser.full_name || 'User'} />
                  <AvatarFallback className="text-4xl">
                    {profileUser.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">{profileUser.full_name || 'Anonymous User'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({reviews?.length || 0} reviews)
                </p>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Auctions:</span>
                  <span className="font-semibold">{totalAuctions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active:</span>
                  <span className="font-semibold text-green-600">{activeAuctions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ended:</span>
                  <span className="font-semibold text-gray-600">{endedAuctions}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
          {!isOwnProfile && currentUser && (
            <Card>
              <CardHeader>
                <CardTitle>{existingReview ? 'Your Review' : 'Leave a Review'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewForm 
                  userId={params.userId} 
                  currentUserId={currentUser.id}
                  existingRating={existingReview?.rating}
                  existingComment={existingReview?.comment || ''}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Reviews ({reviews?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewList reviews={reviews || []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auctions Hosted</CardTitle>
            </CardHeader>
            <CardContent>
              <UserAuctionList auctions={auctionsData || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
