/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com; connect-src 'self' http://localhost:4000 ws://localhost:4000 https://teamhub-api-ofhm.onrender.com wss://teamhub-api-ofhm.onrender.com https://*.onrender.com wss://*.onrender.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
