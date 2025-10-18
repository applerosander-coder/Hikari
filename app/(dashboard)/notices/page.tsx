import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, UserPlus, Users, Gavel } from 'lucide-react';
import { redirect } from 'next/navigation';
import { MarkAsReadButton } from '@/components/mark-as-read-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { InvitationActions } from '@/components/invitation-actions';
import Image from 'next/image';

export default async function NoticesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  // Fetch pending connection invitations
  const { data: invites } = await supabase
    .from('connection_invitations')
    .select('id, sender_id, message, created_at')
    .eq('recipient_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const invitationList = invites || [];

  // Fetch all other notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const notificationList = notifications || [];

  // Get unique user IDs from invitations and notifications
  const inviteSenderIds = invitationList.map(inv => inv.sender_id);
  const notificationFromUserIds = notificationList
    .filter(n => n.from_user_id)
    .map(n => n.from_user_id);

  const allUserIds = [...new Set([...inviteSenderIds, ...notificationFromUserIds])];

  // Batch-fetch sender profiles to avoid N+1
  let usersMap: Record<string, { id: string; full_name: string; avatar_url: string }> = {};

  if (allUserIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, avatar_url')
      .in('id', allUserIds);

    if (users) {
      usersMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, { id: string; full_name: string; avatar_url: string }>);
    }
  }

  // Attach sender info to invitations
  const enrichedInvitations = invitationList.map(invitation => ({
    ...invitation,
    sender: usersMap[invitation.sender_id],
    type: 'connection_invitation' as const,
  }));

  // Attach user info to notifications
  const enrichedNotifications = notificationList.map(notification => ({
    ...notification,
    from_user: notification.from_user_id ? usersMap[notification.from_user_id] : null,
  }));

  // Combine invitations and notifications, sort by created_at
  const allItems = [
    ...enrichedInvitations.map(inv => ({
      ...inv,
      isInvitation: true,
      read: false, // Invitations are always unread until responded
    })),
    ...enrichedNotifications.map(not => ({
      ...not,
      isInvitation: false,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = allItems.filter(item => !item.read).length;

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
            {allItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No notices yet
              </div>
            ) : (
              <div className="divide-y">
                {allItems.map((item) => {
                  if ('isInvitation' in item && item.isInvitation && 'sender' in item) {
                    // Render connection invitation
                    const invitation = item as typeof enrichedInvitations[number] & { read: boolean };
                    
                    return (
                      <div
                        key={invitation.id}
                        className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 bg-gray-50/50 dark:bg-gray-900/30 border-l-4 border-l-black dark:border-l-white`}
                      >
                        {invitation.sender && (
                          <Link 
                            href={`/profile/${invitation.sender.id}`}
                            className="flex-shrink-0"
                          >
                            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 cursor-pointer hover:opacity-80 transition-opacity border-2 border-gray-200 dark:border-gray-700">
                              <AvatarImage 
                                src={invitation.sender.avatar_url || ''} 
                                alt={invitation.sender.full_name || 'User'} 
                              />
                              <AvatarFallback>
                                {invitation.sender.full_name?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base mb-1 leading-tight">
                            Connection Request
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                            {invitation.sender?.full_name || 'Someone'} wants to connect with you
                          </p>
                          {invitation.message && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-2 italic">
                              "{invitation.message}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2 sm:mt-3">
                            {new Date(invitation.created_at).toLocaleString()}
                          </p>
                          <div className="mt-3 sm:mt-4">
                            <InvitationActions
                              invitationId={invitation.id}
                              senderName={invitation.sender?.full_name || 'Someone'}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Render regular notification
                    const notification = item as typeof enrichedNotifications[number];
                    
                    return (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 ${
                          !notification.read 
                            ? 'bg-gray-50/50 dark:bg-gray-900/30 border-l-4 border-l-black dark:border-l-white' 
                            : 'border-l-4 border-l-transparent'
                        }`}
                      >
                        {notification.type === 'outbid' && notification.image_url ? (
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
                                unoptimized
                              />
                            </div>
                          </Link>
                        ) : notification.from_user ? (
                          <Link 
                            href={`/profile/${notification.from_user.id}`}
                            className="flex-shrink-0"
                          >
                            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 cursor-pointer hover:opacity-80 transition-opacity border-2 border-gray-200 dark:border-gray-700">
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
                            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
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
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0 self-center">
                            <MarkAsReadButton notificationId={notification.id} />
                          </div>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
