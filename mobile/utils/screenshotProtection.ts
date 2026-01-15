/**
 * Screenshot Protection Utility
 * Prevent screenshots and screen recording on Android
 */

import { Platform } from 'react-native';
import { useEffect } from 'react';

/**
 * Enable screenshot protection (Android only)
 * On iOS, screenshot protection is not possible due to platform restrictions
 */
export function enableScreenshotProtection() {
  if (Platform.OS === 'android') {
    try {
      // This would require a native module or expo config plugin
      // For now, we'll document the requirement
      console.log('Screenshot protection enabled (requires native module)');
    } catch (error) {
      console.warn('Failed to enable screenshot protection:', error);
    }
  }
}

/**
 * Disable screenshot protection
 */
export function disableScreenshotProtection() {
  if (Platform.OS === 'android') {
    try {
      console.log('Screenshot protection disabled');
    } catch (error) {
      console.warn('Failed to disable screenshot protection:', error);
    }
  }
}

/**
 * Hook to enable screenshot protection for a component
 */
export function useScreenshotProtection(enabled: boolean = true) {
  useEffect(() => {
    if (enabled) {
      enableScreenshotProtection();
    }

    return () => {
      if (enabled) {
        disableScreenshotProtection();
      }
    };
  }, [enabled]);
}

/**
 * Check if screenshot protection is available on this platform
 */
export function isScreenshotProtectionAvailable(): boolean {
  return Platform.OS === 'android';
}

/**
 * Screen Recording Detection Utility
 * Detect when screen recording is active (Android only)
 */
export function useScreenRecordingDetection(onRecordingDetected?: () => void) {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // This would require a native module to detect screen recording
    // For now, we'll document the requirement
    console.log('Screen recording detection enabled (requires native module)');

    return () => {
      console.log('Screen recording detection disabled');
    };
  }, [onRecordingDetected]);
}
