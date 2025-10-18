'use client';

import { useEffect, useState } from 'react';
import { Users2 } from 'lucide-react';

export function ConnectionsBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/messages/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
    }
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <Users2 className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-red-500"></span>
      )}
    </div>
  );
}
