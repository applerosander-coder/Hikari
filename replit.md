# Auctions - Live Auction Platform

### Overview
Auctions is a comprehensive live auction and bidding platform built with Next.js 14 and Supabase. Its core purpose is to facilitate a dynamic and engaging auction experience, transforming a generic SaaS template into a specialized marketplace for various auction categories. Key capabilities include real-time bidding, countdown timers, a swipeable carousel for item browsing, and integrated payment processing with instant bidding and auto-charge functionalities for saved payment methods. The platform aims to provide a seamless and engaging auction experience for users.

### Recent Changes
**October 12, 2025 - Loading Spinners & Navigation Progress:**
- **Page Loading Spinners**: Added loading.tsx files for dashboard, marketing, and auction routes with centered spinner animations
- **Navigation Progress Bar**: Implemented NProgress loading bar at top of screen during page transitions
- **Custom Spinner Component**: Created reusable Spinner component with sm/md/lg size variants
- **Monochrome Design**: Progress bar uses theme foreground color for consistent branding across light/dark modes
- **Auto-trigger**: Loading states automatically display during route changes and data fetching

**October 12, 2025 - Watchlist Heart Icon Update & Bug Fixes:**
- **Heart-Based Watchlist**: Changed watchlist button from eye icon to heart icon for better user experience
- **Red Heart Indicator**: Heart button shows red background (bg-red-500) when item is in watchlist, white/outlined when not
- **Single Icon System**: Removed duplicate "user has bid" heart indicator, consolidated into one heart for watchlist
- **Toggle Functionality**: Click heart to add/remove from watchlist with visual feedback
- **Simplified Card Design**: Cleaner auction cards with single clickable heart button in top-right corner
- **Mobile-Responsive Tabs**: My Bids page tabs optimized for mobile with shorter labels and hidden icons on small screens
- **Fixed Duplicate Clock Icons**: Removed duplicate clock icon from auction cards (AuctionCountdown component already renders one)
- **Fixed Watchlist Button Clicks**: Added stopPropagation to watchlist button wrapper to prevent card onClick interference
- **Watchlist Tab Icons**: Replaced all eye icons with heart icons in My Bids watchlist section for consistent branding
- **Database Fix**: Created missing `watchlist` table in Supabase with proper RLS policies for user data protection
- **Celebration Fix**: Restored bid success celebration on My Bids page - confetti and success message now display after successful bids
- **Mobile Menu Enhancement**: Added theme toggle (light/dark mode) and sign out buttons to mobile hamburger menu for feature parity with desktop sidebar

**October 11, 2025 - My Bids Page Restructure with Watchlist:**
- **Active Bids Tab**: Shows high bids and outbid items with visual status indicators
- **Ending Soon Tab**: Displays auctions ending within 24 hours for quick action
- **Won Auctions Tab**: Lists won items with payment status, shipping status, and support contact options
- **Watchlist Tab**: User-curated list of auction items they want to track
- **Watchlist Database**: Created `watchlist` table with user_id and auction_id relationships
- **Watchlist Button**: Heart icon button on all auction cards for quick add/remove from watchlist
- **Tabbed Interface**: Clean navigation between Active, Ending Soon, Won, and Watchlist sections
- **Payment & Shipping Tracking**: Added `shipping_status` and `tracking_number` fields to payments table
- **Auto-charge Integration**: Won auctions display payment status (pending/paid/failed) and shipping updates

**October 11, 2025 - Netflix-Style Dashboard Categorization:**
- **Hot Auctions Section**: Created "🔥 Hot Auctions" row at top showing 10 most popular items sorted by bid count
- **Category Rows**: Grouped auctions by category (Electronics, Fashion & Accessories, Services & Experiences, Collectibles & Art, Home & Living, Sports & Hobbies)
- **Horizontal Scrolling**: Each category row has horizontal scroll with left/right navigation arrows on hover
- **Responsive Cards**: Auction cards are uniform width and swipeable within each category
- **Visual Hierarchy**: Hot auctions use larger cards with flame icon and bid count badges
- **Search Integration**: Search bar filters across all categories while maintaining layout structure
- **Performance**: Created Postgres RPC function `get_auction_bid_counts()` for efficient database-level aggregation instead of N+1 queries
- **Monochrome Design**: All badges use black/white with dark mode support (no colored accents), maintaining strict design aesthetic
- **Watchlist Integration**: All auction cards now include watchlist toggle button for easy tracking

**October 11, 2025 - Sidebar Enhancements:**
- **Sign Out Button**: Added sign out button at bottom of dashboard sidebar for easy logout
- **Theme Toggle**: Added light/dark mode toggle button to sidebar (positioned above sign out)
- **Landing Page Link**: Updated "My Bids" button on landing page to direct to /mybids instead of /dashboard

**October 11, 2025 - Dashboard Layout Applied to All Routes:**
- **Unified Layout**: Moved dashboard layout to route group level so both /dashboard and /mybids share the same sidebar
- **My Bids Sidebar**: My Bids page now displays the dashboard sidebar with all navigation options
- **Consistent Navigation**: All dashboard routes (Auctions, My Bids, Account, Settings) use the same layout structure

**October 11, 2025 - Dashboard Icon Reorganization:**
- **Home Icon**: Changed top sidebar logo from gavel to home icon for clearer navigation to homepage
- **Auctions Icon**: Moved gavel icon from top logo to "Auctions" navigation item for stronger auction identity
- **Icon Hierarchy**: Top logo (Home) → Auctions (Gavel) → My Bids (Heart) → Disabled items
- **Consistent Branding**: Gavel icon now represents auction functionality throughout the dashboard navigation

**October 11, 2025 - Glitter Confetti Effect with CSS:**
- Transformed particles into sparkling glitter confetti for celebratory hero section
- **Twinkling Sparkle**: Each particle twinkles independently with box-shadow glow effect (sine wave animation)
- **Mixed Shapes**: Random circles and squares for authentic confetti variety
- **Multi-Color Palette**: Gold, platinum, silver, white, and metallic gold particles
- **Rotating Motion**: Particles tumble and rotate as they float with gentle downward drift
- **Depth-Based Scale**: 3D perspective with closer particles appearing larger and brighter
- **Mouse-Responsive Parallax**: Smooth lerped mouse tracking creates depth-based parallax effect
- **Performance Optimized**: Pre-creates 80 glitter elements once, updates only transform/opacity/box-shadow per frame
- **GPU Accelerated**: Uses willChange for hardware acceleration
- **Sparkle Glow**: Dynamic box-shadow creates authentic glitter shimmer effect
- **Continuous Flow**: Particles wrap around for endless confetti celebration
- **No WebGL Required**: Pure CSS 3D transforms work in all environments

**October 11, 2025 - Auto-Charge Saved Cards with Manual Fallback:**
- **Instant Bidding**: Users with saved cards can bid instantly without payment dialogs
- **Auto-Charge Flow**: placeBidWithSavedCard() server action charges saved cards off-session automatically
- **Smart Fallback**: If auto-charge fails (authentication required, card declined), falls back to manual PaymentElement
- **Enhanced Error Handling**: Detects specific Stripe errors (requires_action, card_declined, insufficient_funds, authentication_required)
- **Seamless UX**: Try auto-charge → Show actionable toast → Fall back to manual payment if needed
- **Success Flow**: After successful payment, redirects to /mybids with celebration parameters

### User Preferences
I prefer the agent to be concise and to the point. When suggesting code changes, provide a brief explanation of the "why" behind the change, not just the "what." I value iterative development and prefer to review smaller, focused pull requests or changes rather than large, monolithic ones. Please ensure all modifications align with the existing monochrome design aesthetic (black, white, gray). Do not make changes to the `docs/` folder.

### System Architecture
The application is built on **Next.js 14 with the App Router** for routing and server-side rendering. **Supabase** handles the PostgreSQL database and user authentication. **Stripe** is integrated for payment processing, including features like auto-charge for saved cards and instant bidding.

**UI/UX Decisions:**
- **Color Scheme:** Strict monochrome palette (black, white, gray) is consistently applied across all UI elements.
- **Responsive Design:** Optimized layouts for various screen sizes, ensuring mobile-friendliness with responsive text, image scaling, and adaptive components.
- **Interactive Elements:** Utilizes **Embla Carousel** for swipeable browsing and **Framer Motion** for animations, including a celebratory animation for successful bids. Sparkling glitter confetti with twinkling multi-color particles, rotating motion, and mouse-responsive parallax create a festive, celebratory aesthetic in the hero section.
- **Component Library:** Built with **Radix UI** primitives and styled using **Tailwind CSS**.
- **User Flow:** Includes email/password and GitHub OAuth authentication, a dashboard with personalized content (My Bids), and dedicated pages for auction browsing and bidding. Bid processing incorporates a payment flow with webhook verification and idempotency protection.

**Technical Implementations:**
- **Real-time Functionality:** Leverages Supabase's real-time subscriptions for live auction updates and countdown timers.
- **Database Schema:** Custom `auctions`, `bids`, `customers`, and `payments` tables manage auction items, user bids, and payment information.
- **State Management:** Uses **TanStack Query** for data fetching and caching, and **tRPC** for API communication.
- **Performance Optimizations:** Implements exponential backoff for polling, `router.refresh()` for targeted data fetching, and retry logic for bid verification to reduce client-side workload and improve responsiveness.
- **Deployment:** Configured for Replit Autoscale deployment.

**Feature Specifications:**
- **Live Auctions:** Real-time countdowns, dynamic bid updates, and categorized auction listings.
- **User Accounts:** Secure authentication, profile management, and avatar selection.
- **Payment Processing:** Integrated Stripe for secure bidding, managing saved payment methods, and off-session charging for auction winners.
- **Mobile Optimization:** Ensures accessibility and usability across all devices.
- **My Bids Page:** Dedicated section for users to track "Active Bids" and "Outbid" items with search functionality.

### External Dependencies
- **Supabase:** Database, Authentication, Realtime subscriptions.
- **Stripe:** Payment processing (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
- **Next.js 14:** Web framework.
- **React:** UI library.
- **Tailwind CSS:** Utility-first CSS framework.
- **Radix UI:** Unstyled component primitives.
- **Framer Motion:** Animation library.
- **Embla Carousel:** Carousel library.
- **TanStack Query:** Data fetching and state management.
- **tRPC:** End-to-end type-safe APIs.
- **Fumadocs:** Documentation generation.
- **canvas-confetti:** For celebration animations.