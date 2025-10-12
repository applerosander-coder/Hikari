import { Gavel, Heart, Trophy, Shield } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Gavel,
      title: 'Browse Auctions',
      description: 'Explore our wide range of live auctions across various categories. Find items that interest you and add them to your watchlist.'
    },
    {
      icon: Heart,
      title: 'Place Your Bid',
      description: 'When you find an item you love, place your bid with confidence. Our secure payment system saves your payment method for quick bidding.'
    },
    {
      icon: Trophy,
      title: 'Win & Pay',
      description: 'If you have the highest bid when the auction ends, you win! Payment is automatically processed using your saved payment method.'
    },
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'All auctions are monitored for fairness. Real-time updates keep you informed, and our buyer protection ensures a safe experience.'
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">How It Works</h1>
          <p className="text-lg text-muted-foreground">
            Participating in online auctions is simple and secure. Here's everything you need to know.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {steps.map((step, index) => (
            <div key={index} className="relative p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="font-semibold text-xl mb-4">For Sellers</h2>
          <p className="text-muted-foreground mb-4">
            Want to create your own auctions? Visit the Seller Dashboard to get started. You can:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Create custom auctions with your own items</li>
            <li>Set starting prices and reserve prices</li>
            <li>Choose auction end dates and times</li>
            <li>Invite people to your exclusive auctions</li>
            <li>Track bids and manage your listings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
