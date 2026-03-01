/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  typescript: {
    // Allow build to succeed even with TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow build to succeed even with ESLint errors
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
