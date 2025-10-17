import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageCircle } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Pool } from 'pg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export default async function ConnectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });

  // Fetch all accepted connections with user and auction statistics (bidirectional)
  const result = await pool.query(
    `SELECT DISTINCT
      CASE 
        WHEN c.user_id = $1 THEN c.connected_user_id
        ELSE c.user_id
      END as connected_user_id,
      u.full_name,
      u.avatar_url,
      COUNT(DISTINCT a.id) as total_auctions,
      COUNT(DISTINCT CASE WHEN a.status = 'active' THEN a.id END) as active_auctions,
      COUNT(DISTINCT CASE WHEN a.status = 'ended' THEN a.id END) as ended_auctions,
      MAX(c.created_at) as created_at
     FROM connects c
     INNER JOIN users u ON u.id = CASE 
       WHEN c.user_id = $1 THEN c.connected_user_id
       ELSE c.user_id
     END
     LEFT JOIN auctions a ON a.created_by = u.id
     WHERE (c.user_id = $1 OR c.connected_user_id = $1) 
       AND c.status = 'accepted'
     GROUP BY connected_user_id, u.full_name, u.avatar_url
     ORDER BY created_at DESC`,
    [user.id]
  );

  await pool.end();

  const connections = result.rows;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
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

                  <div className="flex-shrink-0">
                    <button
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="Message (Coming Soon)"
                    >
                      <MessageCircle className="h-5 w-5 text-gray-500" />
                    </button>
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
