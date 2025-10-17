'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';

interface MobileNotificationBadgeProps {
  onClose: () => void;
}

export function MobileNotificationBadge({ onClose }: MobileNotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <Link
      href="/notices"
      onClick={onClose}
      className="flex items-center gap-3 px-2.5 text-muted-foreground hover:text-foreground transition-colors w-full"
    >
      <Clock className={`h-4 w-4 ${unreadCount > 0 ? 'text-yellow-500' : ''}`} />
      <span>Notices {unreadCount > 0 && `(${unreadCount})`}</span>
    </Link>
  );
}
