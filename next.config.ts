import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  transpilePackages: ["@hams-fam/sso-client"],
};

export default nextConfig;
