/** @type {import('next').NextConfig} */
const path = require("path")

const nextConfig = {
  transpilePackages: ["@repo/ui"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
}

module.exports = nextConfig
