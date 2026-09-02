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

// Deliberately no Content-Security-Policy here: the app pulls from Supabase,
// Stripe and OpenStreetMap tiles, so a CSP needs to be written and tested
// against those origins rather than guessed at.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), interest-cohort=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

nextConfig.headers = async () => [
  {
    source: '/:path*',
    headers: securityHeaders,
  },
];

export default nextConfig;
