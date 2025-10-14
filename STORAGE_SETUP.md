# Storage Setup Instructions

## Problem
When trying to upload images on the seller page, you're getting the error:
> "Upload error: new row violates row-level security policy"

This happens because Supabase Storage has Row Level Security (RLS) enabled but no policies are configured to allow uploads.

## Solution

You need to run the storage policy SQL in your Supabase Dashboard. Here's how:

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open your Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste this SQL:**

```sql
-- Allow authenticated users to upload to seller-auctions bucket
CREATE POLICY "Users can upload to seller-auctions"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'seller-auctions');

-- Allow public read from seller-auctions bucket
CREATE POLICY "Public read seller-auctions"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'seller-auctions');

-- Allow authenticated users to update their files
CREATE POLICY "Users can update seller-auctions"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'seller-auctions')
WITH CHECK (bucket_id = 'seller-auctions');

-- Allow authenticated users to delete their files
CREATE POLICY "Users can delete seller-auctions"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'seller-auctions');

-- Allow authenticated users to upload to avatar bucket
CREATE POLICY "Users can upload to avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatar');

-- Allow public read from avatar bucket
CREATE POLICY "Public read avatar"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatar');

-- Allow authenticated users to update avatars
CREATE POLICY "Users can update avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatar')
WITH CHECK (bucket_id = 'avatar');

-- Allow authenticated users to delete avatars
CREATE POLICY "Users can delete avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatar');
```

4. **Run the query**
   - Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)
   - You should see "Success. No rows returned"

5. **Test image upload**
   - Go back to your seller page
   - Try uploading an image for an auction item
   - It should now work!

### Option 2: Using Supabase CLI (Advanced)

If you have Supabase CLI configured locally:

```bash
# The migration file is already created at:
# supabase/migrations/20241014_storage_policies.sql

# Push to your remote database
npx supabase db push
```

## What This Does

These policies allow:
- ✅ Authenticated users to upload images to both buckets
- ✅ Everyone to view the uploaded images (public read)
- ✅ Users to update and delete their own uploads

## Troubleshooting

If you still get errors after running the SQL:

1. **Check if policies were created:**
   - Go to Storage > Policies in Supabase Dashboard
   - You should see the policies listed for both buckets

2. **Check if you're logged in:**
   - Make sure you're authenticated in the app
   - Try logging out and back in

3. **Check browser console:**
   - Open browser DevTools (F12)
   - Look for any error messages when uploading

## Files Modified

- ✅ Fixed missing `Loader2` import in create-auction-form.tsx
- ✅ Created storage buckets with `pnpm run setup:storage`
- ✅ Generated unique filenames for each upload (prevents overwrites)
- ⚠️ **Still needed:** Run the SQL above to enable uploads

Once you run the SQL policies, image uploads should work perfectly! 📸
