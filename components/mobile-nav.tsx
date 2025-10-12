'use client';

import * as React from 'react';
import Link from 'next/link';
import { MainNavItem } from 'types';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Gavel } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SharedMobileMenu } from '@/components/shared-mobile-menu';

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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2 text-left">
            <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-full">
              <Gavel className="size-5" />
            </div>
            <span className="text-xl font-extrabold">Auctions</span>
          </SheetTitle>
        </SheetHeader>
        
        <SharedMobileMenu 
          user={user} 
          userDetails={userDetails} 
          onClose={() => onOpenChange(false)} 
        />

        {!user && (
          <div className="mt-6 flex justify-center">
            <Link
              href="/signin"
              onClick={() => onOpenChange(false)}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'rounded-full px-6'
              )}
            >
              Login
            </Link>
          </div>
        )}

        {children}
      </SheetContent>
    </Sheet>
  );
}
