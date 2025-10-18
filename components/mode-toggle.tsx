'use client';

import { useTheme } from 'next-themes';
import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('gold');
    } else {
      setTheme('light');
    }
  };

  return (
    <Button className="size-8 px-0" size="sm" variant="ghost" onClick={toggleTheme}>
      <Icons.sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 gold:-rotate-180 gold:scale-0" />
      <Icons.moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 gold:-rotate-90 gold:scale-0" />
      <span className="absolute text-base scale-0 transition-all gold:scale-100">👑</span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
