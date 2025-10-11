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
  LayoutDashboard
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
  LayoutDashboard
};

export const navConfig = [
  { href: '/dashboard', icon: 'LayoutDashboard', label: 'Auctions' },
  { href: '/mybids', icon: 'Heart', label: 'My Bids' },
  // { href: '/dashboard/posts', icon: 'FileText', label: 'Posts' },
  {
    href: '/dashboard/customer',
    icon: 'Users2',
    label: 'Customers',
    disabled: true
  },
  {
    href: '/dashboard/analytics',
    icon: 'LineChart',
    label: 'Analytics',
    disabled: true
  }
];
