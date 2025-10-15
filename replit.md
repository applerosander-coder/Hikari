# Auctions - Live Auction Platform

### Overview
Auctions is a live auction and bidding platform built with Next.js 14 and Supabase. It transforms a SaaS template into a specialized marketplace, offering real-time bidding, countdowns, a swipeable item carousel, and integrated payment processing with instant bidding and auto-charge functionalities. The platform aims to provide a seamless and engaging auction experience across various categories, featuring a seller dashboard for auction creation, watchlist functionality, and Netflix-style categorization for browsing. The project focuses on scalability and a rich, interactive user experience.

### Recent Changes (Oct 2025)
- **Updated Landing Page Logo:** Replaced the gavel icon with custom BIDWIN logo featuring an outlined gavel with stars and BIDWIN branding on a beige/golden background. The logo is displayed in the navigation bar and links to the homepage.
- **Free Participant Plan Display on Account Page:** Updated account page to show active Participant Plan subscription for all users. Instead of "No Active Subscription", users now see their Participant Plan with $0/month pricing, Active status, and an option to upgrade to premium plans. Paid subscribers continue to see their actual subscription details.
- **Free Participant Plan for All Users:** All signed-up users are automatically subscribed to the free Participant Plan. The pricing page now shows "Subscribed" for all logged-in users on the Participant Plan, with the subscribe button disabled since they already have access.
- **Removed Top Bar from Dashboard Pages:** Removed the top navigation bar (with Auctions logo and avatar) from all dashboard pages on desktop/fullscreen mode for a cleaner, more immersive experience. The top bar is still present on the landing page and on mobile devices (where it provides the menu toggle button). Dashboard pages now have full-height content starting from the top on desktop.
- **Added Leaderboard Page:** Enabled and renamed Analytics nav item to "Leaderboard" with full filtering and sorting capabilities. The page displays all auction items in a table format with auction/category filters and sortable columns (Latest Bid/Highest Bid). Columns include item thumbnail, title, category, highest bid price (with labels: "Current bid" for active items, "Winning bid" for ended items, "Starting bid" for items without bids), and time remaining/ended status. When a specific auction is selected, displays "Total amount raised" showing the sum of all highest bids for that auction. Mobile view uses card-based layout for easy scrolling and navigation. Leaderboard added to mobile navigation menu below "My Bids". All item rows are clickable and navigate to the item detail page.
- **Fixed Ended Bids Sorting:** Updated My Bids page "Ended" tab to display won items sorted by auction end date (most recent first) for better chronological ordering.
- **Simplified Landing Page Profile Button:** Removed dropdown menu from profile button on landing page. Clicking the avatar now navigates directly to the user's profile page at `/dashboard/account` for a more streamlined experience.
- **Added Archive Feature for Ended Auctions:** Dashboard now shows only the 5 most recent ended auction groups by default, with a "View Archive" button to access older ended auctions. This keeps the page clean while preserving access to historical data.
- **Enabled Seller Navigation Button:** Added "Seller" button to the sidebar navigation (previously disabled "Customers" button) linking to `/seller` page where users can create and manage their auctions.
- **Fixed Mobile Filter Width:** Constrained auction and category filter dropdowns to max-width of 280px on mobile for consistent sizing and better layout.
- **Removed System Theme Option:** Simplified theme selector to only toggle between Light Mode and Dark Mode. Removed the System Theme option from mobile menu and set default theme to Light Mode for a more consistent user experience.
- **Fixed Winner Processing Flow:** Corrected "Process Winners" dev tool button to properly end auctions before processing payments. The button now calls both `end-auctions` (to set winner_id) and `process-winners` (to charge payment) in sequence, ensuring items correctly appear in the Ended tab.
- **Fixed Category Field Persistence:** Added category field to auction item update and insert operations in the PATCH /api/auctions/[id] endpoint. Category selections now properly save when editing auction items.
- **Fixed Database Trigger for Current Bid:** Updated `update_auction_item_current_bid()` function to correctly update `current_bid` field when bids are placed. Removed problematic type casting that prevented the trigger from matching auction item IDs correctly.
- **Category Filter for Dashboard:** Added category filtering dropdown to the dashboard page. Users can now filter auction items by category (Electronics, Fashion & Accessories, Services & Experiences, Collectibles & Art, Home & Living, Sports & Hobbies, Other). The category field was added to the `auction_items` table schema and integrated into the filtering logic alongside the existing auction filter.
- **Multi-Item Draft Editing:** Enhanced draft auction editing to support full multi-item management. Sellers can now add new items, edit existing items, and remove items from draft auctions. The API uses secure item operations with authorization checks to prevent unauthorized access to other auctions' items. Item updates are handled through separate delete/update/insert operations to prevent data loss.
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
- **Database Schema:** Custom tables for `auctions` (containers), `auction_items` (individual items with category field), `bids`, `customers`, `payments`, `watchlist`, `notifications`, and `invitations`. Bids are linked to `auction_items`. **Note:** `auction_items` table does NOT have a `status` column (only `auctions` has status field). The `category` field on `auction_items` supports filtering by categories like Electronics, Fashion & Accessories, Services & Experiences, Collectibles & Art, Home & Living, and Sports & Hobbies.
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