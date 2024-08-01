/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: {
      serverComponentsExternalPackages: ['llamaindex'],
      outputFileTracingExcludes: {
        "*": [
            "node_modules/canvas/build",
        ],
      },
      serverActions: {
        bodySizeLimit: '10mb',
      }
    },
    webpack: (config) => {
        config.resolve = {
          ...config.resolve,
          fallback: {
            "fs": false,
            "path": false,
            "os": false,
          }
        }
        config.resolve.alias = {
          ...config.resolve.alias,
          "sharp$": false,
          "onnxruntime-node$": false,
        }        
        return config
      },
      
};

export default nextConfig;
