'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
  from_user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function MessagesDropdown({ userId }: { userId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    fetchMessages();

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `to_user_id=eq.${userId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchMessages = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      const userIds = [...new Set(data.map((m: Message) => m.from_user_id))];
      
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('id', userIds.length > 0 ? userIds : ['']);

      const userMap = new Map(users?.map(u => [u.id, u]) || []);

      const messagesWithUsers = data.map((msg: Message) => ({
        ...msg,
        from_user: userMap.get(msg.from_user_id) || null,
      }));

      setMessages(messagesWithUsers);
      setUnreadCount(messagesWithUsers.filter((m: Message) => !m.read).length);
    }
    setLoading(false);
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);
    
    fetchMessages();
  };

  const handleMessageClick = (message: Message) => {
    markAsRead(message.id);
    router.push('/messages');
  };

  if (!userId) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="relative">
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Messages</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel>Messages</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No messages</div>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              <DropdownMenuItem
                className={`flex items-start gap-3 p-3 cursor-pointer ${!message.read ? 'bg-muted/50' : ''}`}
                onClick={() => handleMessageClick(message)}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={message.from_user?.avatar_url || ''} />
                  <AvatarFallback>
                    {message.from_user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm truncate">
                      {message.from_user?.full_name || 'Unknown User'}
                    </p>
                    {!message.read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                    )}
                  </div>
                  {message.subject && (
                    <p className="text-sm font-medium truncate mt-1">{message.subject}</p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {message.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </div>
          ))
        )}

        {messages.length > 0 && (
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/messages')}
            >
              View All Messages
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
