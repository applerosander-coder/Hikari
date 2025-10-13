import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { Database } from '@/types/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

type ProcessResult = {
  auction_id: string;
  item_id: string;
  status: string;
  payment_intent_id?: string;
  reason?: string;
  error?: string;
};

const createServiceClient = () => {
  return createClient<Database>(
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

    // Find auction items that have ended, have winners, but haven't been processed for payment
    const { data: wonItems, error: itemError } = await supabase
      .from('auction_items')
      .select(`
        *,
        auction:auctions (
          id,
          name,
          status,
          end_date
        )
      `)
      .not('winner_id', 'is', null)
      .not('current_bid', 'is', null);

    if (itemError) {
      console.error('Error fetching won items:', itemError);
      return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }

    if (!wonItems || wonItems.length === 0) {
      return NextResponse.json({ message: 'No items to process' });
    }

    // Filter items from ended auctions that haven't been paid yet
    const now = new Date();
    const itemsToProcess = wonItems.filter(item => {
      const auction = item.auction as any;
      if (!auction) return false;
      
      const endDate = new Date(auction.end_date);
      const hasEnded = auction.status === 'ended' || endDate < now;
      
      // Check if payment already exists for this item
      return hasEnded;
    });

    const results: ProcessResult[] = [];

    for (const item of itemsToProcess) {
      try {
        const auction = item.auction as any;
        const winnerId = item.winner_id!;
        const bidAmount = item.current_bid!;

        // Check if payment already processed
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('id')
          .eq('auction_item_id', item.id)
          .eq('user_id', winnerId)
          .maybeSingle();

        if (existingPayment) {
          results.push({
            auction_id: auction.id,
            item_id: item.id,
            status: 'already_processed',
          });
          continue;
        }

        // Get winner's Stripe customer info
        const { data: winner, error: winnerError } = await supabase
          .from('customers')
          .select('stripe_customer_id')
          .eq('id', winnerId)
          .single();

        if (winnerError || !winner?.stripe_customer_id) {
          console.error('Winner has no Stripe customer:', winnerId);
          
          await supabase.from('notifications').insert({
            user_id: winnerId,
            type: 'payment_failed',
            title: 'Action Required: Add Payment Method',
            message: `You won "${item.title}" from ${auction.name} but don't have a payment method on file. Please add one to complete your purchase.`,
            auction_id: auction.id,
            auction_item_id: item.id,
          });
          
          results.push({
            auction_id: auction.id,
            item_id: item.id,
            status: 'no_payment_method',
          });
          
          continue;
        }

        // Get payment methods
        const { data: paymentMethods } = await stripe.paymentMethods.list({
          customer: winner.stripe_customer_id,
          type: 'card',
        });

        if (!paymentMethods || paymentMethods.length === 0) {
          await supabase.from('notifications').insert({
            user_id: winnerId,
            type: 'payment_failed',
            title: 'Action Required: Add Payment Method',
            message: `You won "${item.title}" from ${auction.name} but don't have a payment method on file. Please add one to complete your purchase.`,
            auction_id: auction.id,
            auction_item_id: item.id,
          });
          
          results.push({
            auction_id: auction.id,
            item_id: item.id,
            status: 'no_payment_method',
          });
          
          continue;
        }

        // Create payment intent and charge
        const paymentIntent = await stripe.paymentIntents.create({
          amount: bidAmount,
          currency: 'usd',
          customer: winner.stripe_customer_id,
          payment_method: paymentMethods[0].id,
          off_session: true,
          confirm: true,
          metadata: {
            auction_id: auction.id,
            auction_item_id: item.id,
            winner_id: winnerId,
            type: 'winner_charge',
          },
          description: `Won: ${item.title} from ${auction.name}`,
        });

        if (paymentIntent.status === 'succeeded') {
          // Create payment record
          await supabase
            .from('payments')
            .insert({
              user_id: winnerId,
              auction_id: auction.id,
              auction_item_id: item.id,
              stripe_payment_intent_id: paymentIntent.id,
              amount: bidAmount,
              currency: 'usd',
              status: 'succeeded',
              metadata: {
                auction_name: auction.name,
                item_title: item.title,
              },
            });

          // Send congratulations notification
          await supabase.from('notifications').insert({
            user_id: winnerId,
            type: 'auction_won',
            title: 'Congratulations! You Won! 🎉',
            message: `You won "${item.title}" from ${auction.name} for $${(bidAmount / 100).toFixed(2)}. Payment completed successfully!`,
            auction_id: auction.id,
            auction_item_id: item.id,
          });

          results.push({
            auction_id: auction.id,
            item_id: item.id,
            status: 'success',
            payment_intent_id: paymentIntent.id,
          });

          console.log(`✅ Successfully charged winner for item ${item.id}: $${(bidAmount / 100).toFixed(2)}`);
        } else {
          // Payment failed or requires action
          await supabase.from('notifications').insert({
            user_id: winnerId,
            type: 'payment_failed',
            title: 'Payment Failed',
            message: `Your payment for "${item.title}" from ${auction.name} failed. Please update your payment method.`,
            auction_id: auction.id,
            auction_item_id: item.id,
          });

          results.push({
            auction_id: auction.id,
            item_id: item.id,
            status: 'payment_failed',
            reason: paymentIntent.status,
          });

          console.log(`❌ Payment failed for item ${item.id}: ${paymentIntent.status}`);
        }
      } catch (error: any) {
        console.error(`Error processing item ${item.id}:`, error);
        
        const auction = item.auction as any;
        const winnerId = item.winner_id!;

        await supabase.from('notifications').insert({
          user_id: winnerId,
          type: 'payment_failed',
          title: 'Payment Failed',
          message: `Your payment for "${item.title}" from ${auction.name} failed. Please update your payment method and try again.`,
          auction_id: auction.id,
          auction_item_id: item.id,
        });

        results.push({
          auction_id: auction.id,
          item_id: item.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: 'Winner processing complete',
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Error in process-winners:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
