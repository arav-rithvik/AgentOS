import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // playwright-core is loaded at runtime by the real-Chrome routes; make sure Vercel ships it.
  outputFileTracingIncludes: {
    "/api/browser/*": ["./node_modules/playwright-core/**/*"],
    "/api/browser": ["./node_modules/playwright-core/**/*"],
  },
};

export default nextConfig;
