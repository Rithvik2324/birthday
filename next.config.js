/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: false,
    css: false,
  },
  // During development Next may receive cross-origin requests from other
  // hosts on your LAN (e.g. VMs or device IPs). Newer Next.js versions will
  // require explicit whitelisting via `allowedDevOrigins` to avoid warnings.
  // Add common local origins used during dev. Adjust if your dev server
  // runs on a different port or host.
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost',
    'http://127.0.0.1',
    'http://192.168.56.1:3000',
    'http://192.168.56.1',
  ],
};

module.exports = nextConfig;
