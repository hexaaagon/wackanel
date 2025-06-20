import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wakatime.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
