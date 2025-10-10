# Authentication Setup Guide

## Preventing Duplicate Accounts

### Problem
Users can create multiple accounts with the same email address using different authentication methods:
1. Sign up with email/password
2. Sign in with GitHub OAuth using the same email → Creates a second account

### Solution: Enable Automatic Account Linking in Supabase

To prevent duplicate accounts, you need to enable automatic account linking in your Supabase project:

1. **Go to Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard

2. **Enable Account Linking**
   - Go to Authentication → Settings
   - Find the "Security and user management" section
   - Enable **"Confirm email"** for email signups (recommended)
   - Scroll down to **"User Signups"** section
   - Set **"Automatically link OAuth accounts"** to **ON**

3. **How It Works**
   - When enabled, if a user signs in with OAuth (GitHub, Google, etc.) using an email that already exists in your system, Supabase will:
     - Link the OAuth identity to the existing account
     - NOT create a duplicate account
     - Allow the user to sign in with either method

### Current Protection

The codebase already includes protection for email/password duplicate signups:

```typescript
// In utils/auth-helpers/server.ts (signUp function)
if (data.user && data.user.identities && data.user.identities.length == 0) {
  return getErrorRedirect(
    '/signup',
    'Sign up failed.',
    'There is already an account associated with this email address. Try resetting your password.'
  );
}
```

This prevents users from creating a second email/password account if they already have an OAuth account with the same email.

### Manual Account Merging

If you already have duplicate accounts in your system, you'll need to manually merge them in the Supabase dashboard or write a migration script.

### Testing

1. Create an account with email/password
2. Try signing in with GitHub using the same email
3. With account linking enabled: Should link to existing account
4. Without account linking: Will create a duplicate account

## Additional Security Settings

### Email Confirmation
- Require users to confirm their email before accessing the platform
- Go to Authentication → Email Templates → Confirm signup
- Make sure "Confirm email" is enabled in Settings

### Password Requirements
- Configure minimum password length in Settings
- Default: 6 characters
- Recommended: 8+ characters with complexity requirements

### Rate Limiting
- Supabase automatically rate limits authentication attempts
- Default: 60 requests per hour per IP
- Can be configured in Authentication → Settings
