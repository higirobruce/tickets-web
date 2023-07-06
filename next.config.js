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
          {
            protocol: 'https',
            hostname: 'mobile.igihe.com',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'www.igihe.com',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'firebasestorage.googleapis.com',
            port: '',
            pathname: '/**',
          },

          
        ],
      },
}

module.exports = nextConfig
