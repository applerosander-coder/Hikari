'use server';

import { revalidatePath } from 'next/cache';

export async function processWinners() {
  try {
    const cronSecret = process.env.CRON_SECRET || 'dev-secret';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000';
    
    // Step 1: End auctions and determine winners
    const endResponse = await fetch(
      `${baseUrl}/api/auctions/end-auctions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const endData = await endResponse.json();
    
    if (!endResponse.ok) {
      throw new Error(endData.error || 'Failed to end auctions');
    }

    // Step 2: Process winners and charge payments
    const response = await fetch(
      `${baseUrl}/api/auctions/process-winners`,
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
      const endedCount = endData.processed_items || 0;
      const endedMessage = endedCount > 0 
        ? `Ended ${endedCount} auction item(s). ` 
        : '';
      
      return {
        success: true,
        message: `✅ ${endedMessage}${data.message || 'No winners to process at this time'}`,
        details: [],
      };
    }

    const successCount = (data.results || []).filter((r: any) => r.status === 'success').length;
    const endedCount = endData.processed_items || 0;

    return {
      success: true,
      message: `✅ Ended ${endedCount} item(s). Processed ${data.processed} winner(s). ${successCount} payment(s) succeeded.`,
      details: data.results || [],
    };
  } catch (error: any) {
    console.error('Error processing winners:', error);
    return { error: error.message };
  }
}
