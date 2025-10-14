'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createTestData } from '@/app/actions/create-test-data';
import { processWinners } from '@/app/actions/process-winners';
import { toast } from 'sonner';
import { Database, DollarSign } from 'lucide-react';

export function DevTools() {
  const [loadingTest, setLoadingTest] = useState(false);
  const [loadingWinners, setLoadingWinners] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleCreateTestData = async () => {
    setLoadingTest(true);
    const result = await createTestData();
    setLoadingTest(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || 'Test data created!');
      window.location.reload();
    }
  };

  const handleProcessWinners = async () => {
    setLoadingWinners(true);
    const result = await processWinners();
    setLoadingWinners(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || 'Winners processed!');
      
      // Show details if available
      if (result.details && result.details.length > 0) {
        console.log('Winner processing details:', result.details);
      }
      
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <Button
        onClick={handleCreateTestData}
        disabled={loadingTest || loadingWinners}
        className="gap-2"
        variant="outline"
      >
        <Database className="h-4 w-4" />
        {loadingTest ? 'Creating...' : 'Create Test Data'}
      </Button>
      
      <Button
        onClick={handleProcessWinners}
        disabled={loadingTest || loadingWinners}
        className="gap-2"
        variant="outline"
      >
        <DollarSign className="h-4 w-4" />
        {loadingWinners ? 'Processing...' : 'Process Winners'}
      </Button>
    </div>
  );
}
