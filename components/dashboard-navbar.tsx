'use client';

import { useState } from 'react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';
import { UserAccountNav } from '@/components/user-account-nav';
import Link from 'next/link';
import { Menu, Gavel } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SharedMobileMenu } from '@/components/shared-mobile-menu';

import { NavItem } from '@/config/dashboard';

export function Navbar({
  userDetails,
  navConfig
}: {
  userDetails: any;
  navConfig: NavItem[];
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="flex h-20 items-center gap-4 border-b bg-background px-4 sm:h-20 sm:border-0 sm:bg-transparent sm:px-6">
      <Link href="/" className="flex items-center space-x-2" prefetch={false}>
        <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-full">
          <Gavel className="size-6 transition-transform duration-300 ease-in-out hover:scale-110" />
        </div>
        <span className="text-lg md:text-xl font-extrabold tracking-tightest">Auctions</span>
      </Link>

      <Breadcrumb className="hidden md:flex invisible">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard" prefetch={false}>
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathname
            .split('/')
            .filter(Boolean)
            .slice(1)
            .map((segment, index) => (
              <BreadcrumbItem key={index}>
                <BreadcrumbSeparator />
                <BreadcrumbLink asChild>
                  <Link
                    href={`/${pathname
                      .split('/')
                      .slice(0, index + 2)
                      .join('/')}`}
                    prefetch={false}
                  >
                    {segment.charAt(0).toUpperCase() + segment.slice(1)}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            ))}
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="ml-auto" />
      
      <div className="hidden sm:flex">
        <UserAccountNav user={userDetails} />
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
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
