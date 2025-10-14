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
  Gavel
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
  Gavel
};

export const navConfig = [
  { href: '/dashboard', icon: 'Gavel', label: 'Auctions' },
  { href: '/mybids', icon: 'Heart', label: 'My Bids' },
  { href: '/seller', icon: 'Users2', label: 'Seller' },
  {
    href: '/dashboard/leaderboard',
    icon: 'LineChart',
    label: 'Leaderboard'
  }
];
