import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Pool } from 'pg';
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

  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });

  const connectionResult = await pool.query(
    `SELECT status FROM connects
     WHERE (user_id = $1 AND connected_user_id = $2)
        OR (user_id = $2 AND connected_user_id = $1)`,
    [user.id, params.userId]
  );

  if (connectionResult.rows.length === 0 || connectionResult.rows[0].status !== 'accepted') {
    await pool.end();
    redirect('/connections');
  }

  const userResult = await pool.query(
    'SELECT id, full_name, avatar_url FROM users WHERE id = $1',
    [params.userId]
  );

  await pool.end();

  if (userResult.rows.length === 0) {
    redirect('/connections');
  }

  const otherUser = userResult.rows[0];

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
            otherUserAvatar={otherUser.avatar_url}
          />
        </CardContent>
      </Card>
    </div>
  );
}
