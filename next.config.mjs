import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin()

let opts = {
  env: {
    DATE_FORMAT: process.env.NEXT_PUBLIC_DATE_FORMAT ?? 'DD/MM/YYYY',
    TIME_FORMAT: process.env.NEXT_PUBLIC_TIME_FORMAT ?? 'hh:mm A',
    DATE_TIME_FORMAT:
      process.env.NEXT_PUBLIC_DATE_TIME_FORMAT ?? 'DD/MM/YYYY hh:mm A'
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...opts,
  experimental: {
    serverActions: {
      allowedOrigins: ['test.payu.in', 'secure.payu.in']
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '**' // Allow all paths
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '**' // Allow all paths
      }
    ]
  },
  webpack: config => {
    config.resolve.alias.canvas = false

    return config
  }
}

export default withNextIntl(nextConfig)
