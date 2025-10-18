'use client';

import { useTheme } from 'next-themes';
import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export function ModeToggle() {
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

  if (!mounted) {
    return (
      <Button className="size-8 px-0" size="sm" variant="ghost" onClick={toggleTheme}>
        <Icons.sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button className="size-8 px-0" size="sm" variant="ghost" onClick={toggleTheme}>
      {theme === 'royal-gold' ? (
        <span className="text-base">👑</span>
      ) : theme === 'dark' ? (
        <Icons.moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Icons.sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
