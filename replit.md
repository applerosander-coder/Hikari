# BidWin - Live Auction Platform

### Overview
BidWin is a comprehensive live auction and bidding platform built with Next.js 14 and Supabase. Its core purpose is to facilitate a dynamic and engaging auction experience, transforming a generic SaaS template into a specialized marketplace for various auction categories. Key capabilities include real-time bidding, countdown timers, a swipeable carousel for item browsing, and integrated payment processing with instant bidding and auto-charge functionalities for saved payment methods. The platform aims to provide a seamless and engaging auction experience for users.

### Recent Changes
**October 11, 2025 - Firefly Effect with CSS:**
- Replaced particles with glowing fireflies for magical, enchanting hero section
- **Pulsing Glow**: Each firefly pulses independently with warm golden light (sine wave animation)
- **Organic Movement**: Fireflies float with sinusoidal sway for natural, lifelike motion
- **Depth-Based Scale**: 3D perspective with fireflies closer appearing larger and brighter
- **Mouse-Responsive Parallax**: Smooth lerped mouse tracking creates depth-based parallax effect
- **Performance Optimized**: Pre-creates 50 firefly elements once, updates only transform/opacity/box-shadow per frame
- **GPU Accelerated**: Uses willChange for hardware acceleration
- **Golden Glow Effect**: Box-shadow creates authentic firefly luminescence (#FFD700)
- **Spread Distribution**: Fireflies concentrated toward edges using quadratic distribution
- **No WebGL Required**: Pure CSS 3D transforms work in all environments

**October 11, 2025 - Auto-Charge Saved Cards with Manual Fallback:**
- **Instant Bidding**: Users with saved cards can bid instantly without payment dialogs
- **Auto-Charge Flow**: placeBidWithSavedCard() server action charges saved cards off-session automatically
- **Smart Fallback**: If auto-charge fails (authentication required, card declined), falls back to manual PaymentElement
- **Enhanced Error Handling**: Detects specific Stripe errors (requires_action, card_declined, insufficient_funds, authentication_required)
- **Seamless UX**: Try auto-charge → Show actionable toast → Fall back to manual payment if needed
- **Success Flow**: After successful payment, redirects to /dashboard/mybids with celebration parameters

### User Preferences
I prefer the agent to be concise and to the point. When suggesting code changes, provide a brief explanation of the "why" behind the change, not just the "what." I value iterative development and prefer to review smaller, focused pull requests or changes rather than large, monolithic ones. Please ensure all modifications align with the existing monochrome design aesthetic (black, white, gray). Do not make changes to the `docs/` folder.

### System Architecture
The application is built on **Next.js 14 with the App Router** for routing and server-side rendering. **Supabase** handles the PostgreSQL database and user authentication. **Stripe** is integrated for payment processing, including features like auto-charge for saved cards and instant bidding.

**UI/UX Decisions:**
- **Color Scheme:** Strict monochrome palette (black, white, gray) is consistently applied across all UI elements.
- **Responsive Design:** Optimized layouts for various screen sizes, ensuring mobile-friendliness with responsive text, image scaling, and adaptive components.
- **Interactive Elements:** Utilizes **Embla Carousel** for swipeable browsing and **Framer Motion** for animations, including a celebratory animation for successful bids. Glowing fireflies with pulsing golden light, organic floating movement, and mouse-responsive parallax create a magical, enchanting aesthetic in the hero section.
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