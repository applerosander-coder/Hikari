# BidWin Auction Platform - Setup Instructions

## 🎯 Welcome to BidWin!

Your SaaS template has been successfully transformed into a **live auction/bidding platform** where users can:
- Browse auctions with swipeable carousel interface
- See countdown timers for each auction
- Place bids on items and services
- View their active bids highlighted in the dashboard

## 📋 Database Setup (Required)

### Step 1: Create Auction Tables

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `supabase_auction_schema.sql`
4. Click **Run** to create the tables

This will create:
- `auctions` table - Stores all auction items/services
- `bids` table - Stores all bids placed by users
- Automatic triggers and policies for security
- Real-time subscriptions for live updates

### Step 2: Add Mock Auction Data (Optional)

To populate your platform with sample auctions:

1. In Supabase SQL Editor, first get your user ID:
   ```sql
   SELECT id FROM auth.users LIMIT 1;
   ```

2. Copy the user ID you get back

3. Open `supabase_mock_auctions.sql` and replace `(SELECT id FROM auth.users LIMIT 1)` with your actual user ID if needed

4. Run the entire script to add 10 sample auctions:
   - Professional photography session
   - Vintage leather messenger bag
   - Web development package
   - Apple AirPods Pro
   - Fitness training
   - Designer sunglasses
   - Logo design package
   - Mechanical keyboard
   - Home cleaning service
   - Wireless headphones

## 🚀 How to Use the Platform

### For Users (Bidders):

1. **Sign In**: Go to `/signin` and authenticate with GitHub or email
2. **Browse Auctions**: Navigate to `/auctions` or click "Auctions" in the menu
3. **My Bids Dashboard**: Visit `/dashboard` to see all auctions with your bids highlighted in blue
4. **Swipeable Interface**: 
   - Use arrow keys or swipe gestures to browse auction items
   - Click dots at the bottom to jump to specific auctions
   - Auctions you've bid on show a blue "Your Bid" badge
5. **Place a Bid**: Click "Bid Now" on any auction to see details and place your bid

### For Sellers (Creating Auctions):

The auction creation flow is ready for you to add. You can:
1. Add a "Create Auction" button in the navigation
2. Create a form to submit new auctions to the `auctions` table
3. Set your status, pricing, images, and timing

## 🎨 Features Implemented

### ✅ Swipeable Auction Browser
- **Location**: `/dashboard` (My Bids page)
- **Carousel Navigation**: Previous/Next arrows + keyboard support
- **Visual Indicators**: Dots showing current position
- **User Bid Highlighting**: Blue ring and badge for auctions you've bid on
- **Responsive Design**: Works on mobile, tablet, and desktop

### ✅ Countdown Timers
- Real-time countdown showing Days:Hours:Minutes:Seconds
- Automatically updates every second
- Shows "Ended" when auction completes

### ✅ Auction Detail Pages
- Full auction information with images
- Current bid display
- Bid history
- Bidding form

### ✅ Security & Permissions
- Row Level Security (RLS) enabled on all tables
- Users can only view active/upcoming auctions
- Users can only bid on active auctions
- Auction owners can manage their own auctions

## 🔧 Technical Details

### Database Schema

**Auctions Table:**
- `id` - Unique identifier
- `title` - Auction name
- `description` - Detailed description
- `starting_price` - Initial price (in cents)
- `current_bid` - Latest bid amount (in cents)
- `reserve_price` - Minimum price to sell (in cents)
- `image_url` - Primary image
- `category` - Item category (Services, Electronics, Fashion, etc.)
- `start_date` - When auction begins
- `end_date` - When auction ends
- `status` - draft, upcoming, active, ended, cancelled
- `created_by` - User who created the auction
- `winner_id` - User who won (when ended)

**Bids Table:**
- `id` - Unique identifier
- `auction_id` - Reference to auction
- `user_id` - User who placed the bid
- `bid_amount` - Bid amount in cents
- `created_at` - Timestamp

### API Endpoints

All data is accessed via Supabase:
- `supabase.from('auctions').select('*')` - Get all auctions
- `supabase.from('bids').select('*')` - Get all bids
- Real-time subscriptions available for live updates

## 🎯 Next Steps

1. **Set up the database** using the SQL scripts provided
2. **Sign in** to your platform
3. **Visit `/dashboard`** to see the swipeable auction browser
4. **Place some bids** to see the highlighting feature
5. **Customize the styling** to match your brand
6. **Add auction creation** functionality for sellers
7. **Implement notifications** for when users are outbid

## 🐛 Troubleshooting

**Issue**: "Could not find table 'auctions'"
- **Solution**: Run `supabase_auction_schema.sql` in Supabase SQL Editor

**Issue**: No auctions showing up
- **Solution**: Run `supabase_mock_auctions.sql` to add sample data, or create your own auctions

**Issue**: Can't see dashboard
- **Solution**: Make sure you're signed in first at `/signin`

**Issue**: Subscription errors in logs
- **Solution**: This is expected - we've removed the subscriptions table since this is now an auction platform, not a SaaS. The errors are harmless.

## 📝 Files Reference

- `supabase_auction_schema.sql` - Database table definitions
- `supabase_mock_auctions.sql` - Sample auction data
- `components/swipeable-auction-browser.tsx` - Main carousel component
- `components/auction-countdown.tsx` - Countdown timer component
- `app/(dashboard)/dashboard/page.tsx` - My Bids dashboard page
- `app/auctions/page.tsx` - Auction listing page
- `app/auctions/[id]/page.tsx` - Individual auction detail page

---

**Enjoy your new auction platform! 🎉**
