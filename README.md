# 🎯 BidWin - Live Auction Platform

A complete Next.js 14 live auction/bidding platform with real-time updates, swipeable interface, and countdown timers.

![BidWin Platform](https://img.shields.io/badge/Next.js-14-black) ![Supabase](https://img.shields.io/badge/Supabase-Database-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)

## ✨ Features

### 🎪 Swipeable Auction Browser
- **Carousel Interface**: Browse auctions with smooth swipe gestures
- **Visual Bid Tracking**: Your bids are highlighted with blue rings and badges
- **Real-time Countdowns**: Live countdown timers for all auctions
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

### 🔨 Auction Functionality
- **Live Bidding**: Place bids on active auctions in real-time
- **Bid History**: View complete bidding history for each auction
- **Categories**: Browse by Services, Electronics, Fashion, and more
- **Status Tracking**: Draft, Upcoming, Active, Ended, and Cancelled states

### 🔐 Authentication & Security
- **Supabase Auth**: Email/password and OAuth (GitHub, Google)
- **Row Level Security**: Secure data access policies
- **Real-time Updates**: Live auction and bid updates via Supabase subscriptions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Installation

1. **Clone and Install**
   ```bash
   pnpm install
   ```

2. **Set Up Database**
   
   Go to your [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor and run:
   ```bash
   # Create tables and policies
   Run: supabase_auction_schema.sql
   
   # Add sample data (optional)
   Run: supabase_mock_auctions.sql
   ```

3. **Configure Environment Variables**
   
   Set the following in Replit Secrets (or `.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pk
   STRIPE_SECRET_KEY=your_stripe_sk
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Run Development Server**
   ```bash
   pnpm run dev
   ```

5. **Visit the App**
   - Homepage: `http://localhost:5000`
   - Auctions: `http://localhost:5000/auctions`
   - Dashboard: `http://localhost:5000/dashboard` (after signing in)

## 📁 Project Structure

```
├── app/
│   ├── auctions/          # Auction listing and detail pages
│   ├── (dashboard)/       # Protected dashboard routes
│   └── (auth)/           # Authentication pages
├── components/
│   ├── swipeable-auction-browser.tsx  # Main carousel component
│   ├── auction-countdown.tsx          # Countdown timer
│   └── ui/                            # Reusable UI components
├── utils/
│   └── supabase/         # Supabase client and queries
├── types/
│   └── db.ts             # Database types
└── supabase_*.sql        # Database setup scripts
```

## 🎨 Key Components

### Swipeable Auction Browser
Location: `/dashboard`
- Carousel-based auction browsing
- Highlights user's active bids
- Real-time countdown timers
- Quick bid access

### Auction Detail Page
Location: `/auctions/[id]`
- Full auction information
- Bid placement form
- Bid history
- Live countdown timer

### Auction Listing
Location: `/auctions`
- Grid view of all active auctions
- Filter by category
- Sort by ending time

## 🗄️ Database Schema

### Auctions Table
- `id` - UUID primary key
- `title` - Auction name
- `description` - Details
- `starting_price` - Initial price (cents)
- `current_bid` - Latest bid (cents)
- `reserve_price` - Minimum sale price (cents)
- `image_url` - Primary image
- `category` - Item category
- `start_date` - Auction start time
- `end_date` - Auction end time
- `status` - draft | upcoming | active | ended | cancelled
- `created_by` - Owner user ID
- `winner_id` - Winning bidder ID

### Bids Table
- `id` - UUID primary key
- `auction_id` - Reference to auction
- `user_id` - Bidder user ID
- `bid_amount` - Bid amount (cents)
- `created_at` - Timestamp

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **UI**: Radix UI, Tailwind CSS, Framer Motion
- **State**: TanStack Query, tRPC
- **Carousel**: Embla Carousel

## 📝 Documentation

For detailed setup instructions and troubleshooting, see [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)

## 🚢 Deployment

This project is optimized for Replit deployment:

1. **Build Command**: `pnpm run build`
2. **Run Command**: `pnpm run start`
3. **Port**: 5000

Deploy to other platforms:
- Vercel
- Netlify
- Railway
- Any Node.js hosting

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Originally based on HIKARI SaaS Template, transformed into BidWin Auction Platform.

---

**Happy Bidding! 🎉**
