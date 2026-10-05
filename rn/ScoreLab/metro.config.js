const fs = require('fs');
const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * ScoreLab harness Metro config.
 *
 * The components under test live in sibling folders (../SufficiencyScore and
 * ../WinMoment) that have no node_modules of their own. We:
 *  - watch that folder so Metro can bundle it and hot-reload edits,
 *  - resolve every bare import (react, react-native, skia, reanimated, lottie,
 *    svg) from ScoreLab/node_modules only, so there is exactly one copy of
 *    React / React Native in the bundle.
 */
const appRoot = __dirname;
const componentRoot = path.resolve(appRoot, '../SufficiencyScore');
const winRoot = path.resolve(appRoot, '../WinMoment');
const appModules = path.resolve(appRoot, 'node_modules');

// Packages that must be singletons. Pinned to the app's copy even if the
// component folder ever grows its own node_modules.
const singletons = [
  'react',
  'react-native',
  'react-native-reanimated',
  '@shopify/react-native-skia',
  'lottie-react-native',
  'react-native-svg',
  'react-native-haptic-feedback',
];

const isSingleton = name =>
  singletons.some(s => name === s || name.startsWith(s + '/'));

const config = {
  // Metro refuses to start on a missing watch folder, so only add it once it exists.
  watchFolders: [componentRoot, winRoot].filter(f => fs.existsSync(f)),
  resolver: {
    nodeModulesPaths: [appModules],
    // Force singletons to resolve as if imported from the app root.
    resolveRequest: (context, moduleName, platform) =>
      context.resolveRequest(
        isSingleton(moduleName)
          ? {...context, originModulePath: path.join(appRoot, 'index.js')}
          : context,
        moduleName,
        platform,
      ),
    // Lottie JSON is handled as a normal module; .lottie is an asset.
    assetExts: [...getDefaultConfig(appRoot).resolver.assetExts, 'lottie'],
  },
  // Android's HTTP client folds "/assets/../SufficiencyScore/..." into "/SufficiencyScore/...",
  // which 404s, so put the ".." back. Dev only: release builds bundle assets into the APK.
  server: {
    rewriteRequestUrl: url => url.replace(/^\/SufficiencyScore\//, '/assets/../SufficiencyScore/'),
  },
};

module.exports = mergeConfig(getDefaultConfig(appRoot), config);
