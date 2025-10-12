# How to Run the Database Migration

## ⚠️ IMPORTANT: Run this BEFORE the application code updates work

The database migration SQL is ready. Follow these steps:

## Step 1: Access Your Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**

## Step 2: Run the Migration Script

1. Open the file: `docs/COMPLETE_MIGRATION_WITH_MOCKDATA.sql`
2. Copy the ENTIRE contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

## Step 3: Verify the Migration

The script will:
- ✅ Create `auction_items` table
- ✅ Add `name` and `place` columns to `auctions` table
- ✅ Add `auction_item_id` column to `bids` table
- ✅ Set up indexes and Row Level Security policies
- ✅ Insert 2 mock auctions with 10 items each

### Verification Queries

Run these to confirm everything worked:

```sql
-- Check auctions
SELECT id, name, place, start_date, end_date, status 
FROM public.auctions 
ORDER BY created_at DESC LIMIT 2;

-- Check auction items (should see 20 items)
SELECT ai.title, ai.starting_price, a.name as auction_name 
FROM public.auction_items ai 
JOIN public.auctions a ON ai.auction_id = a.id 
ORDER BY a.created_at DESC, ai.position;
```

## Troubleshooting

### If you get "No users found" error:
The mockup data needs a user ID. Do this:

1. Find your user ID:
```sql
SELECT id FROM auth.users LIMIT 1;
```

2. Replace the DO block in the SQL with your actual user ID:
```sql
-- Replace the DO block's user_id with your actual UUID
-- Or manually insert auctions with your user ID
```

### If tables already exist:
The migration uses `IF NOT EXISTS` so it's safe to run multiple times.

## What's Next?

Once the migration is successful:
1. The application code is being updated to work with the new structure
2. Seller forms will create auction containers with multiple items
3. Dashboard will show items grouped under auctions
4. Bidding will work on individual items

## Mock Data Details

**Auction 1: "Estate Sale - Vintage Collectibles"**
- Location: Los Angeles, CA
- Starts: 1 hour from when you run the script
- Ends: 3 days from when you run the script
- 10 items: watches, cards, rugs, books, jewelry, guitars, etc.

**Auction 2: "Art Gallery Closing Sale"**
- Location: New York, NY  
- Starts: 6 hours from when you run the script
- Ends: 5 days from when you run the script
- 10 items: paintings, sculptures, furniture, wine, etc.

Both auctions start as 'draft' and will auto-publish when their start time is reached (via your existing cron job).
