/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep development output separate from production builds. Sharing one
  // directory between `next dev` and `next build` can delete vendor chunks
  // from a running server and cause intermittent MODULE_NOT_FOUND errors.
  distDir: process.env.NEXT_DIST_DIR || (process.env.NODE_ENV === 'development' ? '.next-dev' : '.next'),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Exclude canvas from client-side bundles (it's a Node.js native module)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        'utf-8-validate': false,
        'bufferutil': false,
      }
      // Ignore canvas module completely in client bundles
      config.externals = config.externals || []
      config.externals.push({
        canvas: 'commonjs canvas',
      })
    }
    return config
  },
}

export default nextConfig
