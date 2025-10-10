# BidWin - Live Auction Platform

## Project Overview
A complete Next.js 14 live auction/bidding platform built with Supabase for authentication and database, featuring real-time bidding, countdown timers, and a swipeable carousel interface for browsing auction items and services.

**Originally**: HIKARI SaaS Template  
**Transformed to**: BidWin Auction Platform (October 2025)

## Replit Migration - October 2025
Successfully migrated from Vercel to Replit environment.

## Configuration

### Port and Host Settings
- Development server runs on port 5000, binding to 0.0.0.0 for Replit compatibility
- Package.json scripts configured with: `next dev -p 5000 -H 0.0.0.0`

### Required Environment Variables
The following secrets must be configured in Replit Secrets:

#### Supabase (Database & Authentication)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (e.g., https://xxx.supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous/public API key

#### Stripe (Payment Processing)
- `STRIPE_SECRET_KEY`: Your Stripe secret key for server-side operations
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret for event verification
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key for client-side

You can find these values at:
- Supabase: Dashboard → Settings → API
- Stripe: Dashboard → Developers → API keys

### Project Structure
- `/app` - Next.js 14 App Router pages and layouts
- `/components` - Reusable React components
- `/utils` - Utility functions for Supabase, Stripe, and helpers
- `/server` - tRPC server and API routes
- `/content` - MDX documentation and blog content

### Development Workflow
1. Install dependencies: `pnpm install`
2. Run development server: `pnpm run dev`
3. Build for production: `pnpm run build`
4. Start production server: `pnpm run start`

### Deployment
Configured for Replit Autoscale deployment:
- Build command: `pnpm run build`
- Run command: `pnpm run start`
- Port: 5000

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database & Auth**: Supabase
- **Payments**: Stripe
- **UI Components**: Radix UI, Tailwind CSS, Framer Motion
- **Documentation**: Fumadocs
- **State Management**: TanStack Query, tRPC

## Recent Changes

### Welcome Page Transformation - October 10, 2025
Completed transformation of welcome page from tech stack to auction marketplace theme:
- ✅ Updated hero "Browse Auctions" button to direct to /dashboard
- ✅ Replaced tech features section with auction categories (Electronics, Fashion, Services, Collectibles, Home & Living, Sports)
- ✅ Updated all testimonials to reflect bidder experiences and auction wins
- ✅ Replaced FAQ with auction-specific questions (bidding process, fees, authenticity, tracking)
- ✅ Updated community section with auction-focused CTAs
- ✅ Transformed footer with auction-related links and newsletter for auction alerts
- ✅ Changed branding from HIKARI to BidWin throughout footer
- ✅ Fixed SVG fillRule attribute warning
- ✅ Maintained strict monochrome color scheme (black, white, gray)
- ✅ Replaced tech stack logos with "Trusted by" section featuring auction industry partners:
  - Premium Collectors Guild
  - Vintage Dealers Network
  - Estate Sales Association
  - Antique Traders Union
  - Art Buyers Collective
  - Luxury Goods Exchange

### Dashboard Styling Update - October 10, 2025
Updated dashboard to use monochrome color scheme matching the welcome page:
- ✅ Clean black, white, and gray color palette
- ✅ Black/white highlighting for user bids (replacing blue)
- ✅ Monochrome buttons and UI elements
- ✅ Fixed subscription table error in logs

### Platform Transformation - October 10, 2025
Transformed from SaaS subscription platform to live auction/bidding platform:

**New Features:**
- ✅ Swipeable auction carousel browser on `/dashboard` (My Bids page)
- ✅ Real-time countdown timers for all auctions
- ✅ Visual highlighting for auctions user has bid on (blue ring + badge)
- ✅ Auction listing page at `/auctions` with grid view
- ✅ Individual auction detail pages with bidding functionality
- ✅ Complete database schema for auctions and bids
- ✅ Mock auction data script with 10 sample items
- ✅ Row Level Security policies for data protection
- ✅ Real-time subscriptions for live auction updates

**Database Schema Added:**
- `auctions` table - Items/services for auction with status tracking
- `bids` table - User bid history with automatic current_bid updates
- Auction statuses: draft, upcoming, active, ended, cancelled
- Categories: Services, Electronics, Fashion, etc.

**UI Components:**
- `components/swipeable-auction-browser.tsx` - Main carousel component
- `components/auction-countdown.tsx` - Real-time countdown timer
- Integrated Embla Carousel for swipe gestures
- Responsive design for mobile and desktop

**Navigation Updated:**
- "Auctions" - Dashboard with carousel view (same as My Bids)
- "My Bids" - Dashboard with carousel view and bid highlighting
- "Pricing" - View pricing options
- "How It Works" - Platform explanation
- Brand changed from HIKARI to **BidWin**

### Vercel to Replit Migration - October 2025
- Updated scripts to use port 5000 with 0.0.0.0 binding
- Configured deployment settings for Replit autoscale
- Verified all environment variables are properly configured
- Fixed GitHub OAuth to work in Replit's iframe environment
- Application running successfully on Replit

### Authentication Flow - October 10, 2025
**Email/Password Authentication:**
- Sign-in page: `/signin` with email/password form
- Sign-up page: `/signup` for new user registration
- After successful sign-in, users are redirected to the welcome page (`/`) as authenticated users
- Navigation bar shows "Profile" button (links to `/dashboard/account`) when user is signed in, "Login" when not
- Welcome toast notification displays "Welcome [user's name]!" when user logs in
- Authentication state persists via Supabase session cookies

**User Interface When Authenticated:**
- Navigation button changes from "Login" to "Profile"
- Profile button links to `/dashboard/account` for account settings
- Welcome message displays user's full name from profile, or falls back to email username

**OAuth Authentication:**
- GitHub OAuth uses popup window for authentication when running in Replit's iframe (cross-origin security restriction)
- The OAuth flow opens in a new popup window, completes authentication, and redirects back
- After OAuth authentication, users are redirected to the welcome page (`/`) as authenticated users
- Supabase Site URL must be set to your Replit domain (not localhost or Codespaces URL)
- Redirect URLs in Supabase must include: `https://[your-replit-domain]/auth/callback`
- Make sure popup blockers are disabled for the Replit domain

**Testing Authentication:**
1. Go to `/signin` to access the sign-in page
2. For new users: Click "Sign up" to create an account at `/signup`
3. Enter email and password, then submit
4. On success, you'll be redirected to `/` (welcome page) as a signed-in user
5. The navigation bar will show "Dashboard" instead of "Login"
6. You can also test GitHub OAuth (Google is disabled for testing)

## Notes
- Uses pnpm as package manager (specified in package.json)
- All environment secrets are managed through Replit Secrets
- Development server includes Fast Refresh for improved DX
