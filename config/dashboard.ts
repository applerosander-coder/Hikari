import {
  LineChart,
  Package,
  Package2,
  Settings,
  ShoppingCart,
  Users2,
  Inbox,
  FileText,
  Heart,
  Gavel,
  Store
} from 'lucide-react';

export interface NavItem {
  href: string;
  icon: keyof typeof iconComponents;
  label: string;
  disabled?: boolean;
}

export const iconComponents = {
  Inbox,
  ShoppingCart,
  FileText,
  Package,
  Users2,
  LineChart,
  Heart,
  Gavel,
  Store
};

export const navConfig = [
  { href: '/dashboard', icon: 'Gavel', label: 'Auctions' },
  { href: '/mybids', icon: 'Heart', label: 'My Bids' },
  {
    href: '/dashboard/leaderboard',
    icon: 'LineChart',
    label: 'Leaderboard'
  },
  { href: '/seller', icon: 'Store', label: 'Seller' }
];
