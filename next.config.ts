import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "memoimg.blob.core.windows.net",
        pathname: "/img/**",
      },
    ],
  },
};

export default nextConfig;
