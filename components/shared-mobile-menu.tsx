'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sun, Moon, LogOut } from 'lucide-react';
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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
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
        <div className="flex items-center gap-3 px-2.5 pb-4 border-b border-border">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userDetails?.avatar_url || ''} alt={userDetails?.full_name || 'User'} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{userDetails?.full_name || 'User'}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </div>
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
        <span className="relative size-5 inline-flex items-center justify-center shrink-0">
          <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </span>
        <span>
          {!mounted ? 'Theme' : theme === 'system' ? 'System Theme' : theme === 'light' ? 'Light Mode' : 'Dark Mode'}
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
