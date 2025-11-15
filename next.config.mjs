/** @type {import('next').NextConfig} */
const nextConfig = {
  // Place build output outside the project in the user's profile to avoid OneDrive locks.
  // This uses a path relative to the project root that resolves to C:\Users\dolly\prepskul_build
  // (three levels up from the repo folder). Adjust if your username or layout differs.
  distDir: '../../../prepskul_build',
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
