import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  
  try {
    // Fetch auctions
    const { data: auctionsData, error } = await supabase
      .from('auctions')
      .select('*')
      .in('status', ['active', 'upcoming'])
      .order('end_date', { ascending: true });

    if (error) {
      console.error('Error fetching auctions:', error);
      return NextResponse.json({ error: 'Failed to fetch auctions' }, { status: 500 });
    }

    // Fetch creator info for those auctions
    let auctions = auctionsData || [];
    if (auctionsData && auctionsData.length > 0) {
      const creatorIds = Array.from(new Set(auctionsData.map(a => a.created_by).filter(Boolean)));
      
      if (creatorIds.length > 0) {
        const { data: creators, error: creatorsError } = await supabase
          .from('users')
          .select('id, avatar_url, full_name')
          .in('id', creatorIds);
        
        if (creatorsError) {
          console.error('Error fetching creators:', creatorsError);
        }
        
        const creatorMap = new Map(creators?.map(c => [c.id, c]) || []);
        
        auctions = auctionsData.map(auction => ({
          ...auction,
          users: auction.created_by ? creatorMap.get(auction.created_by) : null
        }));
      }
    }

    return NextResponse.json(auctions);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
