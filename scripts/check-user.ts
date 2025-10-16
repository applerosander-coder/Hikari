import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
  const userId = '82e836d6-1c0a-42ae-b41c-7898425c56e7';
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('User data:');
  console.log(JSON.stringify(data, null, 2));
}

checkUser();
