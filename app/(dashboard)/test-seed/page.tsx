'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TestSeedPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/seed-test-data', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Test data created successfully!', {
          description: `Created ${data.summary.auction1.itemCount + data.summary.auction2.itemCount} items across 2 auctions`,
        });
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        toast.error('Failed to seed data', {
          description: data.error || 'Unknown error',
        });
      }
    } catch (error) {
      console.error('Seed error:', error);
      toast.error('Failed to seed data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Test Data Seeding</h1>
          <p className="text-gray-600">
            This will clear all existing auctions, items, and bids, then create fresh test data.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Warning</h3>
          <p className="text-sm text-yellow-800">
            This action will permanently delete all current auction data and replace it with test auctions.
          </p>
        </div>

        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">What will be created:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <strong>Auction 1:</strong> Spring Estate Sale 2025 (4 items)
              <ul className="list-circle list-inside ml-6 mt-1 text-sm">
                <li>Vintage Rolex Watch - $5,000</li>
                <li>Antique Persian Rug - $3,000</li>
                <li>Victorian Oil Painting - $1,500</li>
                <li>Antique Mahogany Desk - $2,000</li>
              </ul>
            </li>
            <li>
              <strong>Auction 2:</strong> Vintage Electronics Auction (5 items)
              <ul className="list-circle list-inside ml-6 mt-1 text-sm">
                <li>Original Apple Macintosh 128K - $2,500</li>
                <li>Sony Walkman TPS-L2 - $800</li>
                <li>Atari 2600 Console - $500</li>
                <li>Vintage Polaroid SX-70 - $400</li>
                <li>Nintendo Game Boy (1989) - $300</li>
              </ul>
            </li>
          </ul>
        </div>

        <Button
          onClick={handleSeedData}
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? 'Creating Test Data...' : 'Clear & Create Test Auctions'}
        </Button>
      </div>
    </div>
  );
}
