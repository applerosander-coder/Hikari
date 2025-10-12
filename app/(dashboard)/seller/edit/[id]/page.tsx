import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { EditAuctionForm } from '@/components/edit-auction-form';

export default async function EditAuctionPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  // Fetch the auction to edit
  const { data: auction, error } = await supabase
    .from('auctions')
    .select('*')
    .eq('id', params.id)
    .eq('created_by', user.id)
    .single();

  if (error || !auction) {
    redirect('/seller');
  }

  // Only allow editing draft auctions
  if (auction.status !== 'draft') {
    redirect('/seller');
  }

  return (
    <div className="w-full px-4 sm:px-6 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit Draft Auction</h1>
          <p className="text-muted-foreground mt-2">
            Update your auction details before publishing
          </p>
        </div>

        <EditAuctionForm auction={auction} userId={user.id} />
      </div>
    </div>
  );
}
