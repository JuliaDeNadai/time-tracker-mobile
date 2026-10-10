const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

// iOS 27 aborts at launch apps that don't adopt the UIScene life cycle.
// Expo ships `ExpoAppSceneDelegate` (exposed to Obj-C as `EXExpoAppSceneDelegate`),
// but the SDK 57 template still creates the window in the AppDelegate.
const SCENE_DELEGATE_CLASS = 'EXExpoAppSceneDelegate';
const PROVIDER_PROTOCOL = 'ExpoReactNativeFactoryProvider';

const APP_DELEGATE_DECLARATION = /class AppDelegate: ExpoAppDelegate \{/;
const WINDOW_SETUP_BLOCK =
  /\n#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\([\s\S]*?\)\n#endif\n/;

function withSceneManifest(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: SCENE_DELEGATE_CLASS,
          },
        ],
      },
    };
    return cfg;
  });
}

function withSceneAppDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== 'swift') {
      throw new Error('with-scene-lifecycle: only Swift AppDelegates are supported.');
    }

    let contents = cfg.modResults.contents;
    if (contents.includes(PROVIDER_PROTOCOL)) {
      return cfg;
    }

    if (!APP_DELEGATE_DECLARATION.test(contents) || !WINDOW_SETUP_BLOCK.test(contents)) {
      throw new Error(
        'with-scene-lifecycle: AppDelegate.swift does not match the expected Expo template; update the plugin.',
      );
    }

    contents = contents
      .replace(APP_DELEGATE_DECLARATION, `class AppDelegate: ExpoAppDelegate, ${PROVIDER_PROTOCOL} {`)
      .replace(WINDOW_SETUP_BLOCK, '\n');

    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = function withSceneLifecycle(config) {
  return withSceneAppDelegate(withSceneManifest(config));
};
