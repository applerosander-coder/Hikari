'use client';

import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : (
        'Update Email'
      )}
    </Button>
  );
}

interface UpdateEmailFormProps {
  action: (formData: FormData) => Promise<string>;
  defaultValue: string;
}

export function UpdateEmailForm({ action, defaultValue }: UpdateEmailFormProps) {
  return (
    <form action={action} className="space-y-4 mt-6">
      <div className="space-y-2">
        <Label htmlFor="newEmail">Email</Label>
        <Input
          id="newEmail"
          name="newEmail"
          type="email"
          defaultValue={defaultValue}
          placeholder="Enter your new email"
          required
        />
      </div>
      <SubmitButton />
    </form>
  );
}
