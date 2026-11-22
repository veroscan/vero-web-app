// The phone app's own lint config (Expo's), so `npx expo lint` doesn't fall back to the repo root's.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'tools/*', 'metro.config.js'],
  },
]);
