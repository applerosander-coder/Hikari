/**
 * Script to set up Supabase Storage buckets
 * Run this once to create the necessary storage buckets for the auction platform
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorageBuckets() {
  console.log('Setting up Supabase storage buckets...\n');

  // Create seller-auctions bucket
  const { data: sellerBucket, error: sellerError } = await supabase
    .storage
    .createBucket('seller-auctions', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

  if (sellerError) {
    if (sellerError.message.includes('already exists')) {
      console.log('✓ seller-auctions bucket already exists');
      
      // Update bucket to be public
      const { error: updateError } = await supabase
        .storage
        .updateBucket('seller-auctions', {
          public: true,
          fileSizeLimit: 5242880,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        });
      
      if (updateError) {
        console.error('Error updating seller-auctions bucket:', updateError);
      } else {
        console.log('✓ seller-auctions bucket updated to public');
      }
    } else {
      console.error('Error creating seller-auctions bucket:', sellerError);
    }
  } else {
    console.log('✓ seller-auctions bucket created');
  }

  // Create avatar bucket
  const { data: avatarBucket, error: avatarError } = await supabase
    .storage
    .createBucket('avatar', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

  if (avatarError) {
    if (avatarError.message.includes('already exists')) {
      console.log('✓ avatar bucket already exists');
      
      // Update bucket to be public
      const { error: updateError } = await supabase
        .storage
        .updateBucket('avatar', {
          public: true,
          fileSizeLimit: 5242880,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        });
      
      if (updateError) {
        console.error('Error updating avatar bucket:', updateError);
      } else {
        console.log('✓ avatar bucket updated to public');
      }
    } else {
      console.error('Error creating avatar bucket:', avatarError);
    }
  } else {
    console.log('✓ avatar bucket created');
  }

  console.log('\n✓ Storage bucket setup complete!');
  console.log('\nBuckets configured:');
  console.log('  - seller-auctions (for auction item images)');
  console.log('  - avatar (for user avatars)');
  
  console.log('\n⚠️  IMPORTANT: You need to configure Storage Policies in Supabase Dashboard:');
  console.log('\n1. Go to Storage > Policies in your Supabase Dashboard');
  console.log('2. For the "seller-auctions" bucket, add these policies:');
  console.log('\n   Policy 1 - Allow authenticated users to upload:');
  console.log('   - Name: "Users can upload to their folder"');
  console.log('   - Policy: INSERT');
  console.log('   - Target roles: authenticated');
  console.log('   - USING expression: (bucket_id = \'seller-auctions\')');
  console.log('   - WITH CHECK: (bucket_id = \'seller-auctions\')');
  console.log('\n   Policy 2 - Allow public read access:');
  console.log('   - Name: "Public read access"');
  console.log('   - Policy: SELECT');
  console.log('   - Target roles: public');
  console.log('   - USING expression: (bucket_id = \'seller-auctions\')');
  console.log('\n3. For the "avatar" bucket, add the same policies');
  console.log('\nOr run this SQL in your Supabase SQL Editor:');
  console.log('\n-- Allow authenticated users to upload to seller-auctions');
  console.log('CREATE POLICY "Users can upload to seller-auctions"');
  console.log('ON storage.objects FOR INSERT TO authenticated');
  console.log('WITH CHECK (bucket_id = \'seller-auctions\');');
  console.log('\n-- Allow public read from seller-auctions');
  console.log('CREATE POLICY "Public read seller-auctions"');
  console.log('ON storage.objects FOR SELECT TO public');
  console.log('USING (bucket_id = \'seller-auctions\');');
  console.log('\n-- Allow authenticated users to upload to avatar');
  console.log('CREATE POLICY "Users can upload to avatar"');
  console.log('ON storage.objects FOR INSERT TO authenticated');
  console.log('WITH CHECK (bucket_id = \'avatar\');');
  console.log('\n-- Allow public read from avatar');
  console.log('CREATE POLICY "Public read avatar"');
  console.log('ON storage.objects FOR SELECT TO public');
  console.log('USING (bucket_id = \'avatar\');');
}

setupStorageBuckets().catch(console.error);
