import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndUpdateAvatars() {
  console.log('Checking Supabase users table...\n');

  // Get all users with avatars
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, avatar_url');

  if (error) {
    console.error('Error fetching users:', error.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log('No users found in Supabase database.');
    return;
  }

  console.log(`Found ${users.length} user(s):\n`);

  for (const user of users) {
    console.log(`User ID: ${user.id}`);
    console.log(`Name: ${user.full_name || 'N/A'}`);
    console.log(`Current avatar: ${user.avatar_url || 'N/A'}`);

    // Check if avatar uses old local path
    if (user.avatar_url && user.avatar_url.startsWith('/avatars/')) {
      const filename = user.avatar_url.split('/').pop();
      const newUrl = `${supabaseUrl}/storage/v1/object/public/avatar/${filename}`;
      
      console.log(`  ⚠️  Updating to Supabase URL: ${newUrl}`);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: newUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error(`  ❌ Error updating:`, updateError.message);
      } else {
        console.log(`  ✅ Updated successfully`);
      }
    } else if (user.avatar_url && user.avatar_url.includes('supabase.co')) {
      console.log(`  ✅ Already using Supabase storage`);
    }
    
    console.log('');
  }

  console.log('✨ Check complete!');
}

checkAndUpdateAvatars().catch(console.error);
