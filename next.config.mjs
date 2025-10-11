import createMDX from 'fumadocs-mdx/config';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['three'],
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
      {
        protocol: 'https',
        hostname: 'llmgwifgtszjgjlzlwjq.supabase.co',
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
