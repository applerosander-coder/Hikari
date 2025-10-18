'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';

export function SidebarThemeToggle() {
  const { theme, setTheme } = useTheme();

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

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 royal-gold:-rotate-90 royal-gold:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 royal-gold:rotate-90 royal-gold:scale-0" />
          <span className="absolute rotate-90 scale-0 transition-all royal-gold:rotate-0 royal-gold:scale-100 text-lg">👑</span>
          <span className="sr-only">Toggle theme</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {getTooltipText()}
      </TooltipContent>
    </Tooltip>
  );
}
