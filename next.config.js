/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'rgtickets.com',
            port: '',
            pathname: '/**',
          },
        ],
      },
}

module.exports = nextConfig
