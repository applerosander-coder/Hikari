import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '5');

    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    // Fetch reviews with JOIN to get fresh reviewer data
    const reviewsResult = await pool.query(`
      SELECT 
        ur.*,
        u.id as reviewer_id,
        u.full_name as reviewer_full_name,
        u.avatar_url as reviewer_avatar_url
      FROM user_reviews ur
      LEFT JOIN users u ON ur.reviewer_id = u.id
      WHERE ur.user_id = $1 AND ur.comment IS NOT NULL AND ur.comment != ''
      ORDER BY ur.created_at DESC
      LIMIT $2 OFFSET $3
    `, [params.userId, limit, offset]);

    // Get total count of reviews with comments
    const countResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM user_reviews
      WHERE user_id = $1 AND comment IS NOT NULL AND comment != ''
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

    const total = parseInt(countResult.rows[0]?.total || '0');

    return NextResponse.json({ 
      reviews,
      total,
      hasMore: offset + limit < total
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
