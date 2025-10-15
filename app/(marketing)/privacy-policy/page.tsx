import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last Updated: October 15, 2025</p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-4">
              BIDWIN ("we," "us," or "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Important:</strong> BIDWIN operates as a marketplace platform only. We are not responsible for the privacy practices of sellers, bidders, or any third parties you interact with through the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">2.1 Information You Provide:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Account registration information (name, email, password)</li>
              <li>Profile information and preferences</li>
              <li>Auction listings and item descriptions (for sellers)</li>
              <li>Bid information and transaction history</li>
              <li>Communications with us or through the Platform</li>
              <li>Payment information (processed by third-party payment processors)</li>
            </ul>

            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">2.2 Automatically Collected Information:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages viewed, features used, time spent)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Location data (if you permit)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide and maintain the Platform</li>
              <li>Process transactions and payments</li>
              <li>Send notifications about auctions, bids, and account activity</li>
              <li>Improve and personalize user experience</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
              <li>Communicate with you about Platform updates and promotions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services and Payment Processing</h2>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">4.1 Payment Processors:</strong> We use third-party payment processors (including Stripe) to handle all payment transactions. Your payment information is collected and processed directly by these processors. BIDWIN does not store complete payment card information on our servers.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">4.2 Third-Party Links:</strong> The Platform may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third parties.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">4.3 User-to-User Sharing:</strong> When you participate in auctions, certain information (such as your username and bid history) may be visible to other users. BIDWIN is not responsible for how other users use this information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong className="text-foreground">Service Providers:</strong> Third-party vendors who help us operate the Platform (hosting, analytics, email services, payment processing)</li>
              <li><strong className="text-foreground">Other Users:</strong> Limited information necessary for auction transactions (username, bid amounts, seller/buyer status)</li>
              <li><strong className="text-foreground">Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong className="text-foreground">Business Transfers:</strong> In connection with a merger, sale, or acquisition of BIDWIN</li>
              <li><strong className="text-foreground">Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users or the public</li>
            </ul>

            <p className="text-muted-foreground">
              <strong className="text-foreground">Important:</strong> BIDWIN cannot control how sellers or bidders use information shared through the Platform. We are not responsible for privacy breaches or misuse of information by other users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your information for as long as necessary to provide the Platform services, comply with legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we may retain certain information as required by law or for legitimate business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">No Guarantee:</strong> BIDWIN cannot guarantee the absolute security of your information. You use the Platform at your own risk. We are not liable for any unauthorized access to or use of your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Your Rights and Choices</h2>
            <p className="text-muted-foreground mb-4">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong className="text-foreground">Access:</strong> Request access to your personal information</li>
              <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate information</li>
              <li><strong className="text-foreground">Deletion:</strong> Request deletion of your information (subject to legal requirements)</li>
              <li><strong className="text-foreground">Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong className="text-foreground">Data Portability:</strong> Request a copy of your data in a portable format</li>
            </ul>

            <p className="text-muted-foreground">
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@bidwin.com" className="text-primary hover:underline">
                privacy@bidwin.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie preferences through your browser settings, but some features may not function properly if cookies are disabled.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground">
              The Platform is not intended for users under 18 years of age. We do not knowingly collect information from children. If we discover that a child has provided us with personal information, we will delete it promptly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
            <p className="text-muted-foreground">
              Your information may be transferred to and processed in countries other than your own. These countries may have different data protection laws. By using the Platform, you consent to such transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Platform Facilitator Disclaimer</h2>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">Critical Notice:</strong> BIDWIN operates solely as a marketplace platform connecting sellers and bidders. We are not involved in actual transactions between users. 
            </p>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">We are not responsible for:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>How sellers handle, store, or use buyer information</li>
              <li>Privacy practices of individual sellers or bidders</li>
              <li>Seller compliance with data protection laws</li>
              <li>Delivery issues, delays, or failures by sellers</li>
              <li>Quality, safety, or legality of items sold</li>
              <li>Disputes between users regarding data privacy or misuse</li>
              <li>Unauthorized sharing of information between users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on the Platform. Your continued use after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p className="text-muted-foreground">
              For questions or concerns about this Privacy Policy or our privacy practices, contact us at:{' '}
              <a href="mailto:privacy@bidwin.com" className="text-primary hover:underline">
                privacy@bidwin.com
              </a>
            </p>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg border-l-4 border-primary">
            <p className="text-sm font-semibold mb-2">PRIVACY DISCLAIMER</p>
            <p className="text-sm text-muted-foreground">
              BIDWIN takes privacy seriously but operates as a platform facilitator only. We cannot control how individual sellers or bidders handle personal information shared during transactions. Users interact with each other at their own risk. BIDWIN is not liable for privacy breaches, data misuse, or security incidents involving user-to-user transactions.
            </p>
          </div>

          <div className="mt-8 flex gap-4">
            <Link href="/terms-of-service" className="text-primary hover:underline">
              Terms of Service
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
