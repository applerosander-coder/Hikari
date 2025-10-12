import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

type EndAuctionResult = {
  auction_id: string;
  status: string;
  winner_id?: string;
  error?: string;
};

const createServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.CRON_SECRET || 'dev-secret';
    
    const isAuthorized = authHeader === `Bearer ${expectedKey}`;
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const now = new Date().toISOString();

    // Step 1: Publish draft auctions whose start_date has been reached
    const { data: draftAuctions, error: draftFetchError } = await supabase
      .from('auctions')
      .select('id, title')
      .eq('status', 'draft')
      .lte('start_date', now);

    const publishedCount = draftAuctions?.length || 0;

    if (draftAuctions && draftAuctions.length > 0) {
      const { error: publishError } = await supabase
        .from('auctions')
        .update({
          status: 'active',
          updated_at: now
        })
        .in('id', draftAuctions.map(a => a.id));

      if (publishError) {
        console.error('Error publishing draft auctions:', publishError);
      } else {
        console.log(`Published ${publishedCount} draft auctions`);
      }
    }

    // Step 2: End active auctions whose end_date has passed
    const { data: expiredAuctions, error: fetchError } = await supabase
      .from('auctions')
      .select('id, title, current_bid')
      .eq('status', 'active')
      .lt('end_date', now);

    if (fetchError) {
      console.error('Error fetching expired auctions:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch auctions' }, { status: 500 });
    }

    if (!expiredAuctions || expiredAuctions.length === 0) {
      return NextResponse.json({ 
        message: 'Auction lifecycle check complete',
        published: publishedCount,
        ended: 0
      });
    }

    const results: EndAuctionResult[] = [];

    for (const auction of expiredAuctions) {
      try {
        const { data: highestBid } = await supabase
          .from('bids')
          .select('user_id, bid_amount')
          .eq('auction_id', auction.id)
          .order('bid_amount', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (highestBid) {
          const { error: updateError } = await supabase
            .from('auctions')
            .update({
              status: 'ended',
              winner_id: highestBid.user_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', auction.id);

          if (updateError) {
            console.error(`Error updating auction ${auction.id}:`, updateError);
            results.push({
              auction_id: auction.id,
              status: 'error',
              error: updateError.message
            });
          } else {
            results.push({
              auction_id: auction.id,
              status: 'ended',
              winner_id: highestBid.user_id
            });
          }
        } else {
          const { error: updateError } = await supabase
            .from('auctions')
            .update({
              status: 'ended',
              winner_id: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', auction.id);

          if (updateError) {
            console.error(`Error updating auction ${auction.id}:`, updateError);
            results.push({
              auction_id: auction.id,
              status: 'error',
              error: updateError.message
            });
          } else {
            results.push({
              auction_id: auction.id,
              status: 'ended_no_bids'
            });
          }
        }
      } catch (error: any) {
        console.error(`Error processing auction ${auction.id}:`, error);
        results.push({
          auction_id: auction.id,
          status: 'error',
          error: error.message
        });
      }
    }

    return NextResponse.json({
      message: 'Auction lifecycle check complete',
      published: publishedCount,
      ended: results.length,
      results
    });
  } catch (error: any) {
    console.error('Error in end-auctions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
