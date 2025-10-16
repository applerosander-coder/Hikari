# Auctions - Live Auction Platform

### Overview
Auctions is a live auction and bidding platform built with Next.js 14 and Supabase. It transforms a SaaS template into a specialized marketplace, offering real-time bidding, countdowns, a swipeable item carousel, and integrated payment processing with instant bidding and auto-charge functionalities. The platform aims to provide a seamless and engaging auction experience across various categories, featuring a seller dashboard for auction creation, watchlist functionality, and Netflix-style categorization for browsing. The project focuses on scalability and a rich, interactive user experience, including social networking features like real-time notifications, user-to-user messaging, and connection management.

### User Preferences
I prefer the agent to be concise and to the point. When suggesting code changes, provide a brief explanation of the "why" behind the change, not just the "what." I value iterative development and prefer to review smaller, focused pull requests or changes rather than large, monolithic ones. Please ensure all modifications align with the existing monochrome design aesthetic (black, white, gray). Do not make changes to the `docs/` folder.

### System Architecture
The application uses Next.js 14 with the App Router and Supabase for PostgreSQL database and authentication. Stripe is integrated for payment processing, including auto-charge and instant bidding. The system supports multi-item auctions, where `auctions` act as containers for individual `auction_items`.

**UI/UX Decisions:**
- **Color Scheme:** Strict monochrome palette (black, white, gray).
- **Responsive Design:** Optimized for various screen sizes, including comprehensive iPhone safe area support, with a unified mobile menu.
- **Interactive Elements:** Embla Carousel for swipeable browsing, Framer Motion for animations (including confetti for successful bids), and compact navigation bars.
- **Component Library:** Built with Radix UI primitives and styled using Tailwind CSS.
- **User Flow:** Features email/password and GitHub OAuth, personalized dashboards (My Bids, Seller page), bid processing with webhook verification, and a mandatory legal acknowledgment signup flow.
- **Seller UX:** Streamlined photo-first AI workflow for listing creation (AI generates title, description, category from image), location detection, and quick date/time selection.
- **Social Features:** Mobile navigation includes buttons for Messages, Notifications, and Connections with real-time unread badge counts.

**Technical Implementations:**
- **Real-time Functionality:** Supabase real-time subscriptions for live auction updates, countdowns, notifications (e.g., outbid alerts), and messaging.
- **Database Schema:** Custom tables for `auctions`, `auction_items` (with category field), `bids`, `customers`, `payments`, `watchlist`, `notifications`, `invitations`, `follows`, and `messages`.
- **Storage:** Supabase Storage with `seller-auctions` (auction item images) and `avatar` (user avatars) buckets, with automatic image compression.
- **State Management:** TanStack Query for data fetching and caching, and tRPC for API communication.
- **Performance Optimizations:** Exponential backoff for polling, `router.refresh()` for targeted data fetching, retry logic for bid verification, and Postgres RPC functions.
- **Deployment:** Configured for Replit Autoscale. Cron jobs require separate Scheduled Deployments.
- **Auction Management:** Draft auction system with preview, multi-item editing, and auto-publishing.
- **Winner Processing:** Automated off-session Stripe charging with comprehensive failure handling.

**Feature Specifications:**
- **Live Auctions:** Real-time updates, countdowns, and categorized listings of individual auction items.
- **User Accounts:** Secure authentication, profile management, and social networking (following, messaging, notifications).
- **Seller Dashboard:** Form for creating multi-item auctions with AI-powered generation, management of drafts, and location/date utilities.
- **Payment Processing:** Secure bidding, saved payment methods, and automated off-session charging via Stripe.
- **My Bids Page:** Tracks active bids, outbid items, won auctions, and a user-curated "Saved" list.
- **Leaderboard Page:** Displays all auction items with filters and sortable columns using a pill chip UI.
- **Legal & Informational Pages:** Comprehensive Terms of Service, Privacy Policy, Bidding Guidelines, About, and How It Works pages.
- **Blog:** Rebranded "Success Stories" blog with BIDWIN branding.

### External Dependencies
- **Supabase:** Database, Authentication, Realtime, Storage.
- **Stripe:** Payment processing.
- **OpenAI:** Vision API (GPT-4o) for AI-powered product description generation.
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