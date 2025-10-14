import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { auctionId, status } = await request.json();

    if (!auctionId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate status - only allow draft and active
    const allowedStatuses = ['draft', 'active'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // Verify the user owns this auction
    const { data: auction, error: fetchError } = await supabase
      .from('auctions')
      .select('created_by')
      .eq('id', auctionId)
      .single();

    if (fetchError || !auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    if (auction.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the auction status
    const { error: updateError } = await supabase
      .from('auctions')
      .update({ status })
      .eq('id', auctionId);

    if (updateError) {
      console.error('Error updating auction status:', updateError);
      return NextResponse.json({ error: 'Failed to update auction' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in update-status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
