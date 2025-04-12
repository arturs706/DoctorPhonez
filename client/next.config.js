/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['react-icons', '@fortawesome/react-fontawesome'],
  },
  reactStrictMode: true,
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['files.stripe.com', 'res.cloudinary.com', 'mdbcdn.b-cdn.net', 'localhost']
  },
};

module.exports = nextConfig;
