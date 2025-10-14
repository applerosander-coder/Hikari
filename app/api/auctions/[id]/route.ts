import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/auctions/[id] - Update a draft auction
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Verify the auction belongs to the user and is a draft
    const { data: existingAuction, error: fetchError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', params.id)
      .eq('created_by', user.id)
      .single();

    if (fetchError || !existingAuction) {
      return NextResponse.json(
        { error: 'Auction not found or unauthorized' },
        { status: 404 }
      );
    }

    if (existingAuction.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft auctions can be edited' },
        { status: 400 }
      );
    }

    // Check if this is the new format with items
    const isNewFormat = body.auction && body.items;

    if (isNewFormat) {
      const { auction, items } = body;

      // Validate items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: 'At least one item is required' },
          { status: 400 }
        );
      }

      // Update the auction container
      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .update({
          name: auction.name,
          place: auction.place,
          title: auction.title,
          description: auction.description,
          starting_price: auction.starting_price,
          reserve_price: auction.reserve_price,
          category: auction.category,
          start_date: auction.start_date,
          end_date: auction.end_date,
          image_url: auction.image_url,
        })
        .eq('id', params.id)
        .select()
        .single();

      if (auctionError) {
        console.error('Error updating auction:', auctionError);
        return NextResponse.json(
          { error: 'Failed to update auction' },
          { status: 500 }
        );
      }

      // Delete existing items
      await supabase
        .from('auction_items')
        .delete()
        .eq('auction_id', params.id);

      // Insert new/updated items
      const itemsToInsert = items.map(item => ({
        auction_id: params.id,
        title: item.title,
        description: item.description,
        starting_price: item.starting_price,
        reserve_price: item.reserve_price,
        category: item.category,
        image_url: item.image_url,
        position: item.position,
      }));

      const { data: itemsData, error: itemsError } = await supabase
        .from('auction_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) {
        console.error('Error updating items:', itemsError);
        return NextResponse.json(
          { error: 'Failed to update auction items' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        data: { 
          auction: auctionData, 
          items: itemsData 
        } 
      }, { status: 200 });
    } else {
      // Legacy format - single auction update
      const {
        name,
        place,
        title,
        description,
        starting_price,
        reserve_price,
        category,
        start_date,
        end_date,
        image_url,
      } = body;

      const { data, error } = await supabase
        .from('auctions')
        .update({
          name,
          place,
          title,
          description,
          starting_price,
          reserve_price,
          category,
          start_date,
          end_date,
          image_url,
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating auction:', error);
        return NextResponse.json(
          { error: 'Failed to update auction' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data }, { status: 200 });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/auctions/[id] - Delete a draft auction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the auction belongs to the user and is a draft
    const { data: existingAuction, error: fetchError } = await supabase
      .from('auctions')
      .select('status, created_by')
      .eq('id', params.id)
      .eq('created_by', user.id)
      .single();

    if (fetchError || !existingAuction) {
      return NextResponse.json(
        { error: 'Auction not found or unauthorized' },
        { status: 404 }
      );
    }

    if (existingAuction.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft auctions can be deleted' },
        { status: 400 }
      );
    }

    // Delete the auction
    const { error } = await supabase
      .from('auctions')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting auction:', error);
      return NextResponse.json(
        { error: 'Failed to delete auction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
