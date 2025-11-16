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
}

export default nextConfig
