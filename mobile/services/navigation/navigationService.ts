/**
 * Navigation Service
 * Allows navigation from outside React components (e.g., API interceptors)
 */

import { router } from 'expo-router';

class NavigationService {
  /**
   * Navigate to login screen and clear navigation stack
   */
  navigateToLogin() {
    try {
      // Replace current screen with login
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Navigation to login failed:', error);
    }
  }

  /**
   * Navigate to vault (main dashboard)
   */
  navigateToVault() {
    try {
      router.replace('/(main)/vault');
    } catch (error) {
      console.error('Navigation to vault failed:', error);
    }
  }
}

export const navigationService = new NavigationService();
