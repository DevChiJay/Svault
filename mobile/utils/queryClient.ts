/**
 * React Query Configuration
 * Global query client setup for API state management
 */

import { QueryClient } from '@tanstack/react-query';
import { APP_CONFIG } from '../constants/config';
import { Alert } from 'react-native';
import { tokenStorage } from '../services/storage/tokenStorage';
import { navigationService } from '../services/navigation/navigationService';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration
      staleTime: APP_CONFIG.CACHE_STALE_TIME,
      gcTime: APP_CONFIG.CACHE_GC_TIME,
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 401 (unauthorized) or 403 (forbidden)
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch configuration
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Network mode for offline support
      networkMode: 'offlineFirst',

      // Global error handler for queries
      onError: (error: any) => {
        // Handle 401 Unauthorized - session expired
        if (error?.status === 401) {
          handleAuthError();
        }
      },
    },
    mutations: {
      // Mutation configuration
      retry: (failureCount, error: any) => {
        // Don't retry on client errors (4xx)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
      retryDelay: 1000,
      
      // Network mode for offline support
      networkMode: 'offlineFirst',
      
      // Global error handler
      onError: (error: any) => {
        // Handle 401 Unauthorized - session expired
        if (error?.status === 401) {
          handleAuthError();
        } else if (!error?.response) {
          // Handle network errors gracefully
          console.log('Network error - operation will retry when online');
        }
      },
    },
  },
});

/**
 * Handle authentication errors (401 Unauthorized)
 * Clear tokens, cache, and redirect to login
 */
async function handleAuthError() {
  try {
    // Clear all stored tokens
    await tokenStorage.clearAll();
    
    // Clear all cached data
    queryClient.clear();
    
    // Navigate to login screen
    navigationService.navigateToLogin();
  } catch (error) {
    console.error('Error handling auth failure:', error);
  }
}

// Query keys for consistent cache management
export const queryKeys = {
  // Auth
  currentUser: ['auth', 'me'] as const,
  
  // Entries
  entries: (page?: number) => ['entries', { page }] as const,
  entry: (id: string) => ['entries', id] as const,
  entryReveal: (id: string) => ['entries', id, 'reveal'] as const,
  
  // Search
  searchWebsite: (query: string, page?: number) => ['search', 'website', query, { page }] as const,
  searchEmail: (query: string, page?: number) => ['search', 'email', query, { page }] as const,
} as const;
