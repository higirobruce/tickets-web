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
          {
            protocol: 'https',
            hostname: 'images.unsplash.com',
            port: '',
            pathname: '/**',
          },
          // Organisers paste their own poster URLs, so any https host is allowed.
          {
            protocol: 'https',
            hostname: '**',
          },

          
        ],
      },
}

module.exports = nextConfig
