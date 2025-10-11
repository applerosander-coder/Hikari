'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';

export function SidebarSignOutButton() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleSignOut}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Sign Out</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">Sign Out</TooltipContent>
    </Tooltip>
  );
}
