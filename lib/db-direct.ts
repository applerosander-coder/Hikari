import { createClient } from '@/utils/supabase/server';

/**
 * Execute raw SQL query directly, bypassing PostgREST schema cache
 */
export async function executeRawSQL<T = any>(
  query: string,
  params: any[] = []
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const supabase = await createClient();
    
    // Use rpc to execute raw SQL if available, otherwise use standard query
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: query
    }) as any;

    if (error) {
      return { data: null, error: new Error(error.message || 'SQL execution failed') };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Insert or update a review using raw SQL
 */
export async function upsertReviewDirect(
  userId: string,
  reviewerId: string,
  rating: number,
  comment?: string | null
): Promise<{ success: boolean; error?: string }> {
  const sql = `
    INSERT INTO user_reviews (user_id, reviewer_id, rating, comment, updated_at)
    VALUES ('${userId}', '${reviewerId}', ${rating}, ${comment ? `'${comment.replace(/'/g, "''")}'` : 'NULL'}, NOW())
    ON CONFLICT (user_id, reviewer_id)
    DO UPDATE SET 
      rating = ${rating},
      ${comment !== undefined ? `comment = ${comment ? `'${comment.replace(/'/g, "''")}'` : 'NULL'},` : ''}
      updated_at = NOW()
    RETURNING *;
  `;

  const { data, error } = await executeRawSQL(sql);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get existing review comment to preserve it
 */
export async function getExistingComment(
  userId: string,
  reviewerId: string
): Promise<string | null> {
  const sql = `
    SELECT comment FROM user_reviews 
    WHERE user_id = '${userId}' AND reviewer_id = '${reviewerId}'
    LIMIT 1;
  `;

  const { data } = await executeRawSQL<any[]>(sql);

  if (data && data.length > 0 && data[0].comment) {
    return data[0].comment;
  }

  return null;
}
