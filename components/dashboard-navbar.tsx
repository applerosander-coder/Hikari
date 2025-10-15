'use client';

import { useState } from 'react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
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
      <Link href="/" className="flex items-center" prefetch={false}>
        <Image 
          src="/bidwin-logo-v3.png" 
          alt="BIDWIN" 
          width={100} 
          height={50}
          className="h-10 w-auto"
          priority
        />
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
