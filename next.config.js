/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  env: {
    NEXT_PUBLIC_BUILD_VERSION:
      process.env.COMMIT_SHA ||
      (() => {
        try {
          return require('child_process')
            .execSync('git rev-parse --short HEAD')
            .toString()
            .trim();
        } catch {
          return 'dev';
        }
      })(),
  },
};

module.exports = nextConfig;
