# Auctions - Live Auction Platform

### Overview
Auctions is a live auction and bidding platform built with Next.js 14 and Supabase. It transforms a SaaS template into a specialized marketplace, offering real-time bidding, countdowns, a swipeable item carousel, and integrated payment processing with instant bidding and auto-charge functionalities. The platform aims to provide a seamless and engaging auction experience across various categories, featuring a seller dashboard for auction creation, watchlist functionality, and Netflix-style categorization for browsing. The project focuses on scalability and a rich, interactive user experience.

### Recent Changes (Oct 2025)
- **Photo-First AI Workflow:** Redesigned seller forms to prioritize product photos. Sellers now upload an image first, then click one AI button to automatically generate title, description, AND category all from the photo alone. New field order: Image → AI Generate button → Title → Description → Category → Prices. The AI "Generate" button appears only when a new photo is uploaded (base64 validation), uses GPT-4o Vision API to analyze the image and propose all three fields at once, then disappears after use. Image preview increased to 48px height for better visibility. This streamlined workflow makes listing creation faster and more intuitive - just upload a photo, click generate, adjust if needed, and set prices.
- **Seller UX Enhancements:** Added location detection button (MapPin icon) next to location field that uses browser geolocation API and reverse geocoding to suggest user's current city/state. Includes 10-second timeout for blocked/denied permissions (common on mobile/Replit) with helpful error messages. Added "Now" checkbox next to Start Date that automatically fills in current date and time, unchecks when manually changed. Added "24h" checkbox next to End Date that automatically sets end date to 24 hours after start date (or current time if no start date is set), unchecks when manually changed. Made category field required for all auction items with validation.
- **Legal Acknowledgment Signup Flow:** Implemented mandatory legal acknowledgment dialog for all new user signups. Users must now confirm: (1) age verification (18+ or legal majority), (2) acceptance of Terms of Service, (3) acceptance of Privacy Policy, (4) acceptance of Bidding Guidelines. The dialog appears before account creation for both email/password and GitHub OAuth flows. All checkboxes must be checked to proceed, and legal documents open in new tabs for review. This ensures all users acknowledge BIDWIN's marketplace facilitator role and binding bid commitments before participating.
- **Legal & Informational Pages:** Created comprehensive legal documentation to protect BIDWIN platform owners. Added 5 new pages: (1) Terms of Service with liability caps, arbitration clauses, and platform facilitator language, (2) Privacy Policy with data protection and third-party disclaimers, (3) Bidding Guidelines with binding bid commitments and seller responsibility clauses, (4) About Auctions explaining silent auction mechanics, (5) Enhanced How It Works with full bidder/seller workflows. Updated footer links to point to all new pages. All legal content emphasizes BIDWIN as marketplace facilitator only, with sellers responsible for fulfillment and buyers/sellers handling disputes directly.
- **Blog Post Page Styling Unification:** Updated individual blog post pages to use the same elegant noise filter gradient background as the main blog listing page. Replaced colorful gradients with monochrome theme-aware design. Added BIDWIN logo to post headers for consistent branding across all blog pages. Text colors now use theme variables for proper light/dark mode support.
- **Blog Page Transformation:** Completely rebranded blog from template to BIDWIN platform. Updated blog header with BIDWIN logo (theme-aware with server-side rendering), changed title to "Success Stories" with tagline "Empowering communities through innovative auction fundraising". Created 4 new blog posts focused on fundraising success stories: (1) How BIDWIN Started - origin story and mission, (2) Riverside High School raises $52K case study, (3) Hearts for Hope non-profit doubles donations to $178K, (4) Community impact overview showing $27.8M collective raised. Updated footer with BIDWIN branding and copyright. Deleted all template blog posts. Maintained all original design, styling, and layout.
- **My Bids UI Improvements:** Updated watchlist badge text from "Watching" to "Saved" for better clarity. Changed Active tab icon from Heart to TrendingUp (↗) to better represent active bidding. Made all tab icons visible on mobile and desktop for consistent user experience across devices.
- **Sidebar Navigation Reorganization:** Switched positions of Seller and Leaderboard buttons in fullscreen mode. Navigation order is now: Auctions → My Bids → Leaderboard → Seller. Updated Seller icon from Users2 to Store icon to match mobile view for visual consistency across devices.
- **My Bids Tab Label Updates:** Renamed tab labels for better clarity: "Soon" → "Ending", "Ended" → "Closed", "Watch" → "Saved". Added red heart icon to Saved tab for visual emphasis.

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
- **Database Schema:** Custom tables for `auctions` (containers), `auction_items` (individual items with category field), `bids`, `customers`, `payments`, `watchlist`, `notifications`, and `invitations`. Bids are linked to `auction_items`. The `category` field on `auction_items` supports filtering by categories like Electronics, Fashion & Accessories, Services & Experiences, Collectibles & Art, Home & Living, and Sports & Hobbies.
- **Storage:** Supabase Storage with two buckets: `seller-auctions` (auction item images) and `avatar` (user avatars). Images are automatically compressed to 0.5MB max before upload.
- **State Management:** TanStack Query for data fetching and caching, and tRPC for API communication.
- **Performance Optimizations:** Exponential backoff for polling, `router.refresh()` for targeted data fetching, retry logic for bid verification, and Postgres RPC functions for efficient data aggregation.
- **Deployment:** Configured for Replit Autoscale. Cron jobs require separate Scheduled Deployments on Replit.
- **Auction Management:** Draft auction system with preview mode, multi-item editing, and auto-publishing based on start times.
- **Winner Processing:** Automated off-session Stripe charging for auction winners with comprehensive failure handling and real-time notifications.

**Feature Specifications:**
- **Live Auctions:** Real-time updates, countdowns, and categorized listings of individual auction items.
- **Dashboard Display:** Active auctions prominently featured; recently ended auctions displayed at bottom.
- **User Accounts:** Secure authentication, profile management, and avatar selection.
- **Seller Dashboard:** Form for creating multi-item auctions with image upload and real-time preview, and management of draft auctions including deletion. Includes AI-powered "Type for me" button that generates product descriptions from item titles, uploaded images, or both (works with any combination).
- **Payment Processing:** Secure bidding, saved payment methods, and automated off-session charging via Stripe for winners.
- **Mobile Optimization:** Accessible and usable across all devices.
- **My Bids Page:** Tracks active bids, outbid items, won auctions (with payment/shipping status), and a user-curated watchlist. Includes filtering for "Won" and "Lost" ended auctions.
- **Watchlist:** Allows users to track individual auction items.
- **Leaderboard Page:** Displays all auction items with filters and sortable columns.
- **Admin API Endpoint:** Secure endpoint to retrieve all registered user emails.
- **Dev Tools:** Development-only buttons for creating test data and manually triggering winner payment processing.

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