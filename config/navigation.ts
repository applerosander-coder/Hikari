import {
  Gavel,
  Heart,
  Store,
  DollarSign,
  HelpCircle,
  Settings
} from 'lucide-react';

export interface MobileNavItem {
  href: string;
  icon: typeof Gavel;
  label: string;
  disabled?: boolean;
}

export const mobileNavItems: MobileNavItem[] = [
  { href: '/dashboard', icon: Gavel, label: 'Auctions' },
  { href: '/mybids', icon: Heart, label: 'My Bids' },
  { href: '/seller', icon: Store, label: 'Seller' },
  { href: '/pricing', icon: DollarSign, label: 'Pricing' },
  { href: '/how-it-works', icon: HelpCircle, label: 'How it Works' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' }
];
