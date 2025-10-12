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
    const {
      title,
      description,
      starting_price,
      reserve_price,
      category,
      start_date,
      end_date,
      image_url,
    } = body;

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

    // Update the auction
    const { data, error } = await supabase
      .from('auctions')
      .update({
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
