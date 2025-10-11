interface Plan {
  name: string;
  description: string;
  features: string[];
  monthlyPrice: number;
  yearlyPrice: number;
}

const pricingPlans: Plan[] = [
  {
    name: 'Participant Plan',
    description: 'Perfect for users who just want to bid and buy',
    features: [
      'Join any auction',
      'Bid, win, and track your items',
      'No credit card required'
    ],
    monthlyPrice: 0,
    yearlyPrice: 0
  },
  {
    name: 'Host Plan',
    description: 'Perfect for individuals or small creators who want to host their own events',
    features: [
      'Create and manage your own auctions',
      'Up to 10 active listings',
      'Integrated payments & messaging',
      'Basic analytics dashboard'
    ],
    monthlyPrice: 1999,
    yearlyPrice: 19990
  },
  {
    name: 'Business Plan',
    description: 'Perfect for companies and organizations running multiple events or branded marketplaces',
    features: [
      'Unlimited auctions and listings',
      'Multi-user team access',
      'Advanced reporting & custom branding',
      'Priority support'
    ],
    monthlyPrice: 9999,
    yearlyPrice: 99990
  }
];

export default pricingPlans;

import { Tables } from '@/types/db';

type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}

export const dummyPricing: ProductWithPrices[] = [
  {
    id: 'dummy-participant',
    name: 'Participant Plan',
    description: 'Perfect for users who just want to bid and buy',
    prices: [
      {
        id: 'dummy-participant-price-month',
        currency: 'USD',
        unit_amount: 0,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-participant',
        description: null,
        metadata: null
      },
      {
        id: 'dummy-participant-price-year',
        currency: 'USD',
        unit_amount: 0,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-participant',
        description: null,
        metadata: null
      }
    ],
    image: null,
    metadata: null,
    active: null
  },
  {
    id: 'dummy-host',
    name: 'Host Plan',
    description: 'Perfect for individuals or small creators who want to host their own events',
    prices: [
      {
        id: 'dummy-host-price-month',
        currency: 'USD',
        unit_amount: 1999,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-host',
        description: null,
        metadata: null
      },
      {
        id: 'dummy-host-price-year',
        currency: 'USD',
        unit_amount: 19990,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-host',
        description: null,
        metadata: null
      }
    ],
    image: null,
    metadata: null,
    active: null
  },
  {
    id: 'dummy-business',
    name: 'Business Plan',
    description: 'Perfect for companies and organizations running multiple events or branded marketplaces',
    prices: [
      {
        id: 'dummy-business-price-month',
        currency: 'USD',
        unit_amount: 9999,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-business',
        description: null,
        metadata: null
      },
      {
        id: 'dummy-business-price-year',
        currency: 'USD',
        unit_amount: 99990,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-business',
        description: null,
        metadata: null
      }
    ],
    image: null,
    metadata: null,
    active: null
  }
];
