/**
 * Expo Config Plugin for Screenshot Protection
 * Prevents screenshots on Android using FLAG_SECURE
 */

const { withAndroidManifest } = require('@expo/config-plugins');

const withScreenshotProtection = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Add FLAG_SECURE to prevent screenshots
    // This will be applied to all activities
    if (androidManifest.application && androidManifest.application[0]) {
      const application = androidManifest.application[0];
      
      if (!application.$) {
        application.$ = {};
      }
      
      // Add secure flag to window
      application.$['android:windowEnableSplitTouch'] = 'false';
      application.$['android:windowDisablePreview'] = 'true';
    }

    return config;
  });
};

module.exports = withScreenshotProtection;
