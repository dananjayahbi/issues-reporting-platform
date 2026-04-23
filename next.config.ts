import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/auth",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/auth/login",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/auth/forgot-password",
        destination: "/forgot-password",
        permanent: false,
      },
      {
        source: "/auth/first-login",
        destination: "/first-login",
        permanent: false,
      },
      {
        source: "/auth/reset-password",
        destination: "/forgot-password",
        permanent: false,
      },
      {
        source: "/auth/reset-password/:token",
        destination: "/reset-password/:token",
        permanent: false,
      },
      {
        source: "/auth/register",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/auth/accept-invite",
        destination: "/accept-invite",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**.llc.local",
        pathname: "/uploads/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "clsx", "tailwind-merge"],
  },
  typedRoutes: false,
  serverExternalPackages: ["sharp", "bcryptjs"],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
