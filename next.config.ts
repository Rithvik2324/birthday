import type { NextConfig } from "next";

// Force Tailwind/PostCSS to use the WASM transformer on Windows where
// native binaries (lightningcss) can fail to resolve their native package.
// This sets the environment variable early so Next.js/PostCSS picks it up.
process.env.CSS_TRANSFORMER_WASM = process.env.CSS_TRANSFORMER_WASM ?? "1";

const nextConfig: NextConfig = {
  // Mirror the allowedDevOrigins used in next.config.js so TypeScript
  // consumers and editors see the same suggestion during development.
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost',
    'http://127.0.0.1',
    'http://192.168.56.1:3000',
    'http://192.168.56.1',
  ],
};

export default nextConfig;
