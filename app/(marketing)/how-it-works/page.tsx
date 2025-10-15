import Link from 'next/link';
import { Gavel, Heart, Trophy, Shield, Clock, Bell, CreditCard, Package, Users, Sparkles } from 'lucide-react';

export default function HowItWorksPage() {
  const biddingSteps = [
    {
      icon: Gavel,
      title: 'Browse Auctions',
      description: 'Explore our wide range of live auctions across various categories. Find items that interest you and add them to your watchlist for easy tracking.'
    },
    {
      icon: CreditCard,
      title: 'Save Payment Method',
      description: 'Securely save your payment method once. This enables instant bidding and automatic payment processing when you win.'
    },
    {
      icon: Heart,
      title: 'Place Your Bid',
      description: 'When you find an item you love, place your bid with confidence. All bids are legally binding commitments to purchase if you win.'
    },
    {
      icon: Bell,
      title: 'Stay Updated',
      description: 'Get real-time notifications when you\'re outbid. Monitor your active bids from your personalized dashboard.'
    },
    {
      icon: Trophy,
      title: 'Win & Pay',
      description: 'If you have the highest bid when the auction ends, you win! Payment is automatically processed using your saved payment method.'
    },
    {
      icon: Package,
      title: 'Receive Item',
      description: 'The seller ships your item directly to you. Track delivery and manage won items from your "My Bids" dashboard.'
    }
  ];

  const sellerSteps = [
    {
      icon: Sparkles,
      title: 'Create Your Auction',
      description: 'Set up multi-item auctions with detailed descriptions, photos, start/end times, and pricing.'
    },
    {
      icon: Users,
      title: 'Invite Participants',
      description: 'Share your auction link with supporters via email or social media to maximize engagement.'
    },
    {
      icon: Clock,
      title: 'Monitor Real-Time',
      description: 'Watch bids come in live. Track performance and engage with your audience throughout the auction.'
    },
    {
      icon: CreditCard,
      title: 'Auto Payment Collection',
      description: 'When auctions close, payments are automatically collected from winning bidders - no manual processing needed.'
    },
    {
      icon: Package,
      title: 'Fulfill & Ship',
      description: 'Ship items to winners using their provided addresses. You handle all fulfillment and customer service directly.'
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">How BIDWIN Works</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            BIDWIN makes online silent auctions simple, secure, and successful. Whether you're bidding on items or raising funds, here's everything you need to know.
          </p>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10">For Bidders</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {biddingSteps.map((step, index) => (
              <div key={index} className="relative p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="mb-4 mt-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mb-16 p-8 bg-primary/5 rounded-xl border border-primary/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Important: All Bids Are Binding
          </h3>
          <p className="text-muted-foreground mb-3">
            When you place a bid on BIDWIN, you're making a legally binding commitment to purchase the item if you win. Please ensure you:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Have a valid payment method saved before bidding</li>
            <li>Are prepared to complete the purchase if you win</li>
            <li>Understand that bids cannot be retracted once placed</li>
            <li>Have reviewed the seller's shipping and return policies</li>
          </ul>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10">For Sellers & Fundraisers</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sellerSteps.slice(0, 3).map((step, index) => (
              <div key={index} className="relative p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="mb-4 mt-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            {sellerSteps.slice(3).map((step, index) => (
              <div key={index + 3} className="relative p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {index + 4}
                </div>
                <div className="mb-4 mt-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mb-16 p-8 bg-muted rounded-xl border-l-4 border-primary">
          <h3 className="text-xl font-semibold mb-4">Seller Responsibilities</h3>
          <p className="text-muted-foreground mb-4">
            <strong className="text-foreground">Important:</strong> BIDWIN is a platform facilitator only. Sellers are solely responsible for:
          </p>
          <ul className="grid md:grid-cols-2 gap-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Accurate item descriptions and photos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Item authenticity and quality</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Timely shipping and delivery</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Customer service and communications</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Returns and refund policies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>All legal compliance</span>
            </li>
          </ul>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-6">Key Platform Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 border rounded-lg text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-muted-foreground text-sm">Live bid tracking and instant notifications</p>
            </div>

            <div className="p-6 border rounded-lg text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-muted-foreground text-sm">Industry-leading encryption with Stripe</p>
            </div>

            <div className="p-6 border rounded-lg text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Smart Notifications</h3>
              <p className="text-muted-foreground text-sm">Never miss an outbid or auction closing</p>
            </div>

            <div className="p-6 border rounded-lg text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Gavel className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Category Filters</h3>
              <p className="text-muted-foreground text-sm">Browse by electronics, fashion, art & more</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 md:p-12 rounded-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of bidders and fundraisers who trust BIDWIN for secure, exciting online auctions.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/dashboard" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Browse Active Auctions
              </Link>
              <Link href="/seller" className="inline-flex items-center px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors">
                Start Selling
              </Link>
            </div>
          </div>
        </section>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Learn more about our platform:</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/about-auctions" className="text-primary hover:underline">
              About Silent Auctions
            </Link>
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
