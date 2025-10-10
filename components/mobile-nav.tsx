// components/mobile-nav.tsx

'use client';

import * as React from 'react';
import Link from 'next/link';
import { MainNavItem } from 'types';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Button, buttonVariants } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { SunIcon } from '@heroicons/react/24/solid';
import { UserAccountNav } from '@/components/user-account-nav';

interface MobileNavProps {
  items: MainNavItem[];
  children?: React.ReactNode;
  user?: any;
  userDetails?: {
    avatar_url: string | null;
    full_name: string | null;
  } | null;
}

export function MobileNav({ items, children, user, userDetails }: MobileNavProps) {
  return (
    <>
      <div className={cn(
        'fixed inset-0 z-[999] bg-black/25 backdrop-blur-sm md:hidden'
      )} />
      <div
        className={cn(
          'fixed inset-0 top-16 z-[1000] h-[calc(100vh-4rem)] pointer-events-auto md:hidden'
        )}
      >
        <div className="container h-full overflow-auto py-6">
          <div className="relative grid gap-6 rounded-lg border-2 border-border bg-card/95 backdrop-blur p-6 shadow-2xl">
            <Link href="/" className="flex items-center space-x-2 pb-4 border-b border-border">
              <SunIcon className="size-6" />
              <span className="text-xl font-bold">BidWin</span>
            </Link>
            <nav className="grid grid-flow-row auto-rows-max text-base gap-2">
              {items.map((item, index) => (
                <Link
                  key={index}
                  href={item.disabled ? '#' : item.href}
                  className={cn(
                    'flex w-full items-center rounded-md p-3 text-base font-medium hover:bg-muted transition-colors',
                    item.disabled && 'cursor-not-allowed opacity-60'
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
              <ModeToggle />
              {user && userDetails ? (
                <UserAccountNav user={{
                  ...userDetails,
                  email: user.email || null
                }} />
              ) : (
                <Link
                  href="/signin"
                  className={cn(
                    buttonVariants({ variant: 'default', size: 'default' }),
                    'px-6 rounded-full'
                  )}
                >
                  Login
                </Link>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
