/**
 * API Client Configuration
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_CONFIG } from '../../constants/config';
import { tokenStorage } from '../storage/tokenStorage';
import { navigationService } from '../navigation/navigationService';
import { ApiError } from '../../types';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await tokenStorage.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue request while refreshing
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt token refresh
            const newToken = await this.refreshToken();
            
            if (newToken) {
              // Update token and retry original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              
              // Process queued requests
              this.refreshSubscribers.forEach((callback) => callback(newToken));
              this.refreshSubscribers = [];
              
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            await tokenStorage.clearAll();
            navigationService.navigateToLogin();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<string | null> {
    try {
      const token = await tokenStorage.getToken();
      if (!token) {
        // No token to refresh (user not logged in)
        return null;
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newToken = response.data.access_token;
      await tokenStorage.saveToken(newToken);
      return newToken;
    } catch (error) {
      // Only log if it's not a 401 (expected when not logged in)
      if (axios.isAxiosError(error) && error.response?.status !== 401) {
        console.error('Token refresh failed:', error);
      }
      return null;
    }
  }

  /**
   * Normalize API errors for consistent handling
   */
  private normalizeError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        detail: error.response.data?.detail || 'An error occurred',
        status: error.response.status,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        detail: 'Network error. Please check your connection.',
        status: 0,
      };
    } else {
      // Error setting up request
      return {
        detail: error.message || 'An unexpected error occurred',
      };
    }
  }

  /**
   * Get axios instance for making requests
   */
  getInstance(): AxiosInstance {
    return this.client;
  }

  /**
   * Configure retry logic for failed requests
   */
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries = API_CONFIG.RETRY_ATTEMPTS
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (axios.isAxiosError(error) && error.response?.status && error.response.status < 500) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError!;
  }
}

export const apiClient = new ApiClient();
export const api = apiClient.getInstance();
