# Auctions - Live Auction Platform

### Overview
Auctions is a live auction and bidding platform built with Next.js 14 and Supabase. It transforms a SaaS template into a specialized marketplace, offering real-time bidding, countdowns, a swipeable item carousel, and integrated payment processing with instant bidding and auto-charge functionalities. The platform aims to provide a seamless and engaging auction experience across various categories. Key features include a seller dashboard for auction creation, watchlist functionality, and a Netflix-style categorization for browsing.

### Recent Changes
**October 12, 2025 - Database Restructuring: Auction Containers with Multiple Items:**
- **New Database Schema**: Restructured to support multiple items per auction
  - `auctions` table now serves as containers with `name` and `place` fields
  - New `auction_items` table stores individual items (title, description, pricing, images)
  - `bids` table updated with `auction_item_id` to reference specific items
  - Full migration SQL created: `docs/COMPLETE_MIGRATION_WITH_MOCKDATA.sql`
  - Includes mockup data: 2 auctions with 10 items each
- **Seller Create Form**: Completely redesigned for multi-item auctions
  - Auction container fields: name, place, start/end dates
  - Dynamic item management: add/remove items with individual details
  - Each item has: title, description, pricing, category, image
  - Form validates at least one item before submission
- **Seller Dashboard**: Updated to display auction containers with items
  - Shows item count and preview grid (first 3 items)
  - Displays auction name, place, and date range
  - Item titles listed as preview
- **Create Auction API**: Enhanced to support new structure
  - Handles both old (single) and new (container + items) formats
  - Creates auction then inserts items in transaction
  - Rollback protection if item insertion fails
  - Backward compatible with legacy format
- **Documentation**: 
  - `docs/AUCTION_RESTRUCTURING_GUIDE.md` - Architecture overview
  - `docs/RUN_MIGRATION_INSTRUCTIONS.md` - Step-by-step migration guide
  - `docs/DATABASE_MIGRATION_AUCTION_ITEMS.sql` - Core migration script

**October 12, 2025 - Draft Auction Management & Preview System:**
- **Timezone Fix**: Resolved datetime input bug where user's selected time was incorrectly saved
  - datetime-local values now properly convert to ISO format preserving local time
  - User selects 3:26pm → saves as 3:26pm (previously saved as 11:26am)
  - Fixed in both create and edit auction forms
- **Auto-Publish Functionality**: Draft auctions automatically go live when start time is reached
  - Enhanced `/api/auctions/end-auctions` cron to handle both publishing drafts and ending auctions
  - Checks every 5 minutes: drafts with `start_date <= now` move to 'active' status
  - Published auctions then appear on dashboard for bidding
  - Response includes published and ended counts for monitoring
- **Preview Mode**: Sellers can preview draft auctions before publishing
  - New `/seller/preview/[id]` page shows draft in published format
  - Clear "PREVIEW MODE" banner with yellow highlighting
  - Exact layout match to live auction detail page
  - Bidding disabled with "Preview Only" indicator
  - Preview buttons added to both edit form and seller dashboard cards
  - Security: only draft owners can preview their auctions
- **Draft Auction Editing**: Enhanced seller workflow for managing drafts
  - Draft cards now clickable with Edit and Preview action buttons
  - Shows planned start date on all draft auction cards
  - Edit page at `/seller/edit/[id]` with pre-populated form
  - PATCH `/api/auctions/[id]` for updating drafts
  - DELETE `/api/auctions/[id]` for removing drafts
  - Security: user can only edit/delete their own draft auctions

**October 12, 2025 - Auction Ending & Bid Status Improvements:**
- **Unified Auction Card Component**: Created `AuctionItemCard` component consolidating all card variations
  - Shows "High Bid" badge when user has the highest bid on an item
  - Optional watchlist/heart button for saving items
  - Consistent design across dashboard, My Bids, and other pages
- **Ended Auction Prevention**: Fixed bidding on ended auctions
  - Auction detail page checks both `status === 'ended'` AND if `end_date` has passed
  - Bid button properly disabled when auction has ended
  - Shows win/lose messaging and prevents further bids
- **Watchlist Filtering**: Ended auctions now automatically filtered from watchlist tab
  - Only active auctions (not ended and end_date not passed) appear in watchlist
  - Prevents confusion and accidental bidding attempts
- **My Bids Tab Filtering**: Active and Soon tabs now exclude auctions past their end_date
  - Checks both status and end_date to ensure accurate filtering
  - Ended auctions move to Won tab when user is the winner
- **Auction Ending Automation**: Created `/api/auctions/end-auctions` endpoint
  - Marks auctions as 'ended' when end_date passes
  - Sets winner_id to highest bidder
  - Triggered via cron job every 5 minutes (configured in vercel.json)
  - Requires CRON_SECRET for authorization
- **CRON_SECRET Setup**: Added to .env.local for development testing
  - Required for both end-auctions and process-winners APIs
  - Production deployment needs this secret configured

**October 12, 2025 - Authentication Redirect Fix:**
- **Sign-Up Redirect**: Fixed redirect after sign-up to go to landing page (/) instead of login page
- **Sign-In Redirect**: Already correctly redirects to landing page (/)
- **User Flow**: New and returning users now immediately see the landing page after successful authentication

**October 12, 2025 - Automatic Winner Payment & Notification System:**
- **Winner Processing API**: POST `/api/auctions/process-winners` for automatic end-of-auction payment
  - Service role Supabase client bypasses RLS for secure notification creation
  - CRON_SECRET bearer token authorization for production security
  - Processes ended auctions with Stripe off-session charging
  - Idempotent design: marks all auctions (success/failure) to prevent duplicate processing
  - Comprehensive failure handling with sentinel payment_intent_id values:
    - `no_payment_method`: Winner lacks payment method
    - Stripe intent ID: Payment failed or succeeded
    - `failed`: Unexpected error during processing
- **Notifications System**: 
  - New `notifications` table with RLS restricted to service_role for inserts
  - Real-time notification checking via `useAuctionNotifications` hook
  - Toast pop-ups on login with deep linking to relevant tabs
  - Types: `auction_won`, `payment_failed`
- **Won Auctions UI**: Enhanced mybids page with Won tab
  - Displays won auctions with payment status and shipping status
  - Payment status indicators: Completed, Failed, Pending
  - Action buttons for tracking and shipping updates
- **Database Updates**: Added fields to auctions table
  - `payment_completed`, `payment_completed_at`, `payment_intent_id`
  - `winner_id` for tracking auction winners
- **Security & Production Notes**: 
  - Requires SUPABASE_SERVICE_ROLE_KEY for service role operations
  - Requires CRON_SECRET for API authorization
  - Monitor auctions with sentinel payment_intent_id for manual intervention

**October 12, 2025 - Unified Navigation & Seller Dashboard:**
- **Unified Mobile Menu**: Shared navigation component (SharedMobileMenu) used across marketing and dashboard layouts
  - Clickable avatar at top links to account/profile page (/dashboard/account)
  - Navigation items: Auctions, My Bids, Seller, Pricing, How it Works, Settings (all with icons)
  - Theme toggle with 3-state cycle (system/light/dark)
  - Sign out button
- **Seller Dashboard**: New `/seller` route for auction creators
  - Auction creation form with all fields (title, description, pricing, dates, category)
  - Image upload with base64 preview (production will need storage bucket)
  - Real-time preview of created auctions
  - Lists seller's existing auctions with status and details
- **Database Schema**: Added `invitations` table for seller auction invites
  - Stores invite codes, invitee emails, and status tracking
  - RLS enabled (permissive for dev, production requirements documented in docs/SELLER_DATABASE_SETUP.md)
- **API Endpoint**: `/api/auctions/create` for authenticated auction creation
  - Validates user authentication and required fields
  - Creates auctions with draft status by default
- **How It Works Page**: Created `/how-it-works` marketing page explaining the auction process

### User Preferences
I prefer the agent to be concise and to the point. When suggesting code changes, provide a brief explanation of the "why" behind the change, not just the "what." I value iterative development and prefer to review smaller, focused pull requests or changes rather than large, monolithic ones. Please ensure all modifications align with the existing monochrome design aesthetic (black, white, gray). Do not make changes to the `docs/` folder.

### System Architecture
The application uses **Next.js 14 with the App Router** and **Supabase** for PostgreSQL database and authentication. **Stripe** is integrated for payment processing, including auto-charge and instant bidding.

**UI/UX Decisions:**
- **Color Scheme:** Strict monochrome palette (black, white, gray).
- **Responsive Design:** Optimized for various screen sizes, including a unified mobile menu.
- **Interactive Elements:** **Embla Carousel** for swipeable browsing, **Framer Motion** for animations, including a confetti effect for successful bids.
- **Component Library:** Built with **Radix UI** primitives and styled using **Tailwind CSS**.
- **User Flow:** Features email/password and GitHub OAuth, a personalized dashboard (My Bids, Seller page), and bid processing with webhook verification.

**Technical Implementations:**
- **Real-time Functionality:** Supabase real-time subscriptions for live auction updates and countdowns.
- **Database Schema:** Custom tables for `auctions`, `bids`, `customers`, `payments`, `watchlist`, and `invitations`.
- **State Management:** **TanStack Query** for data fetching and caching, and **tRPC** for API communication.
- **Performance Optimizations:** Exponential backoff for polling, `router.refresh()` for targeted data fetching, and retry logic for bid verification. Uses Postgres RPC functions for efficient data aggregation.
- **Deployment:** Configured for Replit Autoscale.

**Feature Specifications:**
- **Live Auctions:** Real-time updates, countdowns, and categorized listings.
- **User Accounts:** Secure authentication, profile management, and avatar selection.
- **Seller Dashboard:** Form for creating auctions with image upload and real-time preview.
- **Payment Processing:** Secure bidding, saved payment methods, and off-session charging via Stripe.
- **Mobile Optimization:** Accessible and usable across all devices.
- **My Bids Page:** Tracks active bids, outbid items, won auctions, and a user-curated watchlist.
- **Watchlist:** Allows users to track auctions via a heart icon toggle.
- **Loading Indicators:** Page loading spinners and NProgress bar for navigation.

### External Dependencies
- **Supabase:** Database, Authentication, Realtime.
- **Stripe:** Payment processing.
- **Next.js 14:** Web framework.
- **React:** UI library.
- **Tailwind CSS:** Utility-first CSS framework.
- **Radix UI:** Unstyled component primitives.
- **Framer Motion:** Animation library.
- **Embla Carousel:** Carousel library.
- **TanStack Query:** Data fetching and state management.
- **tRPC:** End-to-end type-safe APIs.
- **Fumadocs:** Documentation generation.
- **canvas-confetti:** Celebration animations.