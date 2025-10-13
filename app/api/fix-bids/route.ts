import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Find all bids with auction_item_id but missing auction_id
  const { data: bidsToFix, error: fetchError } = await supabase
    .from('bids')
    .select('id, auction_item_id, auction_items(auction_id)')
    .not('auction_item_id', 'is', null)
    .is('auction_id', null);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!bidsToFix || bidsToFix.length === 0) {
    return NextResponse.json({ message: 'No bids to fix' });
  }

  // Update each bid with the parent auction_id
  const updates = [];
  for (const bid of bidsToFix) {
    if (bid.auction_items?.auction_id) {
      const { error } = await supabase
        .from('bids')
        .update({ auction_id: bid.auction_items.auction_id })
        .eq('id', bid.id);
      
      if (error) {
        console.error('Error updating bid:', bid.id, error);
      } else {
        updates.push(bid.id);
      }
    }
  }

  return NextResponse.json({
    success: true,
    message: `Fixed ${updates.length} bids`,
    fixed: updates
  });
}
