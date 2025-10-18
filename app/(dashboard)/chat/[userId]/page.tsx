import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ChatInterface } from '@/components/chat-interface';

interface ChatPageProps {
  params: {
    userId: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  if (user.id === params.userId) {
    redirect('/connections');
  }

  // Check if connection exists using Supabase
  const { data: connection } = await supabase
    .from('connections')
    .select('id')
    .or(`and(user_id.eq.${user.id},peer_id.eq.${params.userId}),and(user_id.eq.${params.userId},peer_id.eq.${user.id})`)
    .maybeSingle();

  if (!connection) {
    redirect('/connections');
  }

  // Get other user details
  const { data: otherUser } = await supabase
    .from('users')
    .select('id, full_name, avatar_url')
    .eq('id', params.userId)
    .single();

  if (!otherUser) {
    redirect('/connections');
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Link
              href="/connections"
              className="p-2 hover:bg-muted rounded-full transition-colors"
              title="Back to Connections"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Chat with {otherUser.full_name || 'User'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ChatInterface
            currentUserId={user.id}
            otherUserId={params.userId}
            otherUserName={otherUser.full_name || 'User'}
            otherUserAvatar={otherUser.avatar_url || ''}
          />
        </CardContent>
      </Card>
    </div>
  );
}
