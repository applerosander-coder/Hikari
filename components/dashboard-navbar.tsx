'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { SharedMobileMenu } from '@/components/shared-mobile-menu';
import { useTheme } from 'next-themes';

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

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background px-3 sm:hidden fixed top-0 left-0 right-0 z-20 safe-top">
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
