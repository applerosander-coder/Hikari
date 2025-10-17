'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

const AVATAR_OPTIONS = [
  '/avatars/default-avatar.svg',
  '/avatars/avatar-1.jpg',
  '/avatars/avatar-2.jpg',
  '/avatars/avatar-3.jpg',
  '/avatars/avatar-4.jpg',
  '/avatars/avatar-5.jpg',
  '/avatars/avatar-6.jpg',
  '/avatars/avatar-7.jpg',
  '/avatars/avatar-8.jpg',
  '/avatars/avatar-9.jpg',
  '/avatars/avatar-10.jpg',
  '/avatars/avatar-11.jpg',
  '/avatars/avatar-12.jpg',
  '/avatars/avatar-13.jpg',
  '/avatars/avatar-14.jpg',
  '/avatars/avatar-15.jpg',
  '/avatars/avatar-16.jpg',
];

interface AvatarPickerProps {
  currentAvatar: string | null;
  userId: string;
}

export function AvatarPicker({ currentAvatar, userId }: AvatarPickerProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(
    currentAvatar || '/avatars/default-avatar.svg'
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  const handleSaveAvatar = async () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/update-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, avatarUrl: selectedAvatar }),
        });

        if (!response.ok) {
          throw new Error('Failed to update avatar');
        }

        toast({
          title: 'Success!',
          description: 'Your avatar has been updated.',
        });
        
        // Force a full page reload to clear cache
        window.location.reload();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update avatar. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  const hasChanged = selectedAvatar !== (currentAvatar || '/avatars/default-avatar.svg');

  return (
    <div className="space-y-4 py-6">
      <Label>Avatar Image</Label>
      
      {/* Current Avatar Preview */}
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-primary">
          <Image
            src={selectedAvatar}
            width={96}
            height={96}
            alt="Selected Avatar"
            className="object-cover w-full h-full"
            unoptimized
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Select an avatar from the options below
        </div>
      </div>

      {/* Avatar Options Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 sm:gap-4">
        {AVATAR_OPTIONS.map((avatarUrl) => (
          <button
            key={avatarUrl}
            type="button"
            onClick={() => handleAvatarSelect(avatarUrl)}
            className={`relative w-full aspect-square max-w-[100px] rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
              selectedAvatar === avatarUrl
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'border-gray-300'
            }`}
            disabled={isPending}
          >
            <Image
              src={avatarUrl}
              width={100}
              height={100}
              alt="Avatar option"
              className="object-cover w-full h-full"
              unoptimized
            />
            {selectedAvatar === avatarUrl && (
              <div className="absolute top-1 right-1 bg-white rounded-full p-1 border border-black">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-black stroke-[3]" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Save Button */}
      {hasChanged && (
        <Button
          onClick={handleSaveAvatar}
          disabled={isPending}
          className="mt-4"
        >
          {isPending ? 'Saving...' : 'Save Avatar'}
        </Button>
      )}
    </div>
  );
}
