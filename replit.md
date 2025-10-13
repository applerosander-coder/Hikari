# Auctions - Live Auction Platform

### Overview
Auctions is a live auction and bidding platform built with Next.js 14 and Supabase. It transforms a SaaS template into a specialized marketplace, offering real-time bidding, countdowns, a swipeable item carousel, and integrated payment processing with instant bidding and auto-charge functionalities. The platform aims to provide a seamless and engaging auction experience across various categories, featuring a seller dashboard for auction creation, watchlist functionality, and Netflix-style categorization for browsing. The project focuses on scalability and a rich, interactive user experience.

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
- **State Management:** TanStack Query for data fetching and caching, and tRPC for API communication.
- **Performance Optimizations:** Exponential backoff for polling, `router.refresh()` for targeted data fetching, retry logic for bid verification, and Postgres RPC functions for efficient data aggregation.
- **Deployment:** Configured for Replit Autoscale, with cron jobs for automated auction ending, winner processing, and draft publishing.
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
- **Dev Tools:** Test data creation button available in development for quick testing (creates live auctions, sets winners, adds watchlist items).

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