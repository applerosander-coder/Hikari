# Auctions - Live Auction Platform

## Overview
Auctions is a live auction and bidding platform built with Next.js 14 and Supabase. It provides real-time bidding, countdowns, a swipeable item carousel, and integrated payment processing with instant bidding and auto-charge functionalities. The platform offers a seamless and engaging auction experience across various categories, featuring a seller dashboard for auction creation, watchlist functionality, and Netflix-style categorization for browsing. It aims for scalability and a rich, interactive user experience.

## User Preferences
I prefer the agent to be concise and to the point. When suggesting code changes, provide a brief explanation of the "why" behind the change, not just the "what." I value iterative development and prefer to review smaller, focused pull requests or changes rather than large, monolithic ones. Please ensure all modifications align with the existing monochrome design aesthetic (black, white, gray). Do not make changes to the `docs/` folder.

## Recent Changes (Oct 2025)
- **Avatar Display & Persistence Fix:** Fixed critical avatar issues: (1) Added cache invalidation using revalidatePath to ensure avatar updates immediately reflect across all pages - previously cached getUserDetails served stale data. (2) Fixed avatar image rendering in mobile menu by conditionally rendering AvatarImage only when avatar_url exists - previously empty strings caused fallback initials to always display.
- **Unified Mobile Menu:** Standardized mobile navigation menus across landing and dashboard pages. Removed logo from landing mobile menu. Fixed dashboard mobile menu to display user avatar and sign out button by correctly passing both user and userDetails props. Both menus now use SharedMobileMenu component consistently.

## System Architecture
The application uses Next.js 14 with the App Router and Supabase for PostgreSQL database and authentication. Stripe is integrated for payment processing. The system supports multi-item auctions, where `auctions` act as containers for individual `auction_items`.

### UI/UX Decisions
- **Color Scheme:** Strict monochrome palette (black, white, gray).
- **Responsive Design:** Optimized for various screen sizes with unified mobile menus and comprehensive safe area inset support for iPhone.
- **Interactive Elements:** Embla Carousel for swipeable browsing, Framer Motion for animations (including confetti).
- **Component Library:** Radix UI primitives styled with Tailwind CSS.
- **User Flow:** Email/password and GitHub OAuth, personalized dashboards, and bid processing with webhook verification. Legal acknowledgment is mandatory for new user signups.
- **Seller Experience:** Streamlined listing creation with photo-first AI generation for title, description, and category. Location detection and automated date/time filling are provided.
- **Navigation:** Compact navigation bars and reorganized sidebar for improved usability.

### Technical Implementations
- **Real-time Functionality:** Supabase real-time subscriptions for live auction updates and countdowns.
- **Database Schema:** Custom tables for `auctions`, `auction_items` (with category field), `bids`, `customers`, `payments`, `watchlist`, `notifications`, and `invitations`. Bids are linked to `auction_items`.
- **Storage:** Supabase Storage for `seller-auctions` and `avatar` buckets, with automatic image compression.
- **State Management:** TanStack Query for data fetching and caching, and tRPC for API communication.
- **Performance Optimizations:** Exponential backoff, `router.refresh()`, retry logic, and Postgres RPC functions.
- **Deployment:** Configured for Replit Autoscale; cron jobs require separate Scheduled Deployments.
- **Auction Management:** Draft auction system with preview, multi-item editing, and auto-publishing.
- **Winner Processing:** Automated off-session Stripe charging with failure handling and real-time notifications.

### Feature Specifications
- **Live Auctions:** Real-time updates, countdowns, and categorized listings.
- **Dashboard Display:** Prominent display of active auctions, followed by recently ended ones.
- **User Accounts:** Secure authentication, profile management, and avatar selection.
- **Seller Dashboard:** Form for creating multi-item auctions with image upload, real-time preview, and management of draft auctions. Includes AI-powered content generation.
- **Payment Processing:** Secure bidding, saved payment methods, and automated off-session charging.
- **Mobile Optimization:** Accessible across all devices with iPhone edge-to-edge layout.
- **My Bids Page:** Tracks active bids, outbid items, won auctions, and a user-curated watchlist. Includes filtering for "Won" and "Lost" ended auctions.
- **Watchlist:** Allows tracking of individual auction items.
- **Leaderboard Page:** Displays all auction items with filters and sortable columns.
- **Admin API Endpoint:** Secure endpoint for retrieving registered user emails.
- **Dev Tools:** Development-only buttons for test data and manual winner payment processing.
- **Legal & Informational Pages:** Comprehensive legal documentation (Terms of Service, Privacy Policy, Bidding Guidelines), About Auctions, and an enhanced How It Works page.

## External Dependencies
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