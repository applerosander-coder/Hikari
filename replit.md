# Auctions - Live Auction Platform

### Overview
Auctions is a live auction and bidding platform built with Next.js 14 and Supabase. It provides a specialized marketplace experience with real-time bidding, countdowns, and integrated payment processing. The platform aims to offer a seamless and engaging auction experience across various categories, featuring a seller dashboard for auction creation, watchlist functionality, and Netflix-style categorization for browsing. The project emphasizes scalability, a rich, interactive user experience, and a streamlined listing process leveraging AI. The platform positions itself as a marketplace facilitator, emphasizing clear legal acknowledgments for users.

### Recent Changes (Oct 2025)
- **Outbid Notification System (Oct 17):** Implemented automatic outbid notifications that are sent whenever a user gets outbid on an auction item. Notifications include auction item thumbnail (64×64px), clickable title, "View auction →" link, and "Mark as read" button. Thumbnail and links navigate to the auction item page. Notifications display with red gavel icon and are created during bid placement. Database updated with `image_url` column in notifications table. All previous bidders on an item receive notification when outbid.

- **Paginated Comments Display (Oct 17):** Optimized comment loading with pagination showing 5 comments at a time. "Load more" button fetches additional comments from database dynamically. New API route `/api/reviews/[userId]` handles pagination with offset/limit parameters. Client-side component manages state and loading indicators. Improves page performance by only loading needed data. Comment count header shows total while displaying limited set initially.

- **Connection Request System with Accept/Reject Flow (Oct 17):** Implemented comprehensive connection request system with pending/accepted/rejected status workflow. Users click Connect to send a request, recipient sees notification with Accept/Reject buttons in `/notices` page. Accept flow shows confirmation dialog with "Only connect with people you know. Do you want to continue?" message and "Don't show this again" checkbox that saves to `user_preferences` table. Bidirectional connections ensure both parties see "Connected" status. New `/connections` page displays all accepted connections with avatar, name, auction statistics (total/active/ended), and message icon placeholder. ConnectButton shows three states: Connect (initial), Pending (awaiting response), Connected (accepted). Supports re-requesting after rejection, cancelling pending requests, and disconnecting. All database operations use PostgreSQL Pool with proper cleanup. Migration includes `connects` table with status field and `user_preferences` table.

- **Follow System with Notifications (Oct 17):** Implemented comprehensive follow functionality allowing users to follow/unfollow other users from profile pages. Follow button displays current follow state with loading indicators. When users follow someone, the followed user receives a notification. Added `follows` table with unique constraint on (follower_id, following_id) and proper indexes. Notification system displays unread count in both desktop sidebar (gold clock icon with badge) and mobile hamburger menu. New `/notices` page shows all notifications with mark-as-read functionality. Notifications poll every 30 seconds for real-time updates. Notification avatars are clickable and link to user profile pages. All database operations use direct PostgreSQL Pool connections for consistency.

- **Page Load Reliability Fix (Oct 17):** Fixed blank page issues during server restarts by adding proper loading states. Root and marketing layouts now show spinner components while Next.js compiles pages, preventing blank screens and eliminating need for manual page refresh.

- **Complete PostgreSQL Migration for Avatar Persistence (Oct 17):** All user avatar and profile data now fetched via **direct PostgreSQL queries** to ensure data consistency. `getUserDetails`, dashboard page, leaderboard page, and profile pages all use PostgreSQL Pool instead of Supabase client API to avoid caching issues. Avatar updates sync to `public.users` table as single source of truth. Review submissions automatically sync current user profile to database. Avatars and names persist correctly across all pages and page switches without reverting to old data. Comments dynamically display current user avatar/name via JOIN - when users update their profile, all their past comments automatically reflect the new information. Empty comments (rating-only submissions) are filtered from display - only comments with text appear in the Comments section, while all ratings contribute to the average score.

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
- **Real-time Functionality:** Supabase real-time subscriptions for live auction updates and countdowns. Notification polling (30s interval) for real-time unread count updates.
- **Database Schema:** Custom tables for `auctions`, `auction_items` (with category field), `bids`, `customers`, `payments`, `watchlist`, `notifications`, `invitations`, `follows`, `connects`, `user_preferences`, and `user_reviews`. Bids are linked to `auction_items`. Follows table tracks follower relationships. Connects table tracks bidirectional connection requests with status field (pending/accepted/rejected). User_preferences stores connection confirmation settings.
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
- **User Profiles & Social Features:** Comprehensive profile pages with auction statistics, follow/unfollow functionality, connection request system with accept/reject workflow and confirmation dialogs, hover tooltips on social buttons, and multi-comment review system with star ratings.
- **Notification System:** Real-time notification center accessible via gold clock icon in sidebar and mobile menu. Displays follow notifications, connection requests with Accept/Reject buttons, outbid notifications with auction thumbnails and clickable links, and other activity with unread count badges. Notices page includes connection request handling with confirmation dialogs and outbid alerts with direct links to auction items. Connection request notifications are automatically removed when responded to or cancelled. Outbid notifications include 64×64px auction item thumbnails.
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