'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true);
    };

    const handleComplete = () => {
      setTimeout(() => {
        setIsNavigating(false);
      }, 200);
    };

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement;
      if (!target) return;
      
      // Skip if modifier keys are pressed (opening in new tab/window)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      
      // Skip if target="_blank" (opens in new tab)
      if (target.getAttribute('target') === '_blank') return;
      
      const href = target.getAttribute('href');
      if (!href) return;
      
      // Try to parse as URL to detect non-routing links
      try {
        const url = new URL(href, window.location.href);
        
        // Skip non-HTTP(S) protocols (mailto:, tel:, etc.)
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
        
        // Skip different origin (external links)
        if (url.origin !== window.location.origin) return;
        
        // Check if pathname, search, or hash changed
        const currentUrl = new URL(window.location.href);
        const pathnameChanged = url.pathname !== currentUrl.pathname;
        const searchChanged = url.search !== currentUrl.search;
        const hashChanged = url.hash !== currentUrl.hash;
        
        // Skip ONLY if nothing changed at all
        if (!pathnameChanged && !searchChanged && !hashChanged) return;
        
        // Skip if ONLY hash changed (same pathname + search, different hash)
        if (!pathnameChanged && !searchChanged && hashChanged) return;
        
      } catch {
        // If URL parsing fails, it's likely a relative path
        // Check if it's a hash-only link
        if (href.startsWith('#')) return;
        
        // Check if it's the same path (for relative paths)
        const hrefPath = href.split('?')[0].split('#')[0];
        const currentPath = window.location.pathname;
        if (hrefPath === currentPath || hrefPath === '') {
          // If path is same, check if query or hash might be different
          if (!href.includes('?') && !href.includes('#')) return;
        }
      }
      
      handleStart();
    };

    const handleMutation = () => {
      const anchors = document.querySelectorAll('a[href]');
      anchors.forEach((anchor) => {
        anchor.removeEventListener('click', handleAnchorClick as EventListener);
        anchor.addEventListener('click', handleAnchorClick as EventListener);
      });
    };

    const mutationObserver = new MutationObserver(handleMutation);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    handleMutation();
    handleComplete();

    return () => {
      mutationObserver.disconnect();
      const anchors = document.querySelectorAll('a[href]');
      anchors.forEach((anchor) => {
        anchor.removeEventListener('click', handleAnchorClick as EventListener);
      });
    };
  }, [pathname, searchParams]);

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <p className="text-white text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
}
