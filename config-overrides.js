const webpack = require('webpack');

module.exports = function override(config) {
  // Ensure resolve exists
  if (!config.resolve) {
    config.resolve = {};
  }
  
  // Set up fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "path": require.resolve("path-browserify"),
    "fs": false, // fs is not needed in browser environment
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer"),
  };
  
  // Add ProvidePlugin for global variables
  config.plugins = [
    ...(config.plugins || []),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ];
  
  return config;
};

