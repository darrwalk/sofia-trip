/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_VERSION: (() => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      return `v${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}_${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`;
    })(),
  },
};

export default nextConfig;
