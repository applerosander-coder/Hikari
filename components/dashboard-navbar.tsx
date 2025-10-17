'use client';

import { useState } from 'react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { SharedMobileMenu } from '@/components/shared-mobile-menu';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { LOGO_CONFIG } from '@/config/logo';

import { NavItem } from '@/config/dashboard';

export function Navbar({
  user,
  userDetails,
  navConfig
}: {
  user: any;
  userDetails: any;
  navConfig: NavItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Auctions';
    if (pathname === '/mybids') return 'My Bids';
    if (pathname === '/dashboard/leaderboard') return 'Leaderboard';
    if (pathname === '/seller') return 'Seller Dashboard';
    if (pathname === '/dashboard/settings') return 'Settings';
    if (pathname === '/pricing') return 'Pricing';
    if (pathname === '/how-it-works') return 'How it Works';
    return null;
  };

  const pageTitle = getPageTitle();

  // Pages where logo should be centered (no page title shown)
  const centerLogoPages = ['/pricing', '/how-it-works'];
  const shouldCenterLogo = centerLogoPages.includes(pathname);

  return (
    <header className="flex h-20 items-center border-b bg-background px-3 sm:hidden fixed top-0 left-0 right-0 z-20 safe-top">
      {/* Logo - centered for pricing/how-it-works, left-aligned otherwise */}
      {shouldCenterLogo ? (
        <>
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="flex items-center" prefetch={false}>
              <Image 
                src={resolvedTheme === 'dark' ? '/bidwin-logo-dark.png' : '/bidwin-logo-light.png'}
                alt="BIDWIN" 
                width={LOGO_CONFIG.width} 
                height={LOGO_CONFIG.height}
                className={LOGO_CONFIG.className}
                priority
              />
            </Link>
          </div>
          <div className="ml-auto">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs">
                <SharedMobileMenu 
                  user={user} 
                  userDetails={userDetails} 
                  onClose={() => setIsOpen(false)} 
                />
              </SheetContent>
            </Sheet>
          </div>
        </>
      ) : (
        <>
          <Link href="/" className="flex items-center" prefetch={false}>
            <Image 
              src={resolvedTheme === 'dark' ? '/bidwin-logo-dark.png' : '/bidwin-logo-light.png'}
              alt="BIDWIN" 
              width={LOGO_CONFIG.width} 
              height={LOGO_CONFIG.height}
              className={LOGO_CONFIG.className}
              priority
            />
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
                user={user} 
                userDetails={userDetails} 
                onClose={() => setIsOpen(false)} 
              />
            </SheetContent>
          </Sheet>
        </>
      )}
    </header>
  );
}
