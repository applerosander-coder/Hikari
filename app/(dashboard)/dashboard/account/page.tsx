import { LockIcon, Trash2Icon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/server';
import {
  getUser,
  getUserDetails,
  getSubscription
} from '@/utils/supabase/queries';
import { updateName, updateEmail } from '@/utils/auth-helpers/server';
import { AvatarPicker } from './avatar-picker'; 
import { redirect } from 'next/navigation';
import { UpdateNameForm } from './update-name-form';
import { UpdateEmailForm } from './update-email-form';

export default async function AccountPage() {
  const supabase = createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
  ]);

  const subscription = user ? await getSubscription(supabase, user.id) : null;

  if (!user) {
    return redirect('/signin'); // Keep this for user redirection
  }

  // All logged-in users have the free Participant Plan
  const hasPaidSubscription = subscription?.status === 'active';

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 gap-4">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <Card className="flex flex-col gap-4">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateNameForm 
              action={updateName} 
              defaultValue={user.user_metadata.full_name || ''} 
            />
            <UpdateEmailForm 
              action={updateEmail} 
              defaultValue={user.email || ''} 
            />
            {/* Avatar Picker */}
            <AvatarPicker 
              currentAvatar={userDetails?.avatar_url || null} 
              userId={user.id} 
            />
          </CardContent>
        </Card>
        {hasPaidSubscription ? (
          <Card className="flex flex-col gap-4 w-full">
            <CardHeader>
              <CardTitle>Your Subscription</CardTitle>
              <CardDescription>
                Manage your subscription details.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="plan">Plan</Label>
                <div className="text-muted-foreground">
                  {subscription?.prices?.products?.name || 'N/A'}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="renewal">Next Renewal</Label>
                <div className="text-muted-foreground">
                  {subscription?.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleDateString(
                        'en-US',
                        { month: 'long', day: 'numeric', year: 'numeric' }
                      )
                    : 'N/A'}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="text-muted-foreground">
                  {subscription?.prices?.unit_amount
                    ? `$${(subscription.prices.unit_amount / 100).toFixed(2)} / ${subscription.prices.interval}`
                    : 'N/A'}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status</Label>
                <div className="text-muted-foreground capitalize">
                  {subscription?.status || 'N/A'}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Manage Subscription</Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="flex flex-col gap-4 w-full">
            <CardHeader>
              <CardTitle>Your Subscription</CardTitle>
              <CardDescription>
                You are currently on the free Participant Plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="plan">Plan</Label>
                <div className="text-muted-foreground">
                  Participant Plan
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="text-muted-foreground">
                  $0 / month
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status</Label>
                <div className="text-muted-foreground capitalize">
                  Active
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between w-full">
                <div>
                  <h4 className="text-sm font-medium">Upgrade to Premium</h4>
                  <p className="text-sm text-muted-foreground">Get access to more features</p>
                </div>
                <Link href="/pricing">
                  <Button>View Pricing</Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your account security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <LockIcon className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                  </p>
                </div>
              </div>
              <Switch id="two-factor-auth" />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trash2Icon className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all your data.
                    </p>
                  </div>
                </div>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
