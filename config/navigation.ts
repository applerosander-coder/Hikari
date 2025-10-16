import {
  Gavel,
  Heart,
  LineChart,
  Store,
  DollarSign,
  HelpCircle,
  Settings,
  MessageCircle,
  Bell,
  Users
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
  { href: '/dashboard/leaderboard', icon: LineChart, label: 'Leaderboard' },
  { href: '/seller', icon: Store, label: 'Seller' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/connections', icon: Users, label: 'Connections' },
  { href: '/pricing', icon: DollarSign, label: 'Pricing' },
  { href: '/how-it-works', icon: HelpCircle, label: 'How it Works' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' }
];
