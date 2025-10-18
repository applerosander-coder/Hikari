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
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    // Fetch all accepted connections
    // Use DISTINCT ON to ensure each connected user appears only once
    const connectsResult = await pool.query(
      `SELECT DISTINCT ON (u.id)
              CASE WHEN c.user_id = $1 THEN c.connected_user_id ELSE c.user_id END as connected_user_id,
              u.full_name, 
              u.avatar_url,
              c.created_at,
              COUNT(DISTINCT a.id) as total_auctions,
              COUNT(DISTINCT CASE WHEN a.status = 'active' THEN a.id END) as active_auctions,
              COUNT(DISTINCT CASE WHEN a.status = 'ended' THEN a.id END) as ended_auctions,
              COUNT(DISTINCT CASE WHEN m.read_at IS NULL THEN m.id END) as unread_count
       FROM connects c
       INNER JOIN users u ON (
         CASE 
           WHEN c.user_id = $1 THEN c.connected_user_id 
           ELSE c.user_id 
         END = u.id
       )
       LEFT JOIN auctions a ON a.created_by = u.id
       LEFT JOIN messages m ON (m.sender_id = u.id AND m.receiver_id = $1 AND m.read_at IS NULL)
       WHERE ((c.user_id = $1 OR c.connected_user_id = $1) AND c.status = 'accepted')
       GROUP BY u.id, u.full_name, u.avatar_url, c.user_id, c.connected_user_id, c.created_at
       ORDER BY u.id, c.created_at DESC`,
      [user.id]
    );

    const connections = connectsResult.rows.map(row => ({
      connected_user_id: row.connected_user_id,
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
