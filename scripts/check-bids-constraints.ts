import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConstraints() {
  // Query to get all constraints on the bids table
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        con.conname as constraint_name,
        con.contype as constraint_type,
        pg_get_constraintdef(con.oid) as definition
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE rel.relname = 'bids'
      AND nsp.nspname = 'public';
    `
  });

  if (error) {
    console.error('Error:', error.message);
    
    // Try alternative query
    const { data: cols, error: colError } = await supabase
      .from('bids')
      .select('*')
      .limit(1);
    
    if (cols) {
      console.log('Sample bid structure:', cols[0]);
    }
  } else {
    console.log('Constraints on bids table:');
    console.log(JSON.stringify(data, null, 2));
  }
}

checkConstraints();
