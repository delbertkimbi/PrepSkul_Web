/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use custom distDir locally to avoid OneDrive sync issues
  // On Vercel, use default .next directory
  ...(process.env.VERCEL ? {} : {
    distDir: '../../../prepskul_build',
  }),
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
