import { createClient } from '@/utils/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ReviewForm } from '@/components/review-form';
import { ReviewList } from '@/components/review-list';
import { UserAuctionList } from '@/components/user-auction-list';
import { FollowButton } from '@/components/follow-button';
import { ConnectButton } from '@/components/connect-button';

interface UserProfilePageProps {
  params: {
    userId: string;
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const supabase = await createClient();
  
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  const { data: auctionsData } = await supabase
    .from('auctions')
    .select(`
      id, 
      name, 
      status, 
      created_at, 
      end_date,
      auction_items (
        id,
        image_url,
        image_urls,
        title
      )
    `)
    .eq('created_by', params.userId)
    .order('created_at', { ascending: false });

  if (!auctionsData || auctionsData.length === 0) {
    notFound();
  }

  // Use PostgreSQL directly for all database queries to get fresh data
  const { Pool } = require('pg');
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });
  
  // Fetch profile user
  const profileResult = await pool.query(
    'SELECT id, full_name, avatar_url FROM users WHERE id = $1',
    [params.userId]
  );
  
  let profileUser = profileResult.rows[0] || null;

  // If user not found and it's current user, create profile
  if (!profileUser && currentUser?.id === params.userId) {
    await pool.query(
      `INSERT INTO users (id, full_name, avatar_url) 
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING
       RETURNING *`,
      [
        params.userId,
        currentUser.user_metadata?.full_name || null,
        currentUser.user_metadata?.avatar_url || null
      ]
    );
    
    // Fetch again after insert
    const newResult = await pool.query(
      'SELECT id, full_name, avatar_url FROM users WHERE id = $1',
      [params.userId]
    );
    profileUser = newResult.rows[0];
  }

  const totalAuctions = auctionsData?.length || 0;
  const activeAuctions = auctionsData?.filter(a => a.status === 'active').length || 0;
  const endedAuctions = auctionsData?.filter(a => a.status === 'ended').length || 0;

  // Fetch reviews with JOIN to get fresh reviewer data
  const reviewsResult = await pool.query(`
    SELECT 
      ur.*,
      u.id as reviewer_id,
      u.full_name as reviewer_full_name,
      u.avatar_url as reviewer_avatar_url
    FROM user_reviews ur
    LEFT JOIN users u ON ur.reviewer_id = u.id
    WHERE ur.user_id = $1
    ORDER BY ur.created_at DESC
  `, [params.userId]);
  
  await pool.end();
  
  const reviews = reviewsResult.rows.map(row => ({
    ...row,
    reviewer: row.reviewer_id ? {
      id: row.reviewer_id,
      full_name: row.reviewer_full_name,
      avatar_url: row.reviewer_avatar_url
    } : null
  }));

  // Filter reviews to only include those with actual comments
  const reviewsWithComments = reviews.filter(r => r.comment && r.comment.trim());

  // Calculate average rating from ALL reviews (including rating-only ones)
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const isOwnProfile = currentUser?.id === params.userId;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 min-w-0">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profileUser?.avatar_url || ''} alt={profileUser?.full_name || 'User'} />
                  <AvatarFallback className="text-4xl">
                    {profileUser?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">{profileUser?.full_name || 'Anonymous User'}</CardTitle>
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
                  {averageRating.toFixed(1)} ({reviews?.length || 0} {reviews?.length === 1 ? 'rating' : 'ratings'})
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

              {!isOwnProfile && currentUser && (
                <div className="border-t pt-4 space-y-3">
                  <FollowButton userId={params.userId} />
                  <ConnectButton userId={params.userId} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8 min-w-0">
          {!isOwnProfile && currentUser && (
            <Card>
              <CardHeader>
                <CardTitle>Leave a Review</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewForm 
                  userId={params.userId} 
                  currentUserId={currentUser.id}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Comments ({reviewsWithComments?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewList reviews={reviewsWithComments || []} />
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
