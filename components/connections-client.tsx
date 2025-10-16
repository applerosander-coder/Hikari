'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, UserPlus, UserMinus, Check, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email?: string;
}

interface Follow {
  id: string;
  follower?: UserProfile;
  following?: UserProfile;
  status: string;
}

interface ConnectionsClientProps {
  userId: string;
  followers: Follow[];
  following: Follow[];
  pendingSent: Follow[];
  pendingReceived: Follow[];
}

export function ConnectionsClient({
  userId,
  followers: initialFollowers,
  following: initialFollowing,
  pendingSent: initialPendingSent,
  pendingReceived: initialPendingReceived
}: ConnectionsClientProps) {
  const [followers, setFollowers] = useState(initialFollowers);
  const [following, setFollowing] = useState(initialFollowing);
  const [pendingSent, setPendingSent] = useState(initialPendingSent);
  const [pendingReceived, setPendingReceived] = useState(initialPendingReceived);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSearching(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, avatar_url')
      .eq('email', searchEmail.trim())
      .single();

    if (error || !data) {
      toast.error('User not found');
      setSearchResults([]);
    } else if (data.id === userId) {
      toast.error('You cannot follow yourself');
      setSearchResults([]);
    } else {
      setSearchResults([data]);
    }
    setIsSearching(false);
  };

  const handleFollowRequest = async (targetUserId: string) => {
    // Check if already following or request pending
    const alreadyFollowing = following.some(f => f.following?.id === targetUserId);
    const requestPending = pendingSent.some(f => f.following?.id === targetUserId);

    if (alreadyFollowing) {
      toast.error('You are already following this user');
      return;
    }

    if (requestPending) {
      toast.error('Follow request already sent');
      return;
    }

    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: userId,
        following_id: targetUserId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to send follow request');
      return;
    }

    // Create notification for the target user
    await supabase.from('notifications').insert({
      user_id: targetUserId,
      type: 'follow_request',
      title: 'New follow request',
      message: 'Someone wants to follow you',
      data: { follow_id: data.id, from_user_id: userId }
    });

    toast.success('Follow request sent!');
    setSearchEmail('');
    setSearchResults([]);
    router.refresh();
  };

  const handleUnfollow = async (followId: string) => {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('id', followId);

    if (error) {
      toast.error('Failed to unfollow');
      return;
    }

    toast.success('Unfollowed successfully');
    router.refresh();
  };

  const handleAcceptFollow = async (followId: string) => {
    const { error } = await supabase
      .from('follows')
      .update({ status: 'accepted' })
      .eq('id', followId);

    if (error) {
      toast.error('Failed to accept follow request');
      return;
    }

    toast.success('Follow request accepted!');
    router.refresh();
  };

  const handleRejectFollow = async (followId: string) => {
    const { error } = await supabase
      .from('follows')
      .update({ status: 'rejected' })
      .eq('id', followId);

    if (error) {
      toast.error('Failed to reject follow request');
      return;
    }

    toast.success('Follow request rejected');
    router.refresh();
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 hidden sm:block">
        <h1 className="text-2xl sm:text-3xl font-bold">Connections</h1>
      </div>

      {/* Search Users */}
      <div className="mb-6 p-4 border rounded-lg bg-card">
        <h2 className="text-lg font-semibold mb-3">Find Users</h2>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Search by email address..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.full_name || 'Unknown User'}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleFollowRequest(user.id)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Follow Requests */}
      {pendingReceived.length > 0 && (
        <div className="mb-6 p-4 border rounded-lg bg-card">
          <h2 className="text-lg font-semibold mb-3">Pending Requests ({pendingReceived.length})</h2>
          <div className="space-y-2">
            {pendingReceived.map((follow) => (
              <div key={follow.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={follow.follower?.avatar_url || ''} />
                    <AvatarFallback>{follow.follower?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{follow.follower?.full_name || 'Unknown User'}</p>
                    <p className="text-xs text-muted-foreground">wants to follow you</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAcceptFollow(follow.id)}>
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRejectFollow(follow.id)}>
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs for Followers and Following */}
      <Tabs defaultValue="followers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="followers">
            Followers ({followers.length})
          </TabsTrigger>
          <TabsTrigger value="following">
            Following ({following.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="followers" className="mt-4">
          {followers.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No followers yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {followers.map((follow) => (
                <div key={follow.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={follow.follower?.avatar_url || ''} />
                      <AvatarFallback>{follow.follower?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{follow.follower?.full_name || 'Unknown User'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="following" className="mt-4">
          {following.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">Not following anyone yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {following.map((follow) => (
                <div key={follow.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={follow.following?.avatar_url || ''} />
                      <AvatarFallback>{follow.following?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{follow.following?.full_name || 'Unknown User'}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleUnfollow(follow.id)}>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Unfollow
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
