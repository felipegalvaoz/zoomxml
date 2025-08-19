/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Ensure proper handling of dynamic routes
  trailingSlash: false,
  // Enable React strict mode
  reactStrictMode: true, // Re-enable for better development
  // Disable source maps in development to avoid 403 errors
  productionBrowserSourceMaps: false,
  // Suppress development warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Configure webpack for better HMR and WebSocket support
  webpack: (config, { dev }) => {
    if (dev) {
      // Fix for filesystem watching issues
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**']
      }

      // Completely disable snapshot to fix filesystem issues
      config.snapshot = {
        managedPaths: [],
        immutablePaths: [],
        buildDependencies: {
          hash: false,
          timestamp: false
        },
        module: {
          timestamp: false,
          hash: false
        },
        resolve: {
          timestamp: false,
          hash: false
        },
        resolveBuildDependencies: {
          timestamp: false,
          hash: false
        }
      }

      // Disable filesystem caching completely
      config.cache = false

      // Additional filesystem fixes
      config.infrastructureLogging = {
        level: 'error'
      }

      // Disable file system watching for problematic paths
      if (config.watchOptions) {
        config.watchOptions.ignored = [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/dist/**',
          '**/build/**'
        ]
      }
    }
    return config
  },
}

module.exports = nextConfig
