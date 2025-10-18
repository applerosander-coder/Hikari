'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import * as React from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';

export function SidebarThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('royal-gold');
    } else {
      setTheme('light');
    }
  };

  const getTooltipText = () => {
    if (theme === 'light') return 'Switch to Dark Mode';
    if (theme === 'dark') return 'Switch to Royal Gold';
    return 'Switch to Light Mode';
  };

  if (!mounted) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Sun className="h-5 w-5" />
            <span className="sr-only">Toggle theme</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          Switch theme
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
        >
          {theme === 'royal-gold' ? (
            <span className="text-lg">👑</span>
          ) : theme === 'dark' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {getTooltipText()}
      </TooltipContent>
    </Tooltip>
  );
}
