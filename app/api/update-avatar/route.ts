import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { updateUserAvatar } from '@/lib/db-pg';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
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

    // Update both database and auth metadata
    const result = await updateUserAvatar(userId, avatarUrl, fullName);

    // Update auth user metadata to keep it in sync
    await supabase.auth.updateUser({
      data: {
        avatar_url: avatarUrl,
        full_name: fullName
      }
    });

    // Revalidate all paths that use getUserDetails to clear the cache
    revalidatePath('/', 'layout');
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/dashboard/account');

    console.log('Avatar updated successfully:', result);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Avatar update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
