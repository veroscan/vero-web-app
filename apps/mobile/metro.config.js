// The app reads the API contract straight from packages/shared, so it never drifts from the API.
// apps/mobile is not an npm workspace (React Native pins its own React), so Metro is pointed at it here.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const shared = path.resolve(projectRoot, '../../packages/shared');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [shared];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];
config.resolver.extraNodeModules = {
  '@vero/shared': path.join(shared, 'src'),
  zod: path.resolve(projectRoot, 'node_modules/zod'),
};
module.exports = config;
