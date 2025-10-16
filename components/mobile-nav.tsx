'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MainNavItem } from 'types';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SharedMobileMenu } from '@/components/shared-mobile-menu';
import { useTheme } from 'next-themes';

interface MobileNavProps {
  items: MainNavItem[];
  children?: React.ReactNode;
  user?: any;
  userDetails?: {
    avatar_url: string | null;
    full_name: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ 
  items, 
  children, 
  user, 
  userDetails, 
  open, 
  onOpenChange 
}: MobileNavProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
        <SharedMobileMenu 
          user={user} 
          userDetails={userDetails} 
          onClose={() => onOpenChange(false)} 
        />
        {children}
      </SheetContent>
    </Sheet>
  );
}
