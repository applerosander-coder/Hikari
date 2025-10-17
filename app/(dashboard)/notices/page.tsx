import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, UserPlus, Users } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Pool } from 'pg';
import { MarkAsReadButton } from '@/components/mark-as-read-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ConnectionRequestActions } from '@/components/connection-request-actions';

export default async function NoticesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });

  // Fetch user preferences
  const preferencesResult = await pool.query(
    'SELECT skip_connection_confirmation FROM user_preferences WHERE user_id = $1',
    [user.id]
  );
  const skipConfirmation = preferencesResult.rows[0]?.skip_connection_confirmation || false;

  // Fetch all notifications with user info, ordered by newest first
  const result = await pool.query(
    `SELECT 
      n.*,
      u.id as from_user_id,
      u.full_name as from_user_name,
      u.avatar_url as from_user_avatar
     FROM notifications n
     LEFT JOIN users u ON n.from_user_id = u.id
     WHERE n.user_id = $1 
     ORDER BY n.created_at DESC`,
    [user.id]
  );

  await pool.end();

  const notifications = result.rows.map(row => ({
    ...row,
    from_user: row.from_user_id ? {
      id: row.from_user_id,
      full_name: row.from_user_name,
      avatar_url: row.from_user_avatar
    } : null
  }));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Notices {unreadCount > 0 && `(${unreadCount})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No notices yet
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    !notification.read 
                      ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900' 
                      : 'bg-gray-50 dark:bg-gray-900/20'
                  }`}
                >
                  {notification.from_user ? (
                    <Link 
                      href={`/profile/${notification.from_user.id}`}
                      className="flex-shrink-0"
                    >
                      <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarImage 
                          src={notification.from_user.avatar_url || ''} 
                          alt={notification.from_user.full_name || 'User'} 
                        />
                        <AvatarFallback>
                          {notification.from_user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  ) : (
                    <div className="flex-shrink-0 mt-1">
                      {notification.type === 'follow' ? (
                        <UserPlus className="h-5 w-5 text-blue-500" />
                      ) : notification.type === 'connection_request' ? (
                        <Users className="h-5 w-5 text-purple-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                    {notification.type === 'connection_request' && notification.from_user && (
                      <div className="mt-3">
                        <ConnectionRequestActions
                          requesterId={notification.from_user.id}
                          requesterName={notification.from_user.full_name || 'Someone'}
                          skipConfirmation={skipConfirmation}
                        />
                      </div>
                    )}
                  </div>
                  {!notification.read && notification.type !== 'connection_request' && (
                    <MarkAsReadButton notificationId={notification.id} />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
