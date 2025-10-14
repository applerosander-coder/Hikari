'use server';

import { revalidatePath } from 'next/cache';

export async function processWinners() {
  try {
    const cronSecret = process.env.CRON_SECRET || 'dev-secret';
    
    // Call the process-winners API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'}/api/auctions/process-winners`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to process winners');
    }

    // Revalidate pages that show payment/winner data
    revalidatePath('/mybids');
    revalidatePath('/dashboard');

    // Handle empty state when no winners to process
    if (!data.processed || data.processed === 0) {
      return {
        success: true,
        message: data.message || '✅ No winners to process at this time',
        details: [],
      };
    }

    const successCount = (data.results || []).filter((r: any) => r.status === 'success').length;

    return {
      success: true,
      message: `✅ Processed ${data.processed} winner(s). ${successCount} payment(s) succeeded.`,
      details: data.results || [],
    };
  } catch (error: any) {
    console.error('Error processing winners:', error);
    return { error: error.message };
  }
}
