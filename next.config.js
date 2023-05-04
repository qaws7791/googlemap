/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "https://api.vworld.kr/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
