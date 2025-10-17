import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, UserPlus, Users, Gavel } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Pool } from 'pg';
import { MarkAsReadButton } from '@/components/mark-as-read-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ConnectionRequestActions } from '@/components/connection-request-actions';
import Image from 'next/image';

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
    <div className="w-full">
      <div className="container max-w-5xl mx-auto px-0 sm:px-4 py-4 sm:py-8">
        <Card className="border-0 sm:border rounded-none sm:rounded-lg shadow-none sm:shadow-sm">
          <CardHeader className="border-b px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="relative flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-black dark:bg-white rounded-full" />
                )}
              </div>
              <span className="truncate">Notices</span>
              {unreadCount > 0 && (
                <span className="text-xs sm:text-sm font-normal text-muted-foreground flex-shrink-0">
                  ({unreadCount} unread)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No notices yet
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 ${
                      !notification.read 
                        ? 'bg-gray-50/50 dark:bg-gray-900/30 border-l-4 border-l-black dark:border-l-white' 
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                  {notification.type === 'outbid' && notification.image_url ? (
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <Link 
                        href={`/auctions/${notification.auction_item_id}`}
                        className="flex-shrink-0"
                      >
                        <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity">
                          <Image
                            src={notification.image_url}
                            alt="Auction item"
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 64px, 80px"
                          />
                        </div>
                      </Link>
                      <div className="flex flex-col gap-0.5 w-16 sm:w-20">
                        <Link 
                          href={`/auctions/${notification.auction_item_id}`}
                          className="text-[9px] sm:text-[10px] font-medium hover:underline truncate"
                        >
                          View auction
                        </Link>
                        <span className="text-[8px] sm:text-[9px] text-muted-foreground truncate">
                          {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ) : notification.from_user ? (
                    <Link 
                      href={`/profile/${notification.from_user.id}`}
                      className="flex-shrink-0"
                    >
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 cursor-pointer hover:opacity-80 transition-opacity border-2 border-gray-200 dark:border-gray-700">
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
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {notification.type === 'follow' ? (
                          <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
                        ) : notification.type === 'connection_request' ? (
                          <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                        ) : notification.type === 'outbid' ? (
                          <Gavel className="h-5 w-5 sm:h-6 sm:w-6" />
                        ) : (
                          <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {notification.type === 'outbid' && notification.auction_item_id ? (
                      <Link href={`/auctions/${notification.auction_item_id}`} className="block hover:underline">
                        <h3 className="font-semibold text-sm sm:text-base mb-1 leading-tight">
                          {notification.title}
                        </h3>
                      </Link>
                    ) : (
                      <h3 className="font-semibold text-sm sm:text-base mb-1 leading-tight">
                        {notification.title}
                      </h3>
                    )}
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                      {notification.message}
                    </p>
                    {notification.type !== 'outbid' && (
                      <p className="text-xs text-muted-foreground mt-2 sm:mt-3">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    )}
                    {notification.type === 'connection_request' && notification.from_user && (
                      <div className="mt-3 sm:mt-4">
                        <ConnectionRequestActions
                          requesterId={notification.from_user.id}
                          requesterName={notification.from_user.full_name || 'Someone'}
                          skipConfirmation={skipConfirmation}
                        />
                      </div>
                    )}
                  </div>
                  {!notification.read && notification.type !== 'connection_request' && (
                    <div className="flex-shrink-0 self-center">
                      <MarkAsReadButton notificationId={notification.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
