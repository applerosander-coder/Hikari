import Link from 'next/link';
import { Clock, Heart, Trophy, Users, Smartphone, Shield } from 'lucide-react';

export default function AboutAuctionsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">About Silent Auctions</h1>
        <p className="text-lg text-muted-foreground mb-12">
          BIDWIN brings the excitement of silent auctions to the digital world, making fundraising and bidding accessible, transparent, and engaging for everyone.
        </p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">What Are Silent Auctions?</h2>
            <p className="text-muted-foreground mb-4">
              Silent auctions are a popular fundraising method where participants place bids on items without a traditional auctioneer. Unlike live auctions where bids are called out loud, silent auctions allow bidders to place their bids privately and competitively until the auction closes.
            </p>
            <p className="text-muted-foreground">
              Originally conducted with paper bid sheets at charity events, BIDWIN modernizes this concept by bringing silent auctions online, making them accessible 24/7 from anywhere in the world.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">How BIDWIN Silent Auctions Work</h2>
            
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="p-6 border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Timed Bidding Windows</h3>
                    <p className="text-muted-foreground text-sm">
                      Each auction has a set start and end time. Bidders can place bids anytime during this window, creating excitement as the deadline approaches.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Real-Time Updates</h3>
                    <p className="text-muted-foreground text-sm">
                      See current highest bids instantly. Get notified when you've been outbid so you can respond quickly and stay competitive.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Watchlist Feature</h3>
                    <p className="text-muted-foreground text-sm">
                      Save items to your watchlist to track auctions you're interested in. Get alerts when they're about to close.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Automatic Winner Processing</h3>
                    <p className="text-muted-foreground text-sm">
                      When an auction closes, the highest bidder wins automatically. Payment is processed securely using your saved payment method.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">The BIDWIN Experience</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-semibold mb-3">For Bidders</h3>
                <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Browse Auctions:</strong> Explore live auctions across various categories - from electronics to collectibles, experiences to services.
                  </li>
                  <li>
                    <strong className="text-foreground">Place Your Bid:</strong> Enter your maximum bid amount. You can bid multiple times to stay competitive.
                  </li>
                  <li>
                    <strong className="text-foreground">Monitor Progress:</strong> Track your active bids in real-time. Get instant notifications if someone outbids you.
                  </li>
                  <li>
                    <strong className="text-foreground">Win & Celebrate:</strong> If you have the highest bid when the auction closes, you win! Payment is automatically processed.
                  </li>
                  <li>
                    <strong className="text-foreground">Receive Your Item:</strong> The seller ships your item directly to you. Track shipping and manage your won items in your dashboard.
                  </li>
                </ol>
              </div>

              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-semibold mb-3">For Sellers & Fundraisers</h3>
                <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Create Your Auction:</strong> Set up auctions with multiple items, custom start/end times, and detailed descriptions.
                  </li>
                  <li>
                    <strong className="text-foreground">Invite Participants:</strong> Share your auction with supporters via email or social media to maximize engagement.
                  </li>
                  <li>
                    <strong className="text-foreground">Monitor Bids:</strong> Watch in real-time as bids come in and excitement builds around your items.
                  </li>
                  <li>
                    <strong className="text-foreground">Automatic Payment Collection:</strong> When auctions close, payments are collected automatically from winning bidders.
                  </li>
                  <li>
                    <strong className="text-foreground">Fulfill Orders:</strong> Ship items to winners and manage all fulfillment directly with buyers.
                  </li>
                </ol>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Why Silent Auctions Work</h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-6 border rounded-lg">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Inclusive Participation</h3>
                <p className="text-muted-foreground text-sm">
                  Everyone can participate at their own pace without the pressure of a live auction environment.
                </p>
              </div>

              <div className="text-center p-6 border rounded-lg">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Extended Engagement</h3>
                <p className="text-muted-foreground text-sm">
                  Auctions run for hours or days, giving more people the opportunity to discover and bid on items.
                </p>
              </div>

              <div className="text-center p-6 border rounded-lg">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Competitive Bidding</h3>
                <p className="text-muted-foreground text-sm">
                  Silent bidding creates healthy competition, often driving prices higher than traditional auctions.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Perfect for Fundraising</h2>
            <p className="text-muted-foreground mb-4">
              Silent auctions have become the gold standard for nonprofit fundraising, school events, and community organizations. BIDWIN makes it easier than ever to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>Reach supporters beyond geographic limitations</li>
              <li>Reduce event overhead costs (no venue, catering, or physical setup required)</li>
              <li>Enable 24/7 bidding from mobile devices</li>
              <li>Provide transparent, real-time fundraising tracking</li>
              <li>Collect payments automatically and securely</li>
              <li>Build lasting engagement with your community</li>
            </ul>

            <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="text-lg font-semibold mb-3">Success Stories</h3>
              <p className="text-muted-foreground mb-3">
                Organizations using BIDWIN have raised over <strong className="text-foreground">$27.8 million</strong> for their causes. From schools funding new programs to nonprofits supporting critical missions, silent auctions on BIDWIN deliver results.
              </p>
              <Link href="/blog" className="text-primary hover:underline font-medium">
                Read our success stories →
              </Link>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Key Features of BIDWIN Auctions</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✓ Category Browsing</h3>
                <p className="text-muted-foreground text-sm">
                  Filter by categories like Electronics, Fashion, Collectibles, Experiences, and more.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✓ Mobile Optimized</h3>
                <p className="text-muted-foreground text-sm">
                  Bid from anywhere using your smartphone or tablet with our responsive design.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✓ Secure Payments</h3>
                <p className="text-muted-foreground text-sm">
                  Industry-leading payment processing with Stripe ensures your transactions are safe.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✓ Real-Time Notifications</h3>
                <p className="text-muted-foreground text-sm">
                  Get instant alerts for outbid notifications, auction endings, and winning confirmations.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✓ Bid History Tracking</h3>
                <p className="text-muted-foreground text-sm">
                  View complete bid histories and track your participation across all auctions.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✓ Multi-Item Auctions</h3>
                <p className="text-muted-foreground text-sm">
                  Sellers can create auctions with multiple items, perfect for fundraising events.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="p-8 bg-muted rounded-lg border-l-4 border-primary">
              <h2 className="text-2xl font-semibold mb-4">Important: Platform Facilitator Notice</h2>
              <p className="text-muted-foreground mb-4">
                BIDWIN operates as a marketplace platform connecting sellers and bidders. We provide the technology and infrastructure for silent auctions but are not involved in the actual transactions between users.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong className="text-foreground">Seller Responsibility:</strong> All item fulfillment, shipping, quality, customer service, and delivery obligations rest entirely with the seller, not with BIDWIN.
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Buyer Responsibility:</strong> All bids are legally binding. Buyers must complete payment and work directly with sellers for item receipt and any issues.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Whether you're looking to support your favorite cause, find unique items, or raise funds for your organization, BIDWIN makes silent auctions simple, secure, and successful.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/dashboard" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Browse Active Auctions
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors">
                Learn How It Works
              </Link>
            </div>
          </section>

          <div className="mt-8 flex gap-4">
            <Link href="/bidding-guidelines" className="text-primary hover:underline">
              Bidding Guidelines
            </Link>
            <Link href="/terms-of-service" className="text-primary hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
