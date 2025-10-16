'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Bell, MessageCircle, Users } from 'lucide-react';
import { SharedMobileMenu } from '@/components/shared-mobile-menu';
import { NotificationsDropdown } from '@/components/notifications-dropdown';
import { MessagesDropdown } from '@/components/messages-dropdown';
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
    <header className="flex h-14 items-center gap-2 border-b bg-background px-3 sm:hidden fixed top-0 left-0 right-0 z-20 safe-top">
      {/* Left: Hamburger Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost">
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

      {/* Center: Page Title */}
      {pageTitle && (
        <h1 className="flex-1 text-center text-lg font-bold">{pageTitle}</h1>
      )}

      {!pageTitle && <div className="flex-1" />}

      {/* Right: Social Icons (Messages, Notifications, Connections) */}
      <div className="flex items-center gap-1">
        <MessagesDropdown userId={userDetails?.id} />
        <NotificationsDropdown userId={userDetails?.id} />
        <Link href="/connections">
          <Button size="icon" variant="ghost" className="relative">
            <Users className="h-5 w-5" />
            <span className="sr-only">Connections</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
