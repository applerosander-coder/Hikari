# BidWin - Live Auction Platform

## Project Overview
A complete Next.js 14 live auction/bidding platform built with Supabase for authentication and database, featuring real-time bidding, countdown timers, and a swipeable carousel interface for browsing auction items and services.

**Originally**: HIKARI SaaS Template  
**Transformed to**: BidWin Auction Platform (October 2025)

## Replit Migration - October 2025
Successfully migrated from Vercel to Replit environment.

## Critical Setup

### Supabase Database Schema (Required!)
**IMPORTANT**: Before the app works correctly, you must set up the database schema in Supabase:

1. Go to your Supabase Dashboard → SQL Editor
2. Run the SQL from `schema.sql` (or follow `docs/SUPABASE_SCHEMA_SETUP.md`)
3. This creates the `users` table and triggers for avatar/profile features

**Without this setup:**
- Avatar selection won't save (400 errors)
- Full name won't display on account page
- User profile features won't work

See detailed instructions in `docs/SUPABASE_SCHEMA_SETUP.md`

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

### Mobile Optimization - October 10, 2025
Made the entire BidWin application fully responsive and mobile-friendly:
- ✅ Updated mobile navigation with user avatar dropdown and proper authentication state
- ✅ Optimized avatar picker with responsive grid (3 columns on mobile, 4 on larger screens)
- ✅ Made all text sizes responsive across pages (hero, FAQ, community sections)
- ✅ Optimized buttons to be full-width on mobile with proper touch targets
- ✅ Ensured auction carousel, testimonials, pricing cards, and footer adapt to mobile screens
- ✅ Added responsive padding and spacing throughout the application
- ✅ Dashboard sidebar hidden on mobile with hamburger menu navigation
- ✅ Auth forms optimized for mobile screens with proper card widths

**Mobile-Optimized Components:**
- `components/mobile-nav.tsx` - Updated with user avatar and BidWin branding
- `components/navigation.tsx` - Passes user data to mobile nav
- `app/(dashboard)/dashboard/account/avatar-picker.tsx` - Responsive grid layout
- `app/(marketing)/page.tsx` - Responsive community section buttons
- `components/landing-page/faq.tsx` - Responsive text sizing

### Avatar & Navigation Updates - October 10, 2025
Unified navigation and avatar system with monochrome design:
- ✅ Replaced 6 avatar images with black & white cartoon avatars in `/public/avatars/`
- ✅ Updated avatar selection checkmark to black check in white circle with border
- ✅ Unified UserAccountNav component used on both marketing and dashboard pages
- ✅ Made "My Account" menu item clickable to navigate to /dashboard/account
- ✅ Fixed TypeScript prop types to accept `full_name: string | null`
- ✅ Avatar displays in both dashboard and welcome page navigation dropdowns
- ✅ Default avatar (`/avatars/default-avatar.svg`) automatically set for new users on signup
- ✅ Avatar persists to `users.avatar_url` via API endpoint
- ⚠️ **Requires Supabase schema setup** - see `docs/SUPABASE_SCHEMA_SETUP.md`

**Components:**
- `components/user-account-nav.tsx` - Unified dropdown for both marketing and dashboard
- `app/(dashboard)/dashboard/account/avatar-picker.tsx` - Avatar selection grid with monochrome checkmark
- `/public/avatars/` - 7 avatar images (6 black & white cartoon + 1 default SVG)
- Updated signup flow to include default avatar in user metadata

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

## Authentication Configuration

### Email Confirmation Behavior
**Important**: If users don't see the "Profile" button after signup, email confirmation is enabled in Supabase.

**For Development (Immediate Login After Signup):**
1. Go to Supabase Dashboard → Authentication → Email Templates
2. **Disable** the "Confirm email" requirement
3. Users will get an immediate session and see the "Profile" button

**For Production (Better Security):**
- Keep "Confirm email" enabled
- Users must click the email confirmation link before logging in
- After confirmation, they'll get a session and see the "Profile" button

### Preventing Duplicate Accounts
**Important**: To prevent users from creating duplicate accounts with the same email using different auth methods (email/password vs. GitHub OAuth), enable automatic account linking in Supabase:

1. Go to your Supabase Dashboard → Authentication → Settings
2. Under "User Signups", enable **"Automatically link OAuth accounts"**

See `docs/AUTHENTICATION_SETUP.md` for detailed configuration instructions.

**Current Protection**: The codebase already prevents duplicate email/password signups if an OAuth account exists with the same email.

## Notes
- Uses pnpm as package manager (specified in package.json)
- All environment secrets are managed through Replit Secrets
- Development server includes Fast Refresh for improved DX
- Sign out button is available in the dashboard navbar (next to search bar)
