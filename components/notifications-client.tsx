'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Check, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data: any;
  created_at: string;
}

interface NotificationsClientProps {
  userId: string;
  notifications: Notification[];
}

export function NotificationsClient({ userId, notifications: initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const router = useRouter();
  const supabase = createClient();

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    router.refresh();
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    toast.success('All notifications marked as read');
    router.refresh();
  };

  const handleAcceptFollow = async (followId: string, notificationId: string) => {
    const { error } = await supabase
      .from('follows')
      .update({ status: 'accepted' })
      .eq('id', followId);

    if (error) {
      toast.error('Failed to accept follow request');
      return;
    }

    await markAsRead(notificationId);
    toast.success('Follow request accepted!');
    router.refresh();
  };

  const handleRejectFollow = async (followId: string, notificationId: string) => {
    const { error } = await supabase
      .from('follows')
      .update({ status: 'rejected' })
      .eq('id', followId);

    if (error) {
      toast.error('Failed to reject follow request');
      return;
    }

    await markAsRead(notificationId);
    toast.success('Follow request rejected');
    router.refresh();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold hidden sm:block">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg ${!notification.read ? 'bg-muted/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {!notification.read && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white">New</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>

                  {/* Follow Request Actions */}
                  {notification.type === 'follow_request' && notification.data?.follow_id && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptFollow(notification.data.follow_id, notification.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectFollow(notification.data.follow_id, notification.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                {!notification.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
