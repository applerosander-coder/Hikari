import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadAvatars() {
  const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
  const avatarFiles = [
    'default-avatar.svg',
    'avatar-1.jpg',
    'avatar-2.jpg',
    'avatar-3.jpg',
    'avatar-4.jpg',
    'avatar-5.jpg',
    'avatar-6.jpg',
  ];

  console.log('Starting avatar upload to Supabase storage...\n');

  for (const filename of avatarFiles) {
    const filePath = path.join(avatarsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${filename} not found, skipping...`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const contentType = filename.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg';

    const { data, error } = await supabase.storage
      .from('avatar')
      .upload(filename, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`❌ Error uploading ${filename}:`, error.message);
    } else {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/avatar/${filename}`;
      console.log(`✅ Uploaded ${filename}`);
      console.log(`   URL: ${publicUrl}\n`);
    }
  }

  console.log('\n✨ Avatar upload complete!');
}

uploadAvatars().catch(console.error);
