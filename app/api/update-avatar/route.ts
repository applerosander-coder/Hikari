import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { userId, avatarUrl }: { userId: string; avatarUrl: string } = await request.json();

  console.log('Updating avatar for user:', userId, 'with URL:', avatarUrl);

  // First check if user record exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  // If user doesn't exist, create the record first
  if (!existingUser) {
    console.log('User record not found, creating...');
    const { error: insertError } = await supabase
      .from('users')
      .insert({ id: userId, avatar_url: avatarUrl });
    
    if (insertError) {
      console.error('Error creating user record:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
    
    console.log('User record created successfully');
    return NextResponse.json({ success: true });
  }

  // Update existing user record
  const { data, error } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (error) {
    console.error('Avatar update error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.log('Avatar updated successfully:', data);
  return NextResponse.json({ data });
}