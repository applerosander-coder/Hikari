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
}

setupStorageBuckets().catch(console.error);
