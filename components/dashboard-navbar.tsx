'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { SharedMobileMenu } from '@/components/shared-mobile-menu';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

import { NavItem } from '@/config/dashboard';

export function Navbar({
  userDetails,
  navConfig
}: {
  userDetails: any;
  navConfig: NavItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Auctions';
    if (pathname === '/mybids') return 'My Bids';
    if (pathname === '/dashboard/leaderboard') return 'Leaderboard';
    if (pathname === '/seller') return 'Seller Dashboard';
    return null;
  };

  const pageTitle = getPageTitle();

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background px-3 sm:hidden fixed top-0 left-0 right-0 z-50 pt-safe-top">
      <Link href="/" className="flex items-center" prefetch={false}>
        {mounted && (
          <Image 
            src={resolvedTheme === 'dark' ? '/bidwin-logo-dark.png' : '/bidwin-logo-light.png'}
            alt="BIDWIN" 
            width={90} 
            height={45}
            className="h-8 w-auto"
            priority
          />
        )}
      </Link>

      {pageTitle && (
        <h1 className="flex-1 text-center text-lg font-bold">{pageTitle}</h1>
      )}

      {!pageTitle && <div className="ml-auto" />}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <SharedMobileMenu 
            user={userDetails} 
            userDetails={userDetails} 
            onClose={() => setIsOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </header>
  );
}
