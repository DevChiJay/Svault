/**
 * Environment Configuration
 * Centralized configuration for API endpoints and app settings
 */

// API Configuration
export const API_CONFIG = {
  // Update these values for production
  BASE_URL: __DEV__ 
    ? 'http://192.168.1.4:8000'  // Development
    : 'https://apihq.store',  // Production
  API_VERSION: '/v1/password-manager',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// Full API URL
export const API_BASE_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`;

// Security Configuration
export const SECURITY_CONFIG = {
  // Token storage
  TOKEN_STORAGE_KEY: 'secvault_auth_token',
  REFRESH_TOKEN_KEY: 'secvault_refresh_token',
  
  // Biometric settings
  BIOMETRIC_ENABLED_KEY: 'secvault_biometric_enabled',
  
  // Auto-lock settings
  AUTO_LOCK_TIMEOUT: 300000, // 5 minutes in milliseconds
  
  // Clipboard security
  CLIPBOARD_CLEAR_TIMEOUT: 30000, // 30 seconds
  
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 72,
  
  // Entry field limits
  WEBSITE_NAME_MAX_LENGTH: 200,
  LOGIN_USERNAME_MAX_LENGTH: 200,
  NOTES_MAX_LENGTH: 1000,
} as const;

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'secVault',
  APP_VERSION: '1.0.0',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  
  // Cache settings
  CACHE_STALE_TIME: 300000, // 5 minutes
  CACHE_GC_TIME: 600000, // 10 minutes
} as const;

// Deep linking configuration
export const DEEP_LINK_CONFIG = {
  SCHEME: 'secvault',
  VERIFY_EMAIL_PATH: 'verify-email',
  RESET_PASSWORD_PATH: 'reset-password',
} as const;
