'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export function useAuctionNotifications(userId: string | undefined) {
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!userId || hasChecked.current) return;

    const checkNotifications = async () => {
      try {
        const supabase = createClient();

        const { data: notifications, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .eq('read', false)
          .eq('type', 'auction_won')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        if (notifications && notifications.length > 0) {
          for (const notification of notifications) {
            toast.success(notification.title, {
              description: notification.message,
              duration: 10000,
              action: notification.auction_id ? {
                label: 'View',
                onClick: () => {
                  window.location.href = `/mybids?tab=won`;
                },
              } : undefined,
            });

            await supabase
              .from('notifications')
              .update({ read: true })
              .eq('id', notification.id);
          }
        }

        hasChecked.current = true;
      } catch (error) {
        console.error('Error in notification check:', error);
      }
    };

    checkNotifications();
  }, [userId]);
}
