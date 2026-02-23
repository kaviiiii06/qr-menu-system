/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Production'da console.log'ları kaldır
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },
  // Developer indicator'ı tamamen kapat
  devIndicators: false,
  // React Strict Mode
  reactStrictMode: false,
  // ESLint'i build sırasında ignore et
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig
