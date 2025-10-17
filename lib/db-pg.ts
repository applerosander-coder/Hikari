import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export async function saveUserReview(
  userId: string,
  reviewerId: string,
  rating: number,
  comment: string | null,
  reviewerName?: string | null,
  reviewerAvatar?: string | null
) {
  const query = `
    INSERT INTO public.user_reviews (user_id, reviewer_id, rating, comment, reviewer_name, reviewer_avatar, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (user_id, reviewer_id)
    DO UPDATE SET 
      rating = $3,
      comment = COALESCE($4, public.user_reviews.comment),
      reviewer_name = COALESCE($5, public.user_reviews.reviewer_name),
      reviewer_avatar = COALESCE($6, public.user_reviews.reviewer_avatar),
      updated_at = NOW()
    RETURNING *;
  `;

  const result = await pool.query(query, [userId, reviewerId, rating, comment, reviewerName, reviewerAvatar]);
  return result.rows[0];
}

export async function getUserReviews(userId: string) {
  const query = `
    SELECT 
      ur.*,
      COALESCE(ur.reviewer_name, u.full_name) as reviewer_name,
      COALESCE(ur.reviewer_avatar, u.avatar_url) as reviewer_avatar
    FROM public.user_reviews ur
    LEFT JOIN public.users u ON ur.reviewer_id = u.id
    WHERE ur.user_id = $1
    ORDER BY ur.created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
}

export async function getUserReview(userId: string, reviewerId: string) {
  const query = `
    SELECT * FROM public.user_reviews
    WHERE user_id = $1 AND reviewer_id = $2;
  `;

  const result = await pool.query(query, [userId, reviewerId]);
  return result.rows[0] || null;
}

export async function getAverageRating(userId: string) {
  const query = `
    SELECT 
      COALESCE(AVG(rating), 0) as average_rating,
      COUNT(*) as review_count
    FROM public.user_reviews
    WHERE user_id = $1;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows[0];
}

export async function getUserInfo(userId: string) {
  const query = `
    SELECT full_name, avatar_url
    FROM public.users
    WHERE id = $1;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
}

export async function updateUserAvatar(userId: string, avatarUrl: string, fullName?: string) {
  const query = `
    INSERT INTO public.users (id, avatar_url, full_name)
    VALUES ($1, $2, $3)
    ON CONFLICT (id)
    DO UPDATE SET 
      avatar_url = $2,
      full_name = COALESCE($3, public.users.full_name)
    RETURNING *;
  `;

  const result = await pool.query(query, [userId, avatarUrl, fullName]);
  return result.rows[0];
}

export async function getUserProfile(userId: string, authUserMetadata?: { full_name?: string; avatar_url?: string }) {
  const publicQuery = `
    SELECT full_name, avatar_url
    FROM public.users
    WHERE id = $1;
  `;

  const result = await pool.query(publicQuery, [userId]);
  let publicUser = result.rows[0];

  if (!publicUser && authUserMetadata) {
    const insertQuery = `
      INSERT INTO public.users (id, full_name, avatar_url)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING
      RETURNING full_name, avatar_url;
    `;
    
    const insertResult = await pool.query(insertQuery, [
      userId,
      authUserMetadata.full_name || null,
      authUserMetadata.avatar_url || null
    ]);
    publicUser = insertResult.rows[0];
  }

  return {
    id: userId,
    full_name: publicUser?.full_name || authUserMetadata?.full_name || 'User',
    avatar_url: publicUser?.avatar_url || authUserMetadata?.avatar_url || null
  };
}
