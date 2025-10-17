import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, avatarUrl }: { userId: string; avatarUrl: string } = await request.json();

    if (user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('Updating avatar for user:', userId, 'with URL:', avatarUrl);

    // Get user's full name from auth metadata
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || null;

    // Update auth metadata to keep it in sync
    await supabase.auth.updateUser({
      data: {
        avatar_url: avatarUrl,
        full_name: fullName
      }
    });

    // Use service client to bypass RLS and ensure consistent writes to public.users
    const serviceClient = createServiceClient();
    
    const { data: result, error } = await serviceClient
      .from('users')
      .upsert({
        id: userId,
        avatar_url: avatarUrl,
        full_name: fullName
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      throw new Error(error.message);
    }

    // Revalidate all paths that use getUserDetails
    revalidatePath('/', 'layout');
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/dashboard/account');

    console.log('Avatar updated successfully via Supabase:', result);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Avatar update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
