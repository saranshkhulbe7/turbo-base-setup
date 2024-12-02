/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ["@repo/ui"],

  async rewrites() {
    return [
      {
        source: "/trpc/:path*", // Match requests to /trpc/<anything>
        destination: "http://localhost:4500/trpc/:path*", // Proxy to backend
      },
    ];
  },
};
