/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mojnrfhvwwzypzcqrwvr.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Allow any Supabase storage URL (for future projects)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
