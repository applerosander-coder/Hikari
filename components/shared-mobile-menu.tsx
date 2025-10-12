'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sun, Moon, Waves, LogOut } from 'lucide-react';
import { mobileNavItems } from '@/config/navigation';

interface SharedMobileMenuProps {
  user?: any;
  userDetails?: {
    avatar_url: string | null;
    full_name: string | null;
  } | null;
  onClose: () => void;
}

export function SharedMobileMenu({ user, userDetails, onClose }: SharedMobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('ocean');
    } else {
      setTheme('light');
    }
  };

  const handleSignOut = async () => {
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push('/signin');
  };

  const getUserInitials = () => {
    if (userDetails?.full_name) {
      return userDetails.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="grid gap-6 text-lg font-medium mt-6">
      {/* Avatar at Top */}
      {user && (
        <Link 
          href="/dashboard/account"
          onClick={onClose}
          className="flex items-center gap-3 px-2.5 pb-4 border-b border-border hover:bg-accent/50 transition-colors rounded-md cursor-pointer"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={userDetails?.avatar_url || ''} alt={userDetails?.full_name || 'User'} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{userDetails?.full_name || 'User'}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </Link>
      )}

      {/* Navigation Items */}
      {mobileNavItems.map((item, index) => {
        const IconComponent = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={index}
            href={item.disabled ? '#' : item.href}
            onClick={() => !item.disabled && onClose()}
            className={`flex items-center gap-4 px-2.5 transition-colors ${
              isActive 
                ? 'text-foreground' 
                : item.disabled 
                  ? 'text-muted-foreground/50 cursor-not-allowed' 
                  : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <IconComponent className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground transition-colors w-full text-left"
      >
        <span className="relative size-5 inline-flex items-center justify-center shrink-0" key={resolvedTheme ?? theme}>
          {mounted && (resolvedTheme ?? theme) === 'light' && <Sun className="h-5 w-5" />}
          {mounted && (resolvedTheme ?? theme) === 'dark' && <Moon className="h-5 w-5" />}
          {mounted && (resolvedTheme ?? theme) === 'ocean' && <Waves className="h-5 w-5" />}
          {!mounted && <Sun className="h-5 w-5" />}
        </span>
        <span>
          {!mounted ? 'Theme' : (resolvedTheme ?? theme) === 'light' ? 'Light Mode' : (resolvedTheme ?? theme) === 'dark' ? 'Dark Mode' : 'Ocean Mode'}
        </span>
      </button>

      {/* Sign Out (only if user is logged in) */}
      {user && (
        <button
          onClick={handleSignOut}
          className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      )}
    </nav>
  );
}
