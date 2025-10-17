'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface NameFormProps {
  defaultValue: string;
}

export function NameForm({ defaultValue }: NameFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;

    try {
      const response = await fetch('/api/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update name');
      }

      toast.success('Name updated successfully!');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update name');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={defaultValue}
          placeholder="Enter your full name"
          disabled={isUpdating}
        />
      </div>
      <Button type="submit" disabled={isUpdating}>
        {isUpdating ? 'Updating...' : 'Update Name'}
      </Button>
    </form>
  );
}
