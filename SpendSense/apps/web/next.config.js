const path = require("path");

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
  serverActions:{
    bodySizeLimit:"5mb",
  },
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/tailwind-config"],
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  async redirects() {
    return [
      { source: "/live-prices", destination: "/market/trends", permanent: true },
      { source: "/price-trends", destination: "/market/trends", permanent: true },
      { source: "/signup", destination: "/register", permanent: true },
      // { source: "/admin/prices", destination: "/admin/price-moderation", permanent: false },
      // { source: "/admin/vendors/verification", destination: "/admin/vendor-verification", permanent: false },
      // { source: "/admin/categories", destination: "/admin/categories", permanent: false },
      // { source: "/admin/logs", destination: "/admin/audit-logs", permanent: false },
      // { source: "/admin/ml", destination: "/admin/ml-monitoring", permanent: false },
      // { source: "/admin/dashboard", destination: "/admin/dashboard", permanent: false },
      // { source: "/admin/users", destination: "/admin/users", permanent: false },
      // { source: "/admin/vendors", destination: "/admin/vendors", permanent: false },
      // { source: "/admin/settings", destination: "/admin/system-settings", permanent: false },
      // { source: "/admin/moderate/prices", destination: "/admin/price-moderation", permanent: false },
    ];
  },

};
