import Link from 'next/link';
import { NavItem, navConfig, iconComponents } from '@/config/dashboard';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';
import { createClient } from '@/utils/supabase/server';
import {
  getUser,
  getUserDetails,
} from '@/utils/supabase/queries';
import { Settings, User, LogOut, Sun, Moon } from 'lucide-react';
import { Navbar } from '@/components/dashboard-navbar';
import Sidebar from '@/components/dashboard-sidebar';
import { redirect } from 'next/navigation';
import { SidebarSignOutButton } from '@/components/sidebar-signout-button';
import { SidebarThemeToggle } from '@/components/sidebar-theme-toggle';
import { NotificationProvider } from '@/components/notification-provider';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children
}: DashboardLayoutProps) {
  const supabase = createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
  ]);

  if (!user) {
    return redirect('/signin');
  }

  // In case you want to get the current pathname in Server.
  // This corresponds to a middleware setting, copy the middleware in root when you use this.

  // const headersList = headers()
  // const pathname = headersList.get('x-current-path') || ''

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <NotificationProvider />
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <Sidebar navConfig={navConfig as NavItem[]} />
        <nav className="mt-auto flex flex-col items-center gap-2 px-2 sm:py-5">
          <TooltipProvider>
            <SidebarThemeToggle />
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/account"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                  prefetch={false}
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Profile</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                  prefetch={false}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
            <SidebarSignOutButton />
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Navbar userDetails={userDetails} navConfig={navConfig as NavItem[]} />
        <main className="flex-1 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
