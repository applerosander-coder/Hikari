import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last Updated: October 15, 2025</p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing or using BIDWIN ("the Platform," "we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Platform.
            </p>
            <p className="text-muted-foreground">
              BIDWIN operates solely as a marketplace platform connecting sellers and bidders. We are not a party to any transaction between users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Platform Role and Limitations</h2>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">2.1 Facilitator Only:</strong> BIDWIN serves exclusively as a venue for users to list items for auction and place bids. We do not own, sell, resell, manage, offer, deliver, or control any items listed on the Platform. We are not involved in the actual transaction between sellers and bidders.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">2.2 No Guarantees:</strong> BIDWIN makes no representations, warranties, or guarantees regarding the quality, safety, legality, authenticity, or availability of items listed on the Platform. We do not guarantee that sellers will complete transactions or deliver items.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">2.3 No Responsibility for Fulfillment:</strong> All responsibility for item description accuracy, condition, legality, delivery, shipping, and fulfillment rests solely with the seller. BIDWIN has no control over and does not guarantee the existence, quality, safety, or legality of items advertised.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Seller Responsibilities</h2>
            <p className="text-muted-foreground mb-4">
              Sellers are solely responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Accurate item descriptions and photographs</li>
              <li>Item authenticity, quality, and legal compliance</li>
              <li>Timely fulfillment and delivery of sold items</li>
              <li>All shipping, handling, and associated costs</li>
              <li>Customer service and buyer communications</li>
              <li>Compliance with all applicable laws and regulations</li>
              <li>Any damages, defects, or issues with items</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Bidder Obligations</h2>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">4.1 Binding Bids:</strong> All bids placed on the Platform are legally binding. By placing a bid, you commit to purchasing the item if you are the winning bidder.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">4.2 Payment Obligation:</strong> Winning bidders must complete payment through the Platform's designated payment processor. Payment will be automatically processed upon auction completion.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">4.3 Direct Seller Interaction:</strong> All disputes regarding item condition, delivery, or fulfillment must be resolved directly with the seller. BIDWIN is not responsible for seller performance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">5.1 Maximum Liability:</strong> To the fullest extent permitted by law, BIDWIN's total liability for any claims arising from your use of the Platform shall not exceed the amount of fees you paid to BIDWIN in the twelve (12) months prior to the event giving rise to the liability, or $100 USD, whichever is less.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">5.2 Excluded Damages:</strong> BIDWIN shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Loss of profits, revenue, or business opportunities</li>
              <li>Loss of data or information</li>
              <li>Items not received or received damaged</li>
              <li>Delayed deliveries or shipments</li>
              <li>Fraudulent seller or bidder activity</li>
              <li>Payment processing errors or delays</li>
              <li>Unauthorized access to your account</li>
            </ul>
            <p className="text-muted-foreground">
              <strong className="text-foreground">5.3 No Liability for User Conduct:</strong> BIDWIN is not responsible for the conduct of any user, including sellers who fail to deliver items, bidders who fail to pay, or any fraudulent, illegal, or harmful activity by users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Disclaimers</h2>
            <p className="text-muted-foreground mb-4">
              THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-muted-foreground">
              BIDWIN does not warrant that the Platform will be uninterrupted, secure, or error-free, or that any defects will be corrected.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify, defend, and hold harmless BIDWIN, its officers, directors, employees, agents, and affiliates from any claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your use or misuse of the Platform</li>
              <li>Your transactions with other users</li>
              <li>Items you list, sell, or purchase through the Platform</li>
              <li>Any disputes between you and other users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Dispute Resolution</h2>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">8.1 User-to-User Disputes:</strong> BIDWIN is not responsible for resolving disputes between users. Sellers and bidders must resolve all disputes regarding items, delivery, quality, or payment directly with each other.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">8.2 Arbitration Agreement:</strong> Any dispute with BIDWIN shall be resolved through binding arbitration rather than in court, except where prohibited by law. You waive your right to a jury trial and to participate in class action lawsuits.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">8.3 Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, USA, without regard to conflict of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Account Suspension and Termination</h2>
            <p className="text-muted-foreground mb-4">
              BIDWIN reserves the right to suspend or terminate your account at any time, with or without cause or notice, for any reason including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Violation of these Terms</li>
              <li>Fraudulent or suspicious activity</li>
              <li>Non-payment of winning bids</li>
              <li>Failure to deliver items as a seller</li>
              <li>Abusive or inappropriate conduct</li>
              <li>Any activity that harms the Platform or other users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Payment Processing</h2>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">10.1 Third-Party Processor:</strong> All payments are processed by third-party payment processors. BIDWIN is not responsible for payment processing errors, delays, or failures.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">10.2 Transaction Fees:</strong> BIDWIN may charge platform fees for certain services. All fees are non-refundable unless otherwise stated.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">10.3 Automatic Charging:</strong> By placing a winning bid, you authorize BIDWIN to automatically charge your saved payment method for the winning bid amount. You are responsible for ensuring adequate funds are available.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Modifications to Terms</h2>
            <p className="text-muted-foreground">
              BIDWIN reserves the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on the Platform. Your continued use of the Platform after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, please contact us at:{' '}
              <a href="mailto:legal@bidwin.com" className="text-primary hover:underline">
                legal@bidwin.com
              </a>
            </p>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg border-l-4 border-primary">
            <p className="text-sm font-semibold mb-2">IMPORTANT LEGAL NOTICE</p>
            <p className="text-sm text-muted-foreground">
              These Terms constitute a legally binding agreement. By using BIDWIN, you acknowledge that you have read, understood, and agree to be bound by these Terms. BIDWIN operates as a platform facilitator only and bears no responsibility for user transactions, item delivery, or disputes between users.
            </p>
          </div>

          <div className="mt-8 flex gap-4">
            <Link href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            <Link href="/bidding-guidelines" className="text-primary hover:underline">
              Bidding Guidelines
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
