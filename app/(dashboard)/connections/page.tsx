import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageCircle } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Pool } from 'pg';

export default async function ConnectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  let pool: Pool | null = null;

  try {
    // Fetch all connections using Supabase
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select('id, user_id, peer_id, created_at')
      .or(`user_id.eq.${user.id},peer_id.eq.${user.id}`);

    if (connectionsError) {
      console.error('Error fetching connections:', connectionsError);
      throw connectionsError;
    }

    if (!connections || connections.length === 0) {
      return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-black dark:text-white" />
                Connections
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

    // Get the peer user IDs (the user who is NOT the current user)
    const peerIds = connections.map(conn => 
      conn.user_id === user.id ? conn.peer_id : conn.user_id
    );

    // Use PostgreSQL pool for complex query with auctions and messages (hybrid approach)
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    // Fetch user details, auction stats, and unread counts for all connections
    const result = await pool.query(
      `SELECT 
        u.id as peer_id,
        u.full_name, 
        u.avatar_url,
        COUNT(DISTINCT a.id) as total_auctions,
        COUNT(DISTINCT CASE WHEN a.status = 'active' THEN a.id END) as active_auctions,
        COUNT(DISTINCT CASE WHEN a.status = 'ended' THEN a.id END) as ended_auctions,
        COUNT(DISTINCT CASE WHEN m.read_at IS NULL THEN m.id END) as unread_count
       FROM users u
       LEFT JOIN auctions a ON a.created_by = u.id
       LEFT JOIN messages m ON (m.sender_id = u.id AND m.receiver_id = $1 AND m.read_at IS NULL)
       WHERE u.id = ANY($2::uuid[])
       GROUP BY u.id, u.full_name, u.avatar_url
       ORDER BY u.full_name ASC`,
      [user.id, peerIds]
    );

    const connectionsWithDetails = result.rows.map(row => ({
      peer_id: row.peer_id,
      full_name: row.full_name,
      avatar_url: row.avatar_url,
      total_auctions: parseInt(row.total_auctions, 10),
      active_auctions: parseInt(row.active_auctions, 10),
      ended_auctions: parseInt(row.ended_auctions, 10),
      unread_count: parseInt(row.unread_count, 10)
    }));

    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-black dark:text-white" />
              Connections ({connectionsWithDetails.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectionsWithDetails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No connections yet
              </div>
            ) : (
              <div className="space-y-3">
                {connectionsWithDetails.map((connection) => (
                  <div
                    key={connection.peer_id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-gray-50 dark:bg-gray-900/20"
                  >
                    <Link 
                      href={`/profile/${connection.peer_id}`}
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
                        href={`/profile/${connection.peer_id}`}
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
                        href={`/chat/${connection.peer_id}`}
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
  } catch (error) {
    console.error('Error fetching connections:', error);
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-red-500">
              Error loading connections
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}
