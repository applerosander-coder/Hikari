'use client';

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
import Image from 'next/image';
import { Package2, Settings, Menu, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

import { NavItem, iconComponents } from '@/config/dashboard';

export function Navbar({
  userDetails,
  navConfig
}: {
  userDetails: any;
  navConfig: NavItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();

  const handleSignOut = async () => {
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const currentTheme = resolvedTheme || theme;
  const logoSrc = currentTheme === 'dark' ? '/logos/bidwin-white.png' : '/logos/bidwin-black.png';

  return (
    <header className="sticky top-0 z-30 flex h-32 md:h-36 items-center gap-4 border-b bg-background px-4 sm:static sm:h-32 md:h-36 sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              prefetch={false}
            >
              <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Acme Inc</span>
            </Link>
            {navConfig.map(
              (
                item: {
                  icon: keyof typeof iconComponents;
                  href: string;
                  label: string;
                },
                index: number
              ) => {
                const IconComponent = iconComponents[item.icon];
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center gap-4 px-2.5 ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    prefetch={false}
                  >
                    <IconComponent className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              }
            )}
            <Link
              href="#"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              prefetch={false}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      
      <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center max-w-[60%] sm:max-w-md" prefetch={false}>
        <Image
          src={logoSrc}
          alt="BidWin"
          width={600}
          height={160}
          className="w-full h-auto max-h-28 md:max-h-32"
          priority
        />
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
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign Out</span>
      </Button>
      <UserAccountNav user={userDetails} />
    </header>
  );
}
