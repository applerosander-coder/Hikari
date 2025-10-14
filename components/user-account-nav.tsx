'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types/main'
import Image from "next/image"
import { createClient } from '@/utils/supabase/client';

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
  user: {
    full_name: string | null;
    avatar_url: string | null; 
    email: string | null; 
  };
  key?: string;
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }


  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        className="overflow-hidden rounded-full"
      >
        <Image
          src={user?.avatar_url || "/avatars/default-avatar.svg"}
          width={36}
          height={36}
          alt="Avatar"
          className="overflow-hidden rounded-full"
          unoptimized
        />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem asChild>
        <Link href="/dashboard/account" className="flex items-center w-full cursor-pointer font-semibold">
          {user?.full_name || "My Account"}
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <Link href="/dashboard/settings" className="flex items-center w-full">
          Settings
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Link href="/dashboard/support" className="flex items-center w-full">
          Support
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
        Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  )
}

