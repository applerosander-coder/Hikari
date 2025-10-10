# BidWin - Live Auction Platform

### Overview
BidWin is a comprehensive live auction and bidding platform built with Next.js 14 and Supabase. It enables real-time bidding, features countdown timers for auctions, and provides a swipeable carousel interface for browsing auction items. The platform's core purpose is to facilitate a dynamic and engaging auction experience, transforming a generic SaaS template into a specialized marketplace for various auction categories like Electronics, Fashion, Services, Collectibles, Home & Living, and Sports.

### Recent Changes
**October 10, 2025 - UI Consistency & Icon Updates:**
- Applied consistent card height styling to My Bids page cards to match dashboard
- All auction cards now use flex layout with min-heights for uniform appearance
- Changed dashboard navigation icon from Inbox to LayoutDashboard for better visual representation
- Fixed hydration error on countdown timers with mounted state check
- Added pagination dots to My Bids carousels with proper event cleanup

**October 10, 2025 - My Bids Page:**
- Created dedicated `/dashboard/mybids` page to display all user's auction bids
- Separates bids into "Active Bids" (user is highest bidder) and "Outbid" (someone bid higher)
- Active bids: Highlighted with ring border and "Your Bid" badge with Heart icon
- Outbid bids: Display "Outbid" badge with AlertCircle icon, no highlight
- Both sections sorted by auction end time (closest first)
- Added "My Bids" navigation link with Heart icon to dashboard navbar
- Includes search functionality to filter bids by title, description, or category
- Shows user's bid amount vs current auction price for comparison

**October 10, 2025 - Landing Page Button Update:**
- Changed hero section CTA button text from "Follow the progress on X" to "Upcoming Auctions"

**October 10, 2025 - Dashboard Logo Addition:**
- Added BidWin logo to dashboard navbar, centered in the menu bar
- Logo is clickable and navigates to the landing page (/)
- Theme-aware display: black logo for light theme, white logo for dark theme
- Large size with responsive constraints: max-h-28 md:max-h-32, max-w-[60%] sm:max-w-md
- Logos stored in `/public/logos/` directory


**October 10, 2025 - Stripe Payment Integration for Bidding:**
- Implemented secure Stripe payment processing for all bids
- Created bid dialog with Stripe Elements for payment collection (now scrollable on mobile)
- Moved bid creation to webhook to prevent forgery (bids only created after payment verification)
- Added idempotency protection using unique constraint on (auction_id, user_id, bid_amount)
- Fixed webhook to work with existing bids schema (removed non-existent description field)
- Fixed image configuration to allow Unsplash auction images
- Fixed search field to use text input (removed browser-default search icons)
- Dashboard highlighting for user bids with "Your Bid" badge and special styling
- Added polling logic on auction detail page to wait for webhook processing (checks every 1s for 10s after payment)
- Fixed dashboard caching issues with `force-dynamic` and `revalidate: 0`
- **Webhook configured and working:** Stripe webhook successfully creates bids after payment verification
- **Complete payment flow:** Payment → Webhook → Bid creation → Auto-refresh → Dashboard highlight

**October 10, 2025 - Mobile Responsiveness Improvements:**
- Fixed horizontal overflow on dashboard page by removing redundant wrapper div
- Updated dashboard layout to use `flex-1 w-full overflow-x-hidden` instead of grid layout for better mobile compatibility
- Enhanced SwipeableAuctionBrowser with responsive padding (px-4 sm:px-6) and responsive text sizes (text-2xl sm:text-4xl)
- Removed arrow navigation from logo carousel on landing page for cleaner mobile experience (auto-play only)
- Verified all marketing pages (welcome, pricing, auctions) display correctly without overflow on mobile viewports

### User Preferences
I prefer the agent to be concise and to the point. When suggesting code changes, provide a brief explanation of the "why" behind the change, not just the "what." I value iterative development and prefer to review smaller, focused pull requests or changes rather than large, monolithic ones. Please ensure all modifications align with the existing monochrome design aesthetic (black, white, gray). Do not make changes to the `docs/` folder.

### System Architecture
The application is built on **Next.js 14 with the App Router** for routing and server-side rendering capabilities. **Supabase** handles both the database (PostgreSQL) and user authentication. **Stripe** is integrated for payment processing.

**UI/UX Decisions:**
- **Color Scheme:** Strict monochrome palette (black, white, gray) applied consistently across all UI elements, including dashboard components, buttons, and navigation.
- **Responsive Design:** Fully mobile-friendly with optimized layouts for various screen sizes, including responsive text, image scaling, and component adaptations (e.g., single-column layouts on mobile for category cards, hidden dashboard sidebar with hamburger menu).
- **Interactive Elements:** Utilizes **Embla Carousel** for swipeable browsing experiences and **Framer Motion** for animations.
- **Component Library:** Built with **Radix UI** primitives and styled with **Tailwind CSS**.
- **User Flow:**
    - Authentication: Supports email/password and GitHub OAuth (with automatic account linking). OAuth uses a popup window in Replit's iframe environment.
    - Post-Login: Users are redirected to the welcome page, where navigation adapts to show a "Profile" button linking to `/dashboard/account`.
    - Auction Browsing: Features a swipeable auction carousel on the dashboard and a grid view on the `/auctions` page.
    - Bidding: Individual auction detail pages allow bidding, with real-time countdown timers and visual highlighting for user-bid auctions.

**Technical Implementations:**
- **Real-time Functionality:** Leverages Supabase's real-time subscriptions for live auction updates and countdown timers.
- **Database Schema:** Custom `auctions` and `bids` tables manage auction items, their statuses (draft, upcoming, active, ended, cancelled), categories, and user bids.
- **State Management:** Uses **TanStack Query** for data fetching and caching, and **tRPC** for API communication between client and server.
- **Environment Variables:** Critical configuration managed via Replit Secrets (Supabase URL/Key, Stripe Keys).
- **Deployment:** Configured for Replit Autoscale deployment, binding to port 5000.

**Feature Specifications:**
- **Live Auctions:** Real-time countdowns, dynamic bid updates.
- **Auction Categories:** Predefined categories for item organization.
- **User Accounts:** Authentication, profile management, avatar selection (monochrome cartoon avatars).
- **Payment Processing:** Stripe integration for secure transactions.
- **Mobile Optimization:** Ensures accessibility and usability on all devices.

### External Dependencies
- **Supabase:** Database, Authentication, Realtime subscriptions.
- **Stripe:** Payment processing (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
- **Next.js 14:** Web framework.
- **React:** UI library.
- **Tailwind CSS:** Utility-first CSS framework.
- **Radix UI:** Unstyled component primitives.
- **Framer Motion:** Animation library.
- **Embla Carousel:** Carousel library for swipeable UI.
- **TanStack Query:** Data fetching and state management.
- **tRPC:** End-to-end type-safe APIs.
- **Fumadocs:** Documentation generation.