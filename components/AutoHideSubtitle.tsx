'use client';

import { useState, useEffect, type ReactNode } from 'react';

interface AutoHideSubtitleProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function AutoHideSubtitle({ 
  children, 
  delay = 3000,
  className = '' 
}: AutoHideSubtitleProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, delay);

    const unmountTimer = setTimeout(() => {
      setShouldRender(false);
    }, delay + 300); // Wait for transition to complete (300ms)

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(unmountTimer);
    };
  }, [delay]);

  if (!shouldRender) return null;

  return (
    <div
      className={`
        overflow-hidden transition-opacity transition-all duration-300 ease-in-out
        ${isVisible ? 'max-h-10 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}
        ${className}
      `}
    >
      <p className="text-muted-foreground">
        {children}
      </p>
    </div>
  );
}
