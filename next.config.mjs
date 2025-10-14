import createMDX from 'fumadocs-mdx/config';

const withMDX = createMDX();

// Get Supabase hostname from environment variable
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : '';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: ''
      },
      {
        protocol: 'http', 
        hostname: '127.0.0.1', 
        port: '64321'
      },
      // Dynamic Supabase hostname from environment variable
      ...(supabaseHostname ? [{
        protocol: 'https',
        hostname: supabaseHostname,
        port: ''
      }] : []),
      // Wildcard for all Supabase storage domains (fallback)
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: ''
      }
    ]
  }
};

export default withMDX(config);
