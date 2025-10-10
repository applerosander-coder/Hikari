'use client';

import { createClient } from '@/utils/supabase/client';
import { type Provider } from '@supabase/supabase-js';
import { getURL } from '@/utils/helpers';

export async function handleRequest(
  e: React.FormEvent<HTMLFormElement>,
  requestFunc: (formData: FormData) => Promise<string>
): Promise<void> {
  // Prevent default form submission refresh
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const redirectUrl: string = await requestFunc(formData);

  // Always use window.location for auth redirects to ensure server components refresh
  // This guarantees the user state is updated in the marketing layout
  window.location.href = redirectUrl;
}

export async function signInWithOAuth(e: React.FormEvent<HTMLFormElement>) {
  // Prevent default form submission refresh
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const provider = String(formData.get('provider')).trim() as Provider;

  // Create client-side supabase client and call signInWithOAuth
  const supabase = createClient();
  const redirectURL = getURL('/auth/callback');
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: redirectURL,
      skipBrowserRedirect: true
    }
  });

  if (error) {
    console.error('OAuth error:', error);
    return;
  }

  if (data?.url) {
    // Check if we're in an iframe
    const inIframe = window.self !== window.top;
    
    if (inIframe) {
      // In Replit's cross-origin iframe, we can't navigate top window
      // Open OAuth in a popup window instead
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        data.url,
        'BidWin OAuth',
        `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
      );
      
      if (!popup) {
        alert('Please allow popups for OAuth authentication to work.');
      }
    } else {
      // Not in iframe, redirect normally
      window.location.href = data.url;
    }
  }
}
