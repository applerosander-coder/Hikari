# Auctions - Live Auction Platform

### Overview
Auctions is a live auction and bidding platform built with Next.js 14 and Supabase. It transforms a SaaS template into a specialized marketplace, offering real-time bidding, countdowns, a swipeable item carousel, and integrated payment processing with instant bidding and auto-charge functionalities. The platform aims to provide a seamless and engaging auction experience across various categories. Key features include a seller dashboard for auction creation, watchlist functionality, and a Netflix-style categorization for browsing.

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