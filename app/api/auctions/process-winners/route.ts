import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { Database } from '@/types/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

type ProcessResult = {
  auction_id: string;
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

    const { data: endedAuctions, error: auctionError } = await supabase
      .from('auctions')
      .select('*, bids(*)')
      .eq('status', 'ended')
      .eq('payment_completed', false)
      .is('payment_intent_id', null)
      .not('current_bid', 'is', null);

    if (auctionError) {
      console.error('Error fetching ended auctions:', auctionError);
      return NextResponse.json({ error: 'Failed to fetch auctions' }, { status: 500 });
    }

    if (!endedAuctions || endedAuctions.length === 0) {
      return NextResponse.json({ message: 'No auctions to process' });
    }

    const results: ProcessResult[] = [];

    for (const auction of endedAuctions) {
      try {
        const bids = auction.bids as any[];
        
        if (!bids || bids.length === 0) continue;

        const winningBid = bids.reduce((highest, current) => 
          current.bid_amount > highest.bid_amount ? current : highest
        );

        const winnerId = winningBid.user_id;

        const { data: winner, error: winnerError } = await supabase
          .from('customers')
          .select('stripe_customer_id')
          .eq('id', winnerId)
          .single();

        if (winnerError || !winner?.stripe_customer_id) {
          console.error('Winner has no payment method:', winnerId);
          
          await supabase
            .from('auctions')
            .update({
              winner_id: winnerId,
              payment_intent_id: 'no_payment_method',
            })
            .eq('id', auction.id);

          await supabase.from('notifications').insert({
            user_id: winnerId,
            type: 'payment_failed',
            title: 'Action Required: Add Payment Method',
            message: `You won the auction "${auction.title}" but don't have a payment method on file. Please add one to complete your purchase.`,
            auction_id: auction.id,
          });
          
          results.push({
            auction_id: auction.id,
            status: 'no_payment_method',
          });
          
          continue;
        }

        const { data: paymentMethods } = await stripe.paymentMethods.list({
          customer: winner.stripe_customer_id,
          type: 'card',
        });

        if (!paymentMethods || paymentMethods.length === 0) {
          await supabase
            .from('auctions')
            .update({
              winner_id: winnerId,
              payment_intent_id: 'no_payment_method',
            })
            .eq('id', auction.id);

          await supabase.from('notifications').insert({
            user_id: winnerId,
            type: 'payment_failed',
            title: 'Action Required: Add Payment Method',
            message: `You won the auction "${auction.title}" but don't have a payment method on file. Please add one to complete your purchase.`,
            auction_id: auction.id,
          });
          
          results.push({
            auction_id: auction.id,
            status: 'no_payment_method',
          });
          
          continue;
        }

        const bidAmount = auction.current_bid!;

        const paymentIntent = await stripe.paymentIntents.create({
          amount: bidAmount,
          currency: 'usd',
          customer: winner.stripe_customer_id,
          payment_method: paymentMethods[0].id,
          off_session: true,
          confirm: true,
          metadata: {
            auction_id: auction.id,
            winner_id: winnerId,
            type: 'auction_win',
          },
          description: `Auction win: ${auction.title}`,
        });

        if (paymentIntent.status === 'succeeded') {
          await supabase
            .from('auctions')
            .update({
              winner_id: winnerId,
              payment_completed: true,
              payment_intent_id: paymentIntent.id,
              payment_completed_at: new Date().toISOString(),
            })
            .eq('id', auction.id);

          await supabase.from('notifications').insert({
            user_id: winnerId,
            type: 'auction_won',
            title: 'Congratulations! You Won! 🎉',
            message: `You won the auction "${auction.title}" for $${(bidAmount / 100).toFixed(2)}. Payment completed successfully.`,
            auction_id: auction.id,
          });

          await supabase
            .from('payments')
            .insert({
              user_id: winnerId,
              auction_id: auction.id,
              stripe_payment_intent_id: paymentIntent.id,
              amount: bidAmount,
              currency: 'usd',
              status: 'succeeded',
              metadata: {
                auction_title: auction.title,
              },
            });

          results.push({
            auction_id: auction.id,
            status: 'success',
            payment_intent_id: paymentIntent.id,
          });
        } else {
          await supabase
            .from('auctions')
            .update({
              winner_id: winnerId,
              payment_intent_id: paymentIntent.id,
            })
            .eq('id', auction.id);

          await supabase.from('notifications').insert({
            user_id: winnerId,
            type: 'payment_failed',
            title: 'Payment Failed',
            message: `Your payment for the auction "${auction.title}" failed. Please update your payment method.`,
            auction_id: auction.id,
          });

          results.push({
            auction_id: auction.id,
            status: 'payment_failed',
            reason: paymentIntent.status,
          });
        }
      } catch (error: any) {
        console.error(`Error processing auction ${auction.id}:`, error);
        
        const bids = auction.bids as any[];
        const winningBid = bids.reduce((highest, current) => 
          current.bid_amount > highest.bid_amount ? current : highest
        );
        const winnerId = winningBid.user_id;

        await supabase
          .from('auctions')
          .update({
            payment_intent_id: 'failed',
            winner_id: winnerId,
          })
          .eq('id', auction.id);

        await supabase.from('notifications').insert({
          user_id: winnerId,
          type: 'payment_failed',
          title: 'Payment Failed',
          message: `Your payment for the auction "${auction.title}" failed. Please update your payment method and try again.`,
          auction_id: auction.id,
        });

        results.push({
          auction_id: auction.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: 'Auction processing complete',
      results,
    });
  } catch (error: any) {
    console.error('Error in process-winners:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
