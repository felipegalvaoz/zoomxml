/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Ensure proper handling of dynamic routes
  trailingSlash: false,
  // Enable React strict mode
  reactStrictMode: true,
  // Allow cross-origin requests for development
  allowedDevOrigins: ['127.0.0.1:3001', '127.0.0.1:3002', 'localhost:3001', 'localhost:3002'],
  // Disable source maps in development to avoid 403 errors
  productionBrowserSourceMaps: false,
  // Configure webpack for better HMR
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

module.exports = nextConfig
