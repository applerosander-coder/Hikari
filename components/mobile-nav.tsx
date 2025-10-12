'use client';

import * as React from 'react';
import Link from 'next/link';
import { MainNavItem } from 'types';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Gavel, Sun, Moon } from 'lucide-react';
import { UserAccountNav } from '@/components/user-account-nav';
import { useTheme } from 'next-themes';
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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

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
            <button
              type="button"
              onClick={toggleTheme}
              className="relative size-8 px-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </button>
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
