'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
  from_user?: UserProfile;
  to_user?: UserProfile;
}

interface MessagesClientProps {
  userId: string;
  receivedMessages: Message[];
  sentMessages: Message[];
}

export function MessagesClient({
  userId,
  receivedMessages,
  sentMessages
}: MessagesClientProps) {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSendMessage = async () => {
    if (!recipientEmail.trim() || !message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSending(true);

    // Find recipient by email
    const { data: recipient, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', recipientEmail.trim())
      .single();

    if (userError || !recipient) {
      toast.error('Recipient not found');
      setIsSending(false);
      return;
    }

    if (recipient.id === userId) {
      toast.error('You cannot send a message to yourself');
      setIsSending(false);
      return;
    }

    // Send message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        from_user_id: userId,
        to_user_id: recipient.id,
        subject: subject.trim() || null,
        message: message.trim(),
        read: false
      });

    if (messageError) {
      toast.error('Failed to send message');
      setIsSending(false);
      return;
    }

    // Create notification for recipient
    await supabase.from('notifications').insert({
      user_id: recipient.id,
      type: 'message',
      title: 'New message',
      message: subject.trim() || 'You have a new message',
      data: { from_user_id: userId }
    });

    toast.success('Message sent successfully!');
    setIsComposeOpen(false);
    setRecipientEmail('');
    setSubject('');
    setMessage('');
    setIsSending(false);
    router.refresh();
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);
    
    router.refresh();
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold hidden sm:block">Messages</h1>
        
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="recipient">Recipient Email *</Label>
                <Input
                  id="recipient"
                  type="email"
                  placeholder="user@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Message subject (optional)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                />
              </div>
              <Button onClick={handleSendMessage} disabled={isSending} className="w-full">
                {isSending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inbox">
            Inbox ({receivedMessages.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({sentMessages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-4">
          {receivedMessages.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No messages in your inbox</p>
            </div>
          ) : (
            <div className="space-y-2">
              {receivedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${!msg.read ? 'bg-muted/30' : ''}`}
                  onClick={() => markAsRead(msg.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={msg.from_user?.avatar_url || ''} />
                      <AvatarFallback>{msg.from_user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="font-medium">{msg.from_user?.full_name || 'Unknown User'}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {!msg.read && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-500 text-white">New</span>
                        )}
                      </div>
                      {msg.subject && (
                        <p className="font-semibold text-sm mb-1">{msg.subject}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-4">
          {sentMessages.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No sent messages</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={msg.to_user?.avatar_url || ''} />
                      <AvatarFallback>{msg.to_user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="font-medium">To: {msg.to_user?.full_name || 'Unknown User'}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {msg.read && (
                          <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">Read</span>
                        )}
                      </div>
                      {msg.subject && (
                        <p className="font-semibold text-sm mb-1">{msg.subject}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
