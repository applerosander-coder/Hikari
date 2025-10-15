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
          <SheetTitle className="flex items-center text-left">
            <div className="bg-gradient-to-br from-gray-800 to-gray-600 p-2 rounded-lg">
              <Image 
                src="/bidwin-logo-v4.png" 
                alt="BIDWIN" 
                width={100} 
                height={50}
                className="h-8 w-auto"
              />
            </div>
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
