import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  output: 'standalone', // 여기로 넣어주세요
  images: {
    formats: ['image/webp'],
  },
}

export default nextConfig
