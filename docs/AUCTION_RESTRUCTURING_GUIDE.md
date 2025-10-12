# Auction System Restructuring Guide

## Overview
This document explains the database changes needed to support multiple items grouped under auctions with name and place fields.

## Current vs. New Structure

### Current Structure
```
auctions (table)
├── id, title, description, pricing, images
└── Each auction IS a single item

bids (table)
└── References auction_id directly
```

### New Structure
```
auctions (table - now a container)
├── id, name, place, start_date, end_date, status
└── Groups multiple items together

auction_items (table - new)
├── id, auction_id (FK), title, description, pricing, images
└── Individual items within an auction

bids (table - updated)
└── References auction_item_id (instead of auction_id)
```

## Database Changes Required

### ⚠️ BREAKING CHANGES
This restructuring will break existing functionality until all code is updated:
- All API endpoints that query auctions
- Seller dashboard and forms
- Bidding system
- Dashboard displays
- Payment processing
- Notifications

### Option 1: Fresh Start (Recommended for Development)
If you don't need to preserve existing auction data:

1. **Run the migration SQL** in Supabase SQL Editor:
   - See `docs/DATABASE_MIGRATION_AUCTION_ITEMS.sql`
   - This adds `name` and `place` to auctions
   - Creates the `auction_items` table
   - Sets up proper indexes and RLS policies

2. **Clear existing data** (optional):
   ```sql
   DELETE FROM bids;
   DELETE FROM auctions;
   ```

### Option 2: Preserve Existing Data
If you have production data to preserve:

1. **Run the migration SQL** (same as Option 1)

2. **Migrate existing auctions**:
   ```sql
   -- For each existing auction, create a corresponding item
   INSERT INTO auction_items (
     auction_id, title, description, starting_price, 
     current_bid, reserve_price, image_url, image_urls,
     winner_id, payment_completed, payment_intent_id, payment_completed_at
   )
   SELECT 
     id as auction_id, title, description, starting_price,
     current_bid, reserve_price, image_url, image_urls,
     winner_id, payment_completed, payment_intent_id, payment_completed_at
   FROM auctions;
   
   -- Update bids to reference auction_items
   UPDATE bids b
   SET auction_item_id = ai.id
   FROM auction_items ai
   WHERE ai.auction_id = b.auction_id;
   ```

## Implementation Steps

### 1. Database Migration ✅ (Ready)
- SQL script created: `docs/DATABASE_MIGRATION_AUCTION_ITEMS.sql`
- TypeScript types updated: `types/db.ts` (partially)

### 2. Application Code Updates (Needed)
- [ ] Update seller forms to create auctions + items
- [ ] Update all API endpoints 
- [ ] Update dashboard to show auction groups
- [ ] Update bidding to reference auction_items
- [ ] Update payment processing
- [ ] Update notifications

### 3. UI/UX Updates (Needed)
- [ ] Seller flow: Create auction → Add items → Preview all
- [ ] Dashboard: Show auctions with nested items
- [ ] Item detail pages with auction context
- [ ] Bidding interface per item

## Alternative Approach: Drizzle ORM

Instead of manual SQL, we could set up **Drizzle** for type-safe schema management:

### Benefits:
- ✅ Type-safe migrations
- ✅ Automatic TypeScript types
- ✅ Safer schema changes
- ✅ Better version control

### Setup Required:
```bash
npm install drizzle-orm drizzle-kit
```

Then define schema in code instead of SQL.

## Recommendation

**For your situation, I recommend:**

1. **Immediate:** Run the SQL migration in Supabase SQL Editor
2. **Choose data strategy:** Fresh start vs. preserve data
3. **Update application code:** I'll restructure the forms and APIs
4. **Consider Drizzle:** Set up for future schema changes

## Next Steps - Your Choice

**Option A: Quick SQL Approach**
- I run the migration in development Supabase
- Update all application code for new structure
- Test end-to-end
- You run same SQL in production when ready

**Option B: Drizzle Setup (Better long-term)**
- I set up Drizzle ORM
- Define schema in TypeScript
- Run migrations with `npm run db:push`
- Update application code

Which approach do you prefer?
