const {
  withInfoPlist,
  withAndroidManifest,
  AndroidConfig,
  createRunOncePlugin,
} = require("@expo/config-plugins");

const pkg = require("../package.json");

/**
 * @typedef {import('@expo/config-plugins').ConfigPlugin} ConfigPlugin
 * @typedef {import('@expo/config-plugins').InfoPlist} InfoPlist
 */

/**
 * Main plugin function
 * @type {ConfigPlugin}
 */
const withBackgroundAudio = (config) => {
  config = withIOSBackgroundAudio(config);
  config = withAndroidBackgroundAudio(config);
  return config;
};

/**
 * Configure iOS Info.plist for background audio and microphone access.
 * @type {ConfigPlugin}
 */
const withIOSBackgroundAudio = (config) => {
  return withInfoPlist(config, (config) => {
    // Background Mode
    if (!config.modResults.UIBackgroundModes) {
      config.modResults.UIBackgroundModes = [];
    }
    if (!config.modResults.UIBackgroundModes.includes("audio")) {
      config.modResults.UIBackgroundModes.push("audio");
    }

    // Microphone Usage Description
    config.modResults.NSMicrophoneUsageDescription =
      config.modResults.NSMicrophoneUsageDescription ||
      "Allow PocketTranscribe to access your microphone to record meetings even when the app is in the background.";

    return config;
  });
};

/**
 * Configure Android Manifest for background audio and microphone permissions.
 * @type {ConfigPlugin}
 */
const withAndroidBackgroundAudio = (config) => {
  return withAndroidManifest(config, (config) => {
    // Add permissions
    AndroidConfig.Permissions.addPermission(
      config.modResults,
      "android.permission.RECORD_AUDIO",
    );
    AndroidConfig.Permissions.addPermission(
      config.modResults,
      "android.permission.FOREGROUND_SERVICE",
    );
    // Required for Android 14+
    AndroidConfig.Permissions.addPermission(
      config.modResults,
      "android.permission.FOREGROUND_SERVICE_MICROPHONE",
    );

    // Add Service definition to Manifest
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults,
    );

    // Manually ensure the service is present in the application tag
    if (!Array.isArray(mainApplication.service)) {
      mainApplication.service = [];
    }

    const serviceName = "com.pockettranscribe.service.AudioRecordingService";
    const existingService = mainApplication.service.find(
      (s) => s.$["android:name"] === serviceName,
    );

    if (!existingService) {
      mainApplication.service.push({
        $: {
          "android:name": serviceName,
          "android:enabled": "true",
          "android:exported": "false",
          "android:foregroundServiceType": "microphone",
        },
      });
    }

    return config;
  });
};

module.exports = createRunOncePlugin(
  withBackgroundAudio,
  pkg.name,
  pkg.version,
);
