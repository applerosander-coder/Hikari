-- Storage policies for seller-auctions and avatar buckets
-- Run this in your Supabase SQL Editor to enable image uploads

-- Allow authenticated users to upload to seller-auctions bucket
CREATE POLICY "Users can upload to seller-auctions"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'seller-auctions');

-- Allow public read from seller-auctions bucket
CREATE POLICY "Public read seller-auctions"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'seller-auctions');

-- Allow authenticated users to update their own files in seller-auctions
CREATE POLICY "Users can update seller-auctions"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'seller-auctions')
WITH CHECK (bucket_id = 'seller-auctions');

-- Allow authenticated users to delete their own files in seller-auctions
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

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatar')
WITH CHECK (bucket_id = 'avatar');

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatar');
