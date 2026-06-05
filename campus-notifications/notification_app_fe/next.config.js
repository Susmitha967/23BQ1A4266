/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API calls to avoid CORS in development
  async rewrites() {
    return [
      {
        source: "/api/notifications-proxy",
        destination:
          "http://4.224.186.213/evaluation-service/notifications",
      },
    ];
  },
};

module.exports = nextConfig;
