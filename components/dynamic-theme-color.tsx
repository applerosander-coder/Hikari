'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export function DynamicThemeColor() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Update theme-color meta tag when theme changes
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#000000' : '#ffffff');
    }
  }, [resolvedTheme]);

  return null;
}
