# BidWin - Live Auction Platform

### Overview
BidWin is a comprehensive live auction and bidding platform built with Next.js 14 and Supabase. It enables real-time bidding, features countdown timers for auctions, and provides a swipeable carousel interface for browsing auction items. The platform's core purpose is to facilitate a dynamic and engaging auction experience, transforming a generic SaaS template into a specialized marketplace for various auction categories like Electronics, Fashion, Services, Collectibles, Home & Living, and Sports.

### User Preferences
I prefer the agent to be concise and to the point. When suggesting code changes, provide a brief explanation of the "why" behind the change, not just the "what." I value iterative development and prefer to review smaller, focused pull requests or changes rather than large, monolithic ones. Please ensure all modifications align with the existing monochrome design aesthetic (black, white, gray). Do not make changes to the `docs/` folder.

### System Architecture
The application is built on **Next.js 14 with the App Router** for routing and server-side rendering capabilities. **Supabase** handles both the database (PostgreSQL) and user authentication. **Stripe** is integrated for payment processing.

**UI/UX Decisions:**
- **Color Scheme:** Strict monochrome palette (black, white, gray) applied consistently across all UI elements, including dashboard components, buttons, and navigation.
- **Responsive Design:** Fully mobile-friendly with optimized layouts for various screen sizes, including responsive text, image scaling, and component adaptations (e.g., single-column layouts on mobile for category cards, hidden dashboard sidebar with hamburger menu).
- **Mobile Navigation:** Fixed full-screen overlay with mostly opaque background (90-95%) that appears on top of all page content. Features prominent logo, larger menu items for touch interaction, visual separators, and improved spacing. Properly blocks clicks to underlying content when open.
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