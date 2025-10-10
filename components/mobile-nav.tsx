'use client';

import * as React from 'react';
import Link from 'next/link';
import { MainNavItem } from 'types';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { SunIcon } from '@heroicons/react/24/solid';
import { UserAccountNav } from '@/components/user-account-nav';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

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
            <div className="bg-slate-50 dark:bg-slate-900 p-1 rounded-full">
              <SunIcon className="size-6" />
            </div>
            <span className="text-xl font-extrabold">BidWin</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 flex flex-col space-y-4">
          {/* Navigation Links */}
          <nav className="flex flex-col space-y-3">
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.disabled ? '#' : item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'text-base font-medium transition-colors hover:text-foreground/80 py-2 px-3 rounded-md hover:bg-muted',
                  item.disabled && 'cursor-not-allowed opacity-60'
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="border-t border-border my-4" />

          {/* Bottom Section: Theme Toggle & User */}
          <div className="flex items-center justify-between">
            <ModeToggle />
            {user && userDetails ? (
              <UserAccountNav user={{
                ...userDetails,
                email: user.email || null
              }} />
            ) : (
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
            )}
          </div>

          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
