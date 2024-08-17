
import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      config.module.rules.push({
        test: /\.wasm$/,
        loader: "base64-loader",
        type: "javascript/auto",
      });

      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });        
  
      config.module.noParse = /\.wasm$/;
  
      config.module.rules.forEach((rule) => {
        (rule.oneOf || []).forEach((oneOf) => {
          if (oneOf.loader && oneOf.loader.indexOf("file-loader") >= 0) {
            oneOf.exclude.push(/\.wasm$/);
          }
        });
      });
  
      if (!isServer) {
        config.resolve.fallback.fs = false;
      }
  
      // Perform customizations to webpack config
      config.plugins.push(
        new webpack.IgnorePlugin({ resourceRegExp: /\/__tests__\// })
      );

      config.externals.push({
          'node:crypto': 'commonjs crypto',
          // 'node:fs': 'commonjs fs',
          // 'node:path': 'commonjs path',
          // 'node:os': 'commonjs os',
          // 'node:util': 'commonjs util',
          // 'node:stream': 'commonjs stream',
          // 'node:buffer': 'commonjs buffer'
      });
  
  
      // Important: return the modified config
      return config;
    },
  };

export default nextConfig
// export default withBundleAnalyzer(nextConfig)

