'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MainNavItem } from 'types';
import { cn } from '@/lib/utils';
import { MobileNav } from '@/components/mobile-nav';
import { Icons } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { User } from '@supabase/supabase-js';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { UserAccountNav } from '@/components/user-account-nav';
import { useTheme } from 'next-themes';

interface CircularNavProps {
  items?: MainNavItem[];
  children?: React.ReactNode;
  user?: User | null;
  userDetails?: {
    avatar_url: string | null;
    full_name: string | null;
  } | null;
}

export default function CircularNavigation({
  items,
  children,
  user,
  userDetails
}: CircularNavProps) {
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false);
  const [hasShownWelcome, setHasShownWelcome] = React.useState(false);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && !hasShownWelcome) {
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there';
      toast.success(`Welcome ${userName}!`, {
        duration: 3000,
      });
      setHasShownWelcome(true);
    }
  }, [user, hasShownWelcome]);

  return (
    <>
      <nav className="flex flex-wrap items-center justify-between w-full md:w-fit p-1.5 md:p-0.5 gap-3 md:gap-20 md:bg-zinc-50 md:dark:bg-zinc-900 md:rounded-full md:px-6 md:border-2 md:border-muted/30 md:dark:border-muted/80 md:shadow-md mx-auto mt-1 backdrop-blur-sm md:backdrop-blur-none safe-top">
        <Link href="/" className="flex items-center">
          {mounted && (
            <Image 
              src={resolvedTheme === 'dark' ? '/bidwin-logo-dark.png' : '/bidwin-logo-light.png'}
              alt="BIDWIN" 
              width={120} 
              height={60}
              className="h-9 w-auto transition-transform duration-300 ease-in-out hover:scale-105"
              priority
            />
          )}
        </Link>
        {items?.length ? (
          <div className="hidden md:flex space-x-6">
            {items?.map((item, index) => (
              <Link
                key={index}
                href={item.disabled ? '#' : item.href}
                className={cn(
                  'text-primary transition-colors hover:text-foreground/80',
                  item.disabled && 'cursor-not-allowed opacity-80'
                )}
              >
                {item.title}
              </Link>
            ))}
          </div>
        ) : null}
        <div className="flex items-center space-x-2">
          <div className="hidden md:block">
            <ModeToggle />
          </div>
          {user && userDetails ? (
            <div className="hidden md:block">
              <UserAccountNav user={{
                ...userDetails,
                email: user.email || null
              }} />
            </div>
          ) : !user ? (
            <Link
              href="/signin"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'rounded-full p-2 md:p-5 text-xs md:text-sm hidden md:inline-flex'
              )}
            >
              Login
            </Link>
          ) : null}
          <button
            className="md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <Icons.close /> : <Icons.Menu />}
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </nav>
      
      {/* Mobile Navigation Sheet */}
      <MobileNav 
        items={items || []} 
        user={user} 
        userDetails={userDetails}
        open={showMobileMenu}
        onOpenChange={setShowMobileMenu}
      >
        {children}
      </MobileNav>
    </>
  );
}
