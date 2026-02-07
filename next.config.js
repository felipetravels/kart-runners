/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // /races/1 -> /races?id=1
      { source: "/races/:id(\\d+)", destination: "/races?id=:id" },
    ];
  },
};

module.exports = nextConfig;
