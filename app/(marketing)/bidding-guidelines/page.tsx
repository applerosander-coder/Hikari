import Link from 'next/link';
import { Gavel, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function BiddingGuidelinesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Bidding Guidelines</h1>
        <p className="text-muted-foreground mb-8">Last Updated: October 15, 2025</p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <div className="flex items-start gap-4 p-6 bg-primary/5 rounded-lg border border-primary/20">
              <AlertTriangle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Legally Binding Commitment</h3>
                <p className="text-muted-foreground">
                  All bids placed on BIDWIN are legally binding contracts. By placing a bid, you commit to purchasing the item at your bid price if you are the winning bidder. Failure to complete payment may result in account suspension and legal action.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Bidding Rules and Requirements</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">1.1 Bid Commitment</h3>
                <p className="text-muted-foreground mb-3">
                  When you place a bid on BIDWIN:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>You enter into a legally binding agreement to purchase the item if you win</li>
                  <li>Your bid cannot be retracted or cancelled once placed</li>
                  <li>You must have a valid payment method on file</li>
                  <li>You authorize automatic payment processing if you win</li>
                  <li>You accept full responsibility for completing the transaction</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">1.2 Payment Requirements</h3>
                <p className="text-muted-foreground mb-3">
                  Winning bidders must:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Complete payment immediately upon auction close</li>
                  <li>Maintain sufficient funds in their payment method</li>
                  <li>Accept automatic charging by BIDWIN's payment processor</li>
                  <li>Pay all applicable taxes and fees</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">1.3 Bid Increments</h3>
                <p className="text-muted-foreground">
                  Each auction may have specific bid increment requirements. You must meet or exceed the minimum bid increment when placing a bid. BIDWIN reserves the right to reject bids that do not meet these requirements.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Prohibited Bidding Practices</h2>
            
            <div className="space-y-4">
              <p className="text-muted-foreground mb-4">
                The following practices are strictly prohibited and may result in immediate account termination:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Bid Manipulation:</strong> Artificially inflating bid prices through coordinated bidding or using multiple accounts</li>
                <li><strong className="text-foreground">Shill Bidding:</strong> Sellers bidding on their own items or having associates bid to drive up prices</li>
                <li><strong className="text-foreground">Fraudulent Bids:</strong> Placing bids without intent or ability to complete payment</li>
                <li><strong className="text-foreground">Bid Interference:</strong> Contacting other bidders to discourage bidding</li>
                <li><strong className="text-foreground">Account Abuse:</strong> Creating multiple accounts to circumvent bidding restrictions</li>
                <li><strong className="text-foreground">Payment Evasion:</strong> Intentionally using invalid payment methods</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Seller Responsibilities</h2>
            
            <div className="p-6 bg-muted rounded-lg mb-4">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Important Platform Notice:</strong> BIDWIN operates as a marketplace platform only. All item fulfillment, shipping, quality, and customer service obligations rest entirely with the seller, not with BIDWIN.
              </p>
            </div>

            <p className="text-muted-foreground mb-4">
              Sellers are solely responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Providing accurate, honest item descriptions and photographs</li>
              <li>Disclosing all defects, damage, or condition issues</li>
              <li>Ensuring items are authentic and legally owned</li>
              <li>Shipping items within 5 business days of payment receipt</li>
              <li>Providing tracking information to buyers</li>
              <li>Handling all customer service inquiries</li>
              <li>Processing returns or refunds according to their stated policies</li>
              <li>Complying with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Buyer Protections and Limitations</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">4.1 Inspection Period</h3>
                <p className="text-muted-foreground">
                  Buyers should inspect items immediately upon receipt. Any issues must be reported to the seller within 48 hours. BIDWIN is not responsible for resolving disputes or mediating between buyers and sellers.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">4.2 Platform Limitations</h3>
                <p className="text-muted-foreground mb-3">
                  BIDWIN is NOT responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Items not received or received damaged</li>
                  <li>Items not matching descriptions</li>
                  <li>Shipping delays or lost packages</li>
                  <li>Seller's failure to fulfill orders</li>
                  <li>Counterfeit or misrepresented items</li>
                  <li>Disputes between buyers and sellers</li>
                  <li>Refunds or returns (handled by sellers only)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">4.3 Direct Resolution Required</h3>
                <p className="text-muted-foreground">
                  All disputes regarding items, delivery, quality, or fulfillment must be resolved directly between the buyer and seller. BIDWIN acts only as a platform facilitator and has no control over seller performance.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Auction Timing and Deadlines</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">5.1 Auction End Times</h3>
                <p className="text-muted-foreground">
                  Auctions close at the specified date and time. Last-second bids (snipe bids) are permitted. BIDWIN is not responsible for technical issues that prevent bid placement.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">5.2 Payment Deadline</h3>
                <p className="text-muted-foreground">
                  Payment is automatically processed when the auction closes. If automatic payment fails, bidders must resolve payment issues within 24 hours or face account suspension.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">5.3 No Extensions</h3>
                <p className="text-muted-foreground">
                  BIDWIN does not extend auction deadlines or provide second chances to bidders who miss auctions. All times displayed are based on the Platform's server time.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Account Consequences</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">6.1 Violation Penalties</h3>
                <p className="text-muted-foreground mb-3">
                  Violations of these guidelines may result in:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Immediate account suspension or termination</li>
                  <li>Forfeiture of active bids and winnings</li>
                  <li>Permanent ban from the Platform</li>
                  <li>Legal action for fraud or breach of contract</li>
                  <li>Reporting to law enforcement for illegal activity</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">6.2 Non-Payment Consequences</h3>
                <p className="text-muted-foreground">
                  Failure to complete payment for a winning bid may result in account termination, collection actions, and negative impact on your ability to use similar platforms.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Dispute Escalation Process</h2>
            
            <div className="space-y-4">
              <p className="text-muted-foreground mb-4">
                If you experience an issue with a transaction:
              </p>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Contact the Seller Directly</h3>
                  <p className="text-muted-foreground text-sm">
                    Most issues can be resolved through direct communication with the seller.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Document Everything</h3>
                  <p className="text-muted-foreground text-sm">
                    Keep records of all communications, photographs, and evidence related to the issue.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Seek External Resolution</h3>
                  <p className="text-muted-foreground text-sm">
                    If unable to resolve with the seller, consider payment processor dispute resolution, small claims court, or consumer protection agencies. BIDWIN cannot mediate disputes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Platform Rights and Modifications</h2>
            
            <p className="text-muted-foreground mb-4">
              BIDWIN reserves the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Modify these guidelines at any time with or without notice</li>
              <li>Cancel or remove any auction for any reason</li>
              <li>Suspend or terminate accounts at our sole discretion</li>
              <li>Refuse service to anyone for any reason</li>
              <li>Change bidding rules, fees, or platform features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Best Practices for Successful Bidding</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Research Items</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Review item descriptions, photos, and seller ratings before bidding.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Set Budget Limits</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Determine your maximum bid before the auction to avoid overspending.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Verify Payment Method</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Ensure your payment method is valid and has sufficient funds.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Read Seller Policies</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Review seller's shipping, return, and refund policies before bidding.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact and Support</h2>
            <p className="text-muted-foreground mb-4">
              For questions about these Bidding Guidelines, contact us at:{' '}
              <a href="mailto:support@bidwin.com" className="text-primary hover:underline">
                support@bidwin.com
              </a>
            </p>
            <p className="text-muted-foreground">
              For transaction disputes or seller issues, you must contact the seller directly. BIDWIN does not mediate disputes between users.
            </p>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg border-l-4 border-primary">
            <p className="text-sm font-semibold mb-2">BIDDING ACKNOWLEDGMENT</p>
            <p className="text-sm text-muted-foreground">
              By placing a bid on BIDWIN, you acknowledge that you have read and agree to these Bidding Guidelines. You understand that BIDWIN is a platform facilitator only and that all transactions, fulfillment, and disputes are between buyers and sellers directly. BIDWIN bears no responsibility for seller performance, item delivery, quality issues, or transaction disputes.
            </p>
          </div>

          <div className="mt-8 flex gap-4">
            <Link href="/terms-of-service" className="text-primary hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
