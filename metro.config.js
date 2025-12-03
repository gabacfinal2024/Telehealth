// Load polyfill first
require('./polyfill');

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix for paths with spaces - ensure proper node_modules resolution
const projectRoot = __dirname;
const nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

config.resolver = {
  ...config.resolver,
  nodeModulesPaths: nodeModulesPaths,
  // Enable symlinks resolution
  unstable_enableSymlinks: true,
  // Ensure all node_modules are searchable
  unstable_enablePackageExports: true,
};

// Watch all files in node_modules/@supabase
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(projectRoot, 'node_modules/@supabase'),
];

module.exports = config;

