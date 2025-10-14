import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Support both old (single auction) and new (auction + items) format
    const isNewFormat = body.auction && body.items;
    
    if (isNewFormat) {
      // New format: auction container with items
      const { auction, items } = body;
      
      // Validate auction container fields
      if (!auction.name || !auction.end_date) {
        return NextResponse.json(
          { error: 'Missing required auction fields (name, end_date)' },
          { status: 400 }
        );
      }

      // Validate items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: 'At least one item is required' },
          { status: 400 }
        );
      }

      // Ensure created_by matches authenticated user
      if (auction.created_by !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Create the auction container
      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .insert([{
          name: auction.name,
          place: auction.place,
          title: auction.title, // Legacy field
          description: auction.description, // Legacy field
          starting_price: auction.starting_price, // Legacy field
          reserve_price: auction.reserve_price, // Legacy field
          category: auction.category, // Legacy field
          image_url: auction.image_url, // Legacy field
          start_date: auction.start_date || new Date().toISOString(),
          end_date: auction.end_date,
          created_by: user.id,
          status: auction.status || 'draft',
        }])
        .select()
        .single();

      if (auctionError) {
        console.error('Supabase error creating auction:', auctionError);
        return NextResponse.json(
          { error: 'Failed to create auction', details: auctionError.message },
          { status: 500 }
        );
      }

      // Create auction items
      const itemsToInsert = items.map(item => ({
        auction_id: auctionData.id,
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
        console.error('Supabase error creating items:', itemsError);
        // Rollback: delete the auction we just created
        await supabase.from('auctions').delete().eq('id', auctionData.id);
        return NextResponse.json(
          { error: 'Failed to create auction items', details: itemsError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        data: { 
          auction: auctionData, 
          items: itemsData 
        } 
      }, { status: 201 });

    } else {
      // Old format: single auction (backward compatibility)
      if (!body.title || !body.starting_price || !body.end_date) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      if (body.created_by !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Create the auction (old way)
      const { data, error } = await supabase
        .from('auctions')
        .insert([{
          title: body.title,
          description: body.description,
          starting_price: body.starting_price,
          reserve_price: body.reserve_price,
          category: body.category,
          start_date: body.start_date || new Date().toISOString(),
          end_date: body.end_date,
          created_by: user.id,
          status: body.status || 'draft',
          image_url: body.image_url,
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to create auction' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data }, { status: 201 });
    }
  } catch (error) {
    console.error('Error in create auction API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
