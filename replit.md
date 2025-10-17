# Auctions - Live Auction Platform

### Overview
Auctions is a live auction and bidding platform built with Next.js 14 and Supabase. It provides a specialized marketplace experience with real-time bidding, countdowns, and integrated payment processing. The platform aims to offer a seamless and engaging auction experience across various categories, featuring a seller dashboard for auction creation, watchlist functionality, and Netflix-style categorization for browsing. The project emphasizes scalability, a rich, interactive user experience, and a streamlined listing process leveraging AI. The platform positions itself as a marketplace facilitator, emphasizing clear legal acknowledgments for users.

### Recent Changes (Oct 2025)
- **Complete Supabase Migration (Oct 17):** Migrated all database operations to **pure Supabase PostgreSQL** architecture using single database connection. Removed React `cache()` wrapper from `getUserDetails` to prevent stale data. Avatar updates use Supabase service-role client, profile/review queries use direct PostgreSQL with JOINs to bypass RLS. Uses `revalidatePath()` to clear Next.js cache. Fixed `updateName` to update both auth metadata AND `public.users` table. Avatars and profile changes persist correctly across all pages. Comments dynamically display current user avatar/name via JOIN - when users update their profile, all their past comments automatically reflect the new information. Empty comments (rating-only submissions) are filtered from display - only comments with text appear in the Comments section, while all ratings contribute to the average score.

- **Multi-Comment Review System (Oct 17):** Enhanced review system to support multiple comments per user instead of overwriting. Removed unique constraint on `user_reviews(user_id, reviewer_id)` to allow unlimited comments. Updated review form to save rating + comment together (preventing duplicate entries). Auto-population of `public.users` table during signup ensures all new users have profile data available immediately. Review submission now uses direct PostgreSQL INSERT operations for reliability. Comments dynamically display current user data via JOIN - when users update their profile, all their past comments automatically reflect the new information.

- **Auction Item Thumbnail Carousels (Oct 17):** Added horizontal thumbnail carousels to user profile pages showing all auction items under each hosted auction. Each thumbnail is 96×96px, displays the first image from auction_items, and is clickable. Uses Embla Carousel with navigation arrows that appear on hover when more than 3 items exist. Profile page query enhanced to preload auction_items with image data. Implemented getUserProfile function in lib/db-pg.ts using direct PostgreSQL to avoid Replit's missing auth.users table access, gracefully falling back to "User" when public.users data is unavailable.

- **User Profile Pages with Reviews (Oct 17):** Added comprehensive user profile system accessible via clickable creator avatars. Profile pages (`/profile/[userId]`) display user avatar, name, auction statistics (total/active/ended count), average star rating, and all hosted auctions. All creator avatars across the platform (dashboard auction rows at 8×8px, /auctions page cards at 6×6px) are now clickable links to user profiles, using stopPropagation to prevent card navigation interference. UI section renamed from "Reviews" to "Comments".

### User Preferences
I prefer the agent to be concise and to the point. When suggesting code changes, provide a brief explanation of the "why" behind the change, not just the "what." I value iterative development and prefer to review smaller, focused pull requests or changes rather than large, monolithic ones. Please ensure all modifications align with the existing monochrome design aesthetic (black, white, gray). Do not make changes to the `docs/` folder.

### System Architecture
The application uses Next.js 14 with the App Router and Supabase for PostgreSQL database and authentication. Stripe is integrated for payment processing. The system supports multi-item auctions, where `auctions` act as containers for individual `auction_items`.

**UI/UX Decisions:**
- **Color Scheme:** Strict monochrome palette (black, white, gray).
- **Responsive Design:** Optimized for various screen sizes, including iPhone edge-to-edge layouts with safe area insets.
- **Interactive Elements:** Embla Carousel, Framer Motion for animations (e.g., confetti), and CoolMode particle effects.
- **Component Library:** Built with Radix UI primitives and styled using Tailwind CSS.
- **User Flow:** Streamlined signup with mandatory legal acknowledgment, email/password and GitHub OAuth, personalized dashboards (My Bids, Seller page), and bid processing with webhook verification. Unified logo and consistent pill menu layouts for improved navigation.
- **Visual Enhancements:** Creator avatars integrated across auction displays and filters, photo-first AI workflow for sellers, and improved mobile navigation.

**Technical Implementations:**
- **Real-time Functionality:** Supabase real-time subscriptions for live auction updates and countdowns.
- **Database Schema:** Custom tables for `auctions`, `auction_items` (with category field), `bids`, `customers`, `payments`, `watchlist`, `notifications`, and `invitations`. Bids are linked to `auction_items`.
- **Storage:** Supabase Storage for `seller-auctions` images and `avatar` images, with automatic compression.
- **State Management:** TanStack Query for data fetching and caching, and tRPC for API communication.
- **Performance Optimizations:** Exponential backoff, `router.refresh()`, retry logic, and Postgres RPC functions.
- **Deployment:** Configured for Replit Autoscale.
- **Auction Management:** Draft auction system, multi-item editing, auto-publishing, and AI-powered generation of title, description, and category from images. Enhanced seller UX with location detection, "Now" and "24h" checkboxes for dates.
- **Winner Processing:** Automated off-session Stripe charging with comprehensive failure handling.

**Feature Specifications:**
- **Live Auctions:** Real-time updates and categorized listings of individual auction items.
- **Dashboard Display:** Active and recently ended auctions, with unified filtering using pill chips.
- **User Accounts:** Secure authentication, profile management, and selection from 16 unique artistic avatars.
- **Seller Dashboard:** AI-powered form for creating multi-item auctions, managing drafts, and generating content from photos.
- **Payment Processing:** Secure bidding, saved payment methods, instant bidding, and automated off-session charging.
- **My Bids Page:** Tracks active bids, outbid items, won auctions, and a user-curated watchlist (now "Saved").
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