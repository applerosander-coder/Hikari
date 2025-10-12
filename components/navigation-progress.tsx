'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ 
      showSpinner: false,
      trickleSpeed: 100,
      minimum: 0.2,
      easing: 'ease',
      speed: 500
    });
  }, []);

  useEffect(() => {
    NProgress.done();
    
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement;
      const href = target.href;
      const currentUrl = window.location.href;
      
      if (href !== currentUrl && !href.includes('#')) {
        NProgress.start();
      }
    };

    const handleMutation = () => {
      const anchors = document.querySelectorAll('a[href]');
      anchors.forEach((anchor) => {
        anchor.addEventListener('click', handleAnchorClick as EventListener);
      });
    };

    const mutationObserver = new MutationObserver(handleMutation);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    handleMutation();

    return () => {
      mutationObserver.disconnect();
      const anchors = document.querySelectorAll('a[href]');
      anchors.forEach((anchor) => {
        anchor.removeEventListener('click', handleAnchorClick as EventListener);
      });
    };
  }, [pathname, searchParams]);

  return null;
}
