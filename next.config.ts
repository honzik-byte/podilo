import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 60 is for the homepage hero, which sits under a heavy navy scrim - the
    // extra compression is invisible there but saves a lot on the largest image.
    qualities: [60, 75],
    // Listing photos live in Supabase storage; everything else is served from /public.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
