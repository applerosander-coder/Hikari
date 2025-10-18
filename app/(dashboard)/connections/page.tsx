import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageCircle } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export default async function ConnectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  // Fetch all accepted connections using Supabase
  const { data: connects, error: connectsError } = await supabase
    .from('connects')
    .select(`
      id,
      user_id,
      connected_user_id,
      created_at
    `)
    .or(`and(user_id.eq.${user.id},status.eq.accepted),and(connected_user_id.eq.${user.id},status.eq.accepted)`)
    .order('created_at', { ascending: false });

  if (connectsError) {
    console.error('Error fetching connections:', connectsError);
    return <div>Error loading connections</div>;
  }

  // Get connected user IDs
  const connectedUserIds = (connects || []).map(c => 
    c.user_id === user.id ? c.connected_user_id : c.user_id
  );

  if (connectedUserIds.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-black dark:text-white" />
              Connections (0)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No connections yet
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch user details
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, full_name, avatar_url')
    .in('id', connectedUserIds);

  if (usersError) {
    console.error('Error fetching users:', usersError);
  }

  // Fetch auction stats for each user
  const { data: auctions, error: auctionsError } = await supabase
    .from('auctions')
    .select('id, created_by, status')
    .in('created_by', connectedUserIds);

  // Fetch unread message counts
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('id, sender_id, receiver_id, read_at')
    .eq('receiver_id', user.id)
    .in('sender_id', connectedUserIds)
    .is('read_at', null);

  // Build connection data
  const connections = (users || []).map(connectedUser => {
    const userAuctions = (auctions || []).filter(a => a.created_by === connectedUser.id);
    const totalAuctions = userAuctions.length;
    const activeAuctions = userAuctions.filter(a => a.status === 'active').length;
    const endedAuctions = userAuctions.filter(a => a.status === 'ended').length;
    const unreadCount = (messages || []).filter(m => m.sender_id === connectedUser.id).length;

    return {
      connected_user_id: connectedUser.id,
      full_name: connectedUser.full_name,
      avatar_url: connectedUser.avatar_url,
      total_auctions: totalAuctions,
      active_auctions: activeAuctions,
      ended_auctions: endedAuctions,
      unread_count: unreadCount
    };
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-black dark:text-white" />
            Connections {connections.length > 0 && `(${connections.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No connections yet
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((connection) => (
                <div
                  key={connection.connected_user_id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-gray-50 dark:bg-gray-900/20"
                >
                  <Link 
                    href={`/profile/${connection.connected_user_id}`}
                    className="flex-shrink-0"
                  >
                    <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage 
                        src={connection.avatar_url || ''} 
                        alt={connection.full_name || 'User'} 
                      />
                      <AvatarFallback className="text-lg">
                        {connection.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/profile/${connection.connected_user_id}`}
                      className="hover:underline"
                    >
                      <h3 className="font-semibold text-base">
                        {connection.full_name || 'Anonymous User'}
                      </h3>
                    </Link>
                    
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Total:</span> {connection.total_auctions}
                      </div>
                      <div>
                        <span className="font-medium text-green-600 dark:text-green-500">Active:</span> {connection.active_auctions}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Ended:</span> {connection.ended_auctions}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 relative">
                    <Link
                      href={`/chat/${connection.connected_user_id}`}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors inline-block"
                      title="Send Message"
                    >
                      <MessageCircle className="h-5 w-5 text-gray-500" />
                      {connection.unread_count > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {connection.unread_count}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
