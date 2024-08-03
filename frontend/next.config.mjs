/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: {
      outputFileTracingExcludes: {
        "*": [
            "node_modules/canvas/build",
        ],
      }
    },
};

export default nextConfig;
