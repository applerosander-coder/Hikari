# Auctions - Live Auction Platform

### Overview
Auctions is a live auction and bidding platform built with Next.js 14 and Supabase. It offers a specialized marketplace experience with real-time bidding, countdowns, and integrated payment processing across various categories. The platform aims for a seamless, engaging, and scalable auction experience, featuring a seller dashboard for auction creation, watchlist functionality, and Netflix-style categorization. It emphasizes a rich, interactive user experience and a streamlined listing process leveraging AI, positioning itself as a marketplace facilitator with clear legal acknowledgments.

### User Preferences
I prefer the agent to be concise and to the point. When suggesting code changes, provide a brief explanation of the "why" behind the change, not just the "what." I value iterative development and prefer to review smaller, focused pull requests or changes rather than large, monolithic ones. Please ensure all modifications align with the existing monochrome design aesthetic (black, white, gray). Do not make changes to the `docs/` folder.

### System Architecture
The application uses Next.js 14 with the App Router and Supabase for its PostgreSQL database and authentication, with Stripe integrated for payment processing. It supports multi-item auctions, where `auctions` act as containers for individual `auction_items`.

**UI/UX Decisions:**
- **Color Scheme:** Primarily a strict monochrome palette (black, white, gray), with Light, Dark, and a "Royal Gold" luxury theme.
- **Responsive Design:** Optimized for various screen sizes, including iPhone edge-to-edge layouts.
- **Interactive Elements:** Uses Embla Carousel, Framer Motion for animations, and CoolMode particle effects.
- **Component Library:** Built with Radix UI primitives and styled using Tailwind CSS.
- **User Flow:** Streamlined signup (email/password, GitHub OAuth, legal acknowledgment), personalized dashboards (My Bids, Seller page), and consistent navigation.
- **Visual Enhancements:** Creator avatars integrated, photo-first AI workflow for sellers, and improved mobile navigation.

**Technical Implementations:**
- **Real-time Functionality:** Supabase real-time subscriptions for live auction updates and countdowns, and notification polling (30s interval) for unread count updates.
- **Database Schema:** Custom tables for `auctions`, `auction_items`, `bids`, `customers`, `payments`, `watchlist`, `notifications`, `invitations`, `follows`, `connects`, `user_preferences`, and `user_reviews`. Direct PostgreSQL queries are used for critical user data (avatars, profiles) to ensure consistency.
- **Storage:** Supabase Storage for `seller-auctions` and `avatar` images with automatic compression.
- **State Management:** TanStack Query for data fetching/caching, and tRPC for API communication.
- **Performance Optimizations:** Exponential backoff, `router.refresh()`, retry logic, Postgres RPC functions, and optimized page load reliability.
- **Deployment:** Configured for Replit Autoscale.
- **Auction Management:** Draft system, multi-item editing, auto-publishing, AI-powered generation of content from images, and enhanced seller UX.
- **Winner Processing:** Automated off-session Stripe charging with comprehensive failure handling.

**Feature Specifications:**
- **Live Auctions:** Real-time updates and categorized listings of individual auction items.
- **Dashboard Display:** Active and recently ended auctions with unified filtering.
- **User Accounts:** Secure authentication, profile management, and a selection of 24 artistic avatars.
- **User Profiles & Social Features:** Comprehensive profile pages (`/profile/[userId]`) with auction statistics, follow/unfollow functionality, a connection request system (accept/reject, confirmation dialogs), hover tooltips, and a multi-comment review system with star ratings and paginated comments.
- **Notification System:** Real-time notification center (`/notices`) displaying follow notifications, connection requests, and outbid notifications (with thumbnails and clickable links). Includes unread count badges and mark-as-read functionality.
- **Seller Dashboard:** AI-powered form for creating multi-item auctions, managing drafts, and generating content.
- **Payment Processing:** Secure bidding, saved payment methods, instant bidding, and automated off-session charging.
- **My Bids Page:** Tracks active bids, outbid items, won auctions, and a user-curated watchlist ("Saved").
- **Leaderboard Page:** Displays all auction items with filters and sortable columns.
- **Admin API Endpoint:** Secure endpoint for user email retrieval.
- **Legal & Informational Pages:** Comprehensive Terms of Service, Privacy Policy, Bidding Guidelines, About Auctions, and How It Works.
- **Blog:** Transformed into "Success Stories" with BIDWIN branding.

### External Dependencies
- **Supabase:** Database, Authentication, Realtime, Storage.
- **Stripe:** Payment processing.
- **OpenAI:** Vision API (GPT-4o) for AI-powered content generation.
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