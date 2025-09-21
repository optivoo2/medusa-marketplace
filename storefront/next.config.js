// Disable strict env checking during CI to prevent build fails on Vercel
if (!process.env.CI && !process.env.VERCEL) {
  const checkEnvVariables = require("./check-env-variables.js")
  checkEnvVariables()
}

/**
 * @type {import('next').NextConfig}
 */
const trim = (value) => (typeof value === "string" ? value.trim() : value)
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  skipTrailingSlashRedirect: true,
  env: {
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: trim(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) || 'https://petrescue-brasil-production.up.railway.app',
    MEDUSA_BACKEND_URL: trim(process.env.MEDUSA_BACKEND_URL) || 'https://petrescue-brasil-production.up.railway.app',
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: trim(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) || 'pk_cdfa13cc05867abb45cdbf9f5985057ee9a4d48a6117a7a9f556c0d064ac0af1',
    NEXT_PUBLIC_BASE_URL: trim(process.env.NEXT_PUBLIC_BASE_URL || ''),
    NEXT_PUBLIC_DEFAULT_REGION: trim(process.env.NEXT_PUBLIC_DEFAULT_REGION || 'br'),
  },
  async rewrites() {
    const backendUrl = trim(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) || 'https://petrescue-brasil-production.up.railway.app'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
      {
        source: '/admin/:path*',
        destination: `${backendUrl}/admin/:path*`,
      },
      {
        source: '/store/:path*',
        destination: `${backendUrl}/store/:path*`,
      },
      {
        source: '/health',
        destination: `${backendUrl}/health`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "petrescue-brasil-production.up.railway.app",
      },
    ],
  },
}

module.exports = nextConfig