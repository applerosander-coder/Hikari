# BIDWIN Social Features Setup Guide

## Overview
This guide explains how to enable the new social networking features:
- **Notifications**: Outbid alerts, auction ended alerts, and follow requests
- **Messages**: User-to-user messaging system
- **Connections**: Follow/follower system with user search

## Step 1: Run the Database Migration

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Open the file `docs/SOCIAL_FEATURES_MIGRATION.sql`
4. Copy all the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **Run** to execute the migration

This will create three new tables:
- `follows` - User connections and follow requests
- `notifications` - Notifications for users
- `messages` - User-to-user messages

## Step 2: Regenerate TypeScript Types

After running the migration, you need to update your TypeScript types to include the new tables:

### Option A: Using Supabase CLI (Recommended)
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/db.ts
```
Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

### Option B: Through Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Scroll to **Project API keys**
4. Find the section "Generate TypeScript Types"
5. Copy the generated types
6. Replace the content of `types/db.ts` with the copied types

## Step 3: Verify the Installation

After completing Steps 1 and 2, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Restart it
pnpm run dev
```

The LSP/TypeScript errors should now be resolved, and all features should work correctly.

## Features Implemented

### 1. Notifications Dropdown (Bell Icon)
- Shows unread notification count with red badge
- Real-time updates using Supabase subscriptions
- Displays outbid alerts when someone bids higher
- Shows auction ended notifications
- Allows users to accept/reject follow requests directly from notifications
- Mark individual notifications as read
- "Mark all as read" functionality

### 2. Messages Dropdown (Message Icon)  
- Shows unread message count with red badge
- Real-time updates using Supabase subscriptions
- Preview of recent messages
- Click to navigate to full Messages page
- Displays sender avatar and message preview

### 3. Connections Page (Users Icon)
- **Search Users**: Find users by email address and send follow requests
- **Pending Requests**: View and manage incoming follow requests (accept/reject)
- **Followers Tab**: See all users following you
- **Following Tab**: See all users you're following with unfollow option
- User avatars and names displayed throughout

### 4. Full Messages Page (`/messages`)
- **Inbox**: View all received messages
- **Sent**: View all sent messages
- **Compose**: Send new messages to users by email
- Messages show read/unread status
- Subject line support (optional)
- Real-time message delivery

### 5. Automatic Notifications
- **Outbid Notifications**: Automatically created when someone bids higher than you
- **Follow Request Notifications**: Created when someone sends you a follow request
- **Message Notifications**: Created when someone sends you a message
- Database trigger automatically creates outbid notifications on new bids

## UI Changes

### Mobile Navbar
- **Removed**: BIDWIN logo from the top mobile navbar
- **Added**: Three new icon buttons (left to right):
  1. **Messages** (MessageCircle icon) - with unread badge
  2. **Notifications** (Bell icon) - with unread badge
  3. **Connections** (Users icon) - links to connections page

### Desktop
- Logo remains in the mobile menu (hamburger)
- All features accessible via mobile navbar

## Database Schema

### `follows` Table
- Tracks follower/following relationships
- Status: 'pending', 'accepted', 'rejected'
- Unique constraint prevents duplicate follow requests

### `notifications` Table
- Types: 'outbid', 'auction_ended', 'follow_request', 'follow_accepted', 'message'
- JSONB data field for additional context
- Read/unread status tracking

### `messages` Table
- From/to user IDs
- Optional subject line
- Read/unread status
- Chronological ordering

## Row Level Security (RLS)

All tables have proper RLS policies:
- Users can only see their own notifications and messages
- Users can view follows where they're involved
- Follow requests can be created by any user
- Message sending requires authentication

## Real-time Features

Uses Supabase Realtime subscriptions for:
- Instant notification updates
- Live message delivery
- Follow request status changes

## Next Steps

After setup, you can:
1. Test the search feature by finding users via email
2. Send follow requests and test the approval flow
3. Send messages between users
4. Test outbid notifications by bidding on auction items
5. Verify all real-time features are working

## Troubleshooting

### TypeScript Errors
- Make sure you've regenerated the types (Step 2)
- Restart your IDE/editor
- Clear `node_modules/.cache` if needed

### Database Errors
- Verify the SQL migration ran successfully
- Check Supabase logs for any errors
- Ensure RLS policies are enabled

### Real-time Not Working
- Check Supabase Realtime is enabled for your project
- Verify your Supabase client configuration
- Check browser console for connection errors

## Support

If you encounter issues:
1. Check the Supabase SQL Editor for error messages
2. Verify all three tables were created successfully
3. Ensure TypeScript types include the new tables
4. Check browser console for client-side errors
