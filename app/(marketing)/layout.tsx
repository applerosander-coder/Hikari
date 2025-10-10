import { marketingConfig } from '@/config/marketing';
import FooterPrimary from '@/components/footer-primary';
import CircularNavigation from '@/components/navigation';
import React from 'react';

import { getUser, getUserDetails } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children
}: MarketingLayoutProps) {
  const supabase = createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase)
  ]);

  return (
    <div className="flex min-h-screen flex-col items-center w-full overflow-x-hidden">
      <CircularNavigation items={marketingConfig.mainNav} user={user} userDetails={userDetails} />
      <main className="flex-1 w-full overflow-x-hidden">{children}</main>
      <FooterPrimary />
    </div>
  );
}
