import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  transpilePackages: ["@hams-fam/sso-client"],
  async redirects() {
    return [
      {
        source: "/builder",
        destination: "/admin/builder/react-flow/scenario-list",
        permanent: false,
      },
      {
        source: "/builder/:path*",
        destination: "/admin/builder/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
