'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createTestData } from '@/app/actions/create-test-data';
import { toast } from 'sonner';
import { Database } from 'lucide-react';

export function DevTools() {
  const [loading, setLoading] = useState(false);

  const handleCreateTestData = async () => {
    setLoading(true);
    const result = await createTestData();
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || 'Test data created!');
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleCreateTestData}
        disabled={loading}
        className="gap-2"
        variant="outline"
      >
        <Database className="h-4 w-4" />
        {loading ? 'Creating...' : 'Create Test Data'}
      </Button>
    </div>
  );
}
