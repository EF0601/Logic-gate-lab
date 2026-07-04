const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    ignore: [
      /^\/\.git/,
      /^\/\.vscode/,
      /^\/src/,
      /^\/node_modules\/\.cache/,
      /^\/node_modules\/\.bin/,
      /^\/node_modules\/@types/,
      /^\/node_modules\/electron/,
      /^\/node_modules\/electron-rebuild/,
      /^\/node_modules\/electron-forge/,
      /^\/node_modules\/electron-packager/,
      /^\/node_modules\/electron-winstaller/,
      /^\/node_modules\/electron-winstaller-redist/,
      /^\/node_modules\/electron-download/,
      /^\/node_modules\/electron-builder/,
      /^\/node_modules\/electron-osx-sign/,
      /^\/node_modules\/electron-notarize/,
      /^\/node_modules\/electron-updater/,
      /^\/node_modules\/electron-log/,
      /^\/node_modules\/electron-debug/,
      /^\/node_modules\/electron-devtools-installer/,
      /^\/node_modules\/electron-context-menu/,
      /^\/node_modules\/electron-compile/,
      /^\/node_modules\/electron-compile-cache/,
      /^\/node_modules\/electron-compile-cache-loader/,
      /^\/node_modules\/electron-compile-loader/,
      /^\/node_modules\/electron-compile-plugin/,
      /^\/\.github/,
      /^\/\.gitattributes/,
      /^\/\.gitignore/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
