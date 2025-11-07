/** @type {import('next').NextConfig} */
const withBundleAnalyzer = (config) => {
  if (process.env.ANALYZE === 'true') {
    try {
      const { default: withAnalyzer } = require('@next/bundle-analyzer')({ enabled: true })
      return withAnalyzer(config)
    } catch {
      return config
    }
  }
  return config
}

const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
}

module.exports = withBundleAnalyzer(nextConfig)