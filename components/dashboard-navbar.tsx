'use client';

import { useState } from 'react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Menu, Gavel } from 'lucide-react';
import { SharedMobileMenu } from '@/components/shared-mobile-menu';

import { NavItem } from '@/config/dashboard';

export function Navbar({
  userDetails,
  navConfig
}: {
  userDetails: any;
  navConfig: NavItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="flex h-20 items-center gap-4 border-b bg-background px-4 sm:hidden fixed top-0 left-0 right-0 z-20">
      <Link href="/" className="flex items-center space-x-2" prefetch={false}>
        <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-full">
          <Gavel className="size-6 transition-transform duration-300 ease-in-out hover:scale-110" />
        </div>
        <span className="text-lg md:text-xl font-extrabold tracking-tightest">Auctions</span>
      </Link>

      <div className="ml-auto" />

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
