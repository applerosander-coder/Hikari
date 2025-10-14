'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
  user: {
    full_name: string | null;
    avatar_url: string | null; 
    email: string | null; 
  };
  key?: string;
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  return (
    <Link href="/dashboard/account">
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
    </Link>
  )
}

