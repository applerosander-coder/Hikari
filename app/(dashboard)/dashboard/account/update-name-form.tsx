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
        'Update Name'
      )}
    </Button>
  );
}

interface UpdateNameFormProps {
  action: (formData: FormData) => Promise<string>;
  defaultValue: string;
}

export function UpdateNameForm({ action, defaultValue }: UpdateNameFormProps) {
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={defaultValue}
          placeholder="Enter your full name"
          required
        />
      </div>
      <SubmitButton />
    </form>
  );
}
