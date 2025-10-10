# HIKARI - Next.js 14 SaaS Template

## Project Overview
A complete and open-source Next.js 14 SaaS template built with Supabase for authentication and database, Stripe for payments, and modern UI components.

## Replit Migration - October 2025
Successfully migrated from Vercel to Replit environment.

## Configuration

### Port and Host Settings
- Development server runs on port 5000, binding to 0.0.0.0 for Replit compatibility
- Package.json scripts configured with: `next dev -p 5000 -H 0.0.0.0`

### Required Environment Variables
The following secrets must be configured in Replit Secrets:

#### Supabase (Database & Authentication)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (e.g., https://xxx.supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous/public API key

#### Stripe (Payment Processing)
- `STRIPE_SECRET_KEY`: Your Stripe secret key for server-side operations
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret for event verification
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key for client-side

You can find these values at:
- Supabase: Dashboard → Settings → API
- Stripe: Dashboard → Developers → API keys

### Project Structure
- `/app` - Next.js 14 App Router pages and layouts
- `/components` - Reusable React components
- `/utils` - Utility functions for Supabase, Stripe, and helpers
- `/server` - tRPC server and API routes
- `/content` - MDX documentation and blog content

### Development Workflow
1. Install dependencies: `pnpm install`
2. Run development server: `pnpm run dev`
3. Build for production: `pnpm run build`
4. Start production server: `pnpm run start`

### Deployment
Configured for Replit Autoscale deployment:
- Build command: `pnpm run build`
- Run command: `pnpm run start`
- Port: 5000

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database & Auth**: Supabase
- **Payments**: Stripe
- **UI Components**: Radix UI, Tailwind CSS, Framer Motion
- **Documentation**: Fumadocs
- **State Management**: TanStack Query, tRPC

## Recent Changes
- 2025-10-10: Migrated from Vercel to Replit
  - Updated scripts to use port 5000 with 0.0.0.0 binding
  - Configured deployment settings for Replit autoscale
  - Verified all environment variables are properly configured
  - Application running successfully on Replit

## Notes
- Uses pnpm as package manager (specified in package.json)
- All environment secrets are managed through Replit Secrets
- Development server includes Fast Refresh for improved DX
