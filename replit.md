# Auctions - Live Auction Platform

### Overview
Auctions is a live auction and bidding platform built with Next.js 14 and Supabase. It transforms a SaaS template into a specialized marketplace, offering real-time bidding, countdowns, a swipeable item carousel, and integrated payment processing with instant bidding and auto-charge functionalities. The platform aims to provide a seamless and engaging auction experience across various categories, featuring a seller dashboard for auction creation, watchlist functionality, and Netflix-style categorization for browsing. The project focuses on scalability and a rich, interactive user experience.

### Recent Changes (Oct 2025)
- **Enhanced Draft Auction Editing:** Added ability to edit 'Auction Name' and 'Location' fields when editing draft auctions. These fields were previously only available during auction creation but are now fully editable, matching the create auction form pattern.
- **Fixed Critical Bidding Bug:** Added null safety checks in My Bids page to prevent crashes when users bid on other users' auction items. Previously failed with TypeError when accessing nested auction relations.
- **Mobile Layout Improvements:** Made seller form responsive by changing date and price field grids to stack vertically on mobile (`grid-cols-1 sm:grid-cols-2`), fixing overflow and alignment issues.
- **Fixed Image Preview Race Condition:** Resolved issue where image previews wouldn't display after upload for all users. Combined dual state updates into single atomic updates for both image upload and removal paths, eliminating React state batching race conditions.

### User Preferences
I prefer the agent to be concise and to the point. When suggesting code changes, provide a brief explanation of the "why" behind the change, not just the "what." I value iterative development and prefer to review smaller, focused pull requests or changes rather than large, monolithic ones. Please ensure all modifications align with the existing monochrome design aesthetic (black, white, gray). Do not make changes to the `docs/` folder.

### System Architecture
The application uses Next.js 14 with the App Router and Supabase for PostgreSQL database and authentication. Stripe is integrated for payment processing, including auto-charge and instant bidding. The system supports multi-item auctions, where `auctions` act as containers for individual `auction_items`.

**UI/UX Decisions:**
- **Color Scheme:** Strict monochrome palette (black, white, gray).
- **Responsive Design:** Optimized for various screen sizes with a unified mobile menu.
- **Interactive Elements:** Embla Carousel for swipeable browsing, Framer Motion for animations (including confetti for successful bids).
- **Component Library:** Built with Radix UI primitives and styled using Tailwind CSS.
- **User Flow:** Features email/password and GitHub OAuth, personalized dashboards (My Bids, Seller page), and bid processing with webhook verification.

**Technical Implementations:**
- **Real-time Functionality:** Supabase real-time subscriptions for live auction updates and countdowns.
- **Database Schema:** Custom tables for `auctions` (containers), `auction_items` (individual items), `bids`, `customers`, `payments`, `watchlist`, `notifications`, and `invitations`. Bids are linked to `auction_items`. **Note:** `auction_items` table does NOT have a `status` column (only `auctions` has status field).
- **Storage:** Supabase Storage with two buckets: `seller-auctions` (auction item images) and `avatar` (user avatars). Images are automatically compressed to 0.5MB max before upload. Each auction item gets a unique timestamped filename to prevent overwrites.
- **State Management:** TanStack Query for data fetching and caching, and tRPC for API communication.
- **Performance Optimizations:** Exponential backoff for polling, `router.refresh()` for targeted data fetching, retry logic for bid verification, and Postgres RPC functions for efficient data aggregation.
- **Deployment:** Configured for Replit Autoscale. **Note:** Cron jobs require separate Scheduled Deployments on Replit (not available on Autoscale). Manual trigger available via dev tools for winner processing.
- **Auction Management:** Draft auction system with preview mode and auto-publishing based on start times.
- **Winner Processing:** Automated off-session Stripe charging for auction winners with comprehensive failure handling and real-time notifications.

**Feature Specifications:**
- **Live Auctions:** Real-time updates, countdowns, and categorized listings of individual auction items.
- **Dashboard Display:** Active auctions prominently featured at top with "Hot Items" section; recently ended auctions displayed at bottom with visual distinction (reduced opacity, muted colors) to keep page fresh.
- **User Accounts:** Secure authentication, profile management, and avatar selection.
- **Seller Dashboard:** Form for creating multi-item auctions with image upload and real-time preview. Sellers can manage and preview their draft auctions.
- **Payment Processing:** Secure bidding, saved payment methods, and automated off-session charging via Stripe for winners.
- **Mobile Optimization:** Accessible and usable across all devices.
- **My Bids Page:** Tracks active bids, outbid items, won auctions (with payment/shipping status), and a user-curated watchlist. Ended tab displays won auctions first, followed by the 10 most recent lost bids.
- **Watchlist:** Allows users to track individual auction items.
- **Loading Indicators:** Page loading spinners and NProgress bar for navigation.
- **Dev Tools:** Development-only buttons in bottom-right corner for quick testing:
  - **Create Test Data:** Creates live auctions with items, sets winners, and adds watchlist items
  - **Process Winners:** Manually triggers winner payment processing (charges winning bidders via Stripe after auction ends)

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