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

      // Separate existing items (with ID) from new items (without ID)
      const existingItemsToUpdate = items.filter(item => item.id);
      const newItemsToInsert = items.filter(item => !item.id);

      // Get current auction item IDs
      const { data: currentItems } = await supabase
        .from('auction_items')
        .select('id')
        .eq('auction_id', params.id);

      const currentItemIds = currentItems?.map(item => item.id) || [];
      
      // Validate that all client-supplied item IDs belong to this auction
      const clientItemIds = existingItemsToUpdate.map(item => item.id);
      const invalidItemIds = clientItemIds.filter(id => !currentItemIds.includes(id));
      
      if (invalidItemIds.length > 0) {
        console.error('Invalid item IDs provided:', invalidItemIds);
        return NextResponse.json(
          { error: 'Invalid item IDs - some items do not belong to this auction' },
          { status: 403 }
        );
      }

      const itemIdsToKeep = existingItemsToUpdate.map(item => item.id);
      const itemIdsToDelete = currentItemIds.filter(id => !itemIdsToKeep.includes(id));

      // Delete removed items (with double-check on auction_id)
      if (itemIdsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('auction_items')
          .delete()
          .in('id', itemIdsToDelete)
          .eq('auction_id', params.id);

        if (deleteError) {
          console.error('Error deleting removed items:', deleteError);
          return NextResponse.json(
            { error: 'Failed to delete removed items' },
            { status: 500 }
          );
        }
      }

      // Update existing items using RPC function (bypasses schema cache)
      if (existingItemsToUpdate.length > 0) {
        const updatePromises = existingItemsToUpdate.map(item => 
          supabase.rpc('update_auction_item_with_category' as any, {
            p_item_id: item.id,
            p_auction_id: params.id,
            p_title: item.title,
            p_description: item.description,
            p_starting_price: item.starting_price,
            p_reserve_price: item.reserve_price,
            p_category: item.category || null,
            p_image_url: item.image_url,
            p_position: item.position,
          })
        );

        const updateResults = await Promise.all(updatePromises);
        const updateError = updateResults.find(result => result.error);
        
        if (updateError) {
          console.error('Error updating items:', updateError.error);
          return NextResponse.json(
            { error: 'Failed to update auction items' },
            { status: 500 }
          );
        }
      }

      // Insert new items using RPC function (bypasses schema cache)
      let newItemsData = [];
      if (newItemsToInsert.length > 0) {
        const insertPromises = newItemsToInsert.map(item => 
          supabase.rpc('insert_auction_item_with_category' as any, {
            p_auction_id: params.id,
            p_title: item.title,
            p_description: item.description,
            p_starting_price: item.starting_price,
            p_reserve_price: item.reserve_price,
            p_category: item.category || null,
            p_image_url: item.image_url,
            p_position: item.position,
          })
        );

        const insertResults = await Promise.all(insertPromises);
        const insertError = insertResults.find(result => result.error);

        if (insertError) {
          console.error('Error inserting new items:', insertError.error);
          return NextResponse.json(
            { error: 'Failed to insert new items' },
            { status: 500 }
          );
        }
      }

      // Fetch all current items to return
      const { data: itemsData } = await supabase
        .from('auction_items')
        .select('*')
        .eq('auction_id', params.id)
        .order('position', { ascending: true });

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
