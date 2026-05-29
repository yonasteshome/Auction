const path = require("path");

module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/tailwind-config"],
  output: "standalone",
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
};
