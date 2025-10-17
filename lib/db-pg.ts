import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export async function saveUserReview(
  userId: string,
  reviewerId: string,
  rating: number,
  comment: string | null
) {
  const query = `
    INSERT INTO public.user_reviews (user_id, reviewer_id, rating, comment, updated_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (user_id, reviewer_id)
    DO UPDATE SET 
      rating = $3,
      comment = COALESCE($4, public.user_reviews.comment),
      updated_at = NOW()
    RETURNING *;
  `;

  const result = await pool.query(query, [userId, reviewerId, rating, comment]);
  return result.rows[0];
}

export async function getUserReviews(userId: string) {
  const query = `
    SELECT ur.*, u.full_name as reviewer_name, u.avatar_url as reviewer_avatar
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
