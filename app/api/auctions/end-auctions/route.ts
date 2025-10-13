import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

type EndAuctionResult = {
  auction_id: string;
  item_id?: string;
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
      .select('id, name')
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
      .select('id, name')
      .eq('status', 'active')
      .lt('end_date', now);

    if (fetchError) {
      console.error('Error fetching expired auctions:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch auctions' }, { status: 500 });
    }

    const results: EndAuctionResult[] = [];

    if (expiredAuctions && expiredAuctions.length > 0) {
      // End the auction containers
      const { error: updateError } = await supabase
        .from('auctions')
        .update({
          status: 'ended',
          updated_at: now
        })
        .in('id', expiredAuctions.map(a => a.id));

      if (updateError) {
        console.error('Error ending auctions:', updateError);
      }

      // Process each auction's items
      for (const auction of expiredAuctions) {
        try {
          // Get all items for this auction
          const { data: items, error: itemsError } = await supabase
            .from('auction_items')
            .select('id, title, current_bid')
            .eq('auction_id', auction.id);

          if (itemsError) {
            console.error(`Error fetching items for auction ${auction.id}:`, itemsError);
            continue;
          }

          if (!items || items.length === 0) {
            results.push({
              auction_id: auction.id,
              status: 'ended_no_items'
            });
            continue;
          }

          // Process each item to determine winners
          for (const item of items) {
            try {
              const { data: highestBid } = await supabase
                .from('bids')
                .select('user_id, bid_amount')
                .eq('auction_item_id', item.id)
                .order('bid_amount', { ascending: false })
                .limit(1)
                .maybeSingle();

              if (highestBid) {
                // Update item with winner
                const { error: itemUpdateError } = await supabase
                  .from('auction_items')
                  .update({
                    winner_id: highestBid.user_id,
                    updated_at: now
                  })
                  .eq('id', item.id);

                if (itemUpdateError) {
                  console.error(`Error updating item ${item.id}:`, itemUpdateError);
                  results.push({
                    auction_id: auction.id,
                    item_id: item.id,
                    status: 'error',
                    error: itemUpdateError.message
                  });
                } else {
                  results.push({
                    auction_id: auction.id,
                    item_id: item.id,
                    status: 'ended',
                    winner_id: highestBid.user_id
                  });
                }
              } else {
                // No bids on this item
                results.push({
                  auction_id: auction.id,
                  item_id: item.id,
                  status: 'ended_no_bids'
                });
              }
            } catch (error: any) {
              console.error(`Error processing item ${item.id}:`, error);
              results.push({
                auction_id: auction.id,
                item_id: item.id,
                status: 'error',
                error: error.message
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
    }

    return NextResponse.json({
      message: 'Auction lifecycle check complete',
      published: publishedCount,
      ended_auctions: expiredAuctions?.length || 0,
      processed_items: results.length,
      results
    });
  } catch (error: any) {
    console.error('Error in end-auctions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
