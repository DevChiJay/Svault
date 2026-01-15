/**
 * Offline Support Utilities
 * Enhanced offline-first functionality with React Query
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

/**
 * Setup React Query online manager
 */
export function setupOfflineSupport() {
  // Setup online manager to use NetInfo
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });
  });
}

/**
 * Hook to get network status
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [networkType, setNetworkType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? false);
      setNetworkType(state.type);
    });

    return () => unsubscribe();
  }, []);

  return {
    isConnected,
    isInternetReachable,
    isOnline: isConnected && isInternetReachable,
    networkType,
  };
}

/**
 * Hook to handle offline operations
 */
export function useOfflineHandler(onOffline?: () => void, onOnline?: () => void) {
  const { isOnline } = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline && !wasOffline) {
      setWasOffline(true);
      onOffline?.();
    } else if (isOnline && wasOffline) {
      setWasOffline(false);
      onOnline?.();
    }
  }, [isOnline, wasOffline, onOffline, onOnline]);

  return { isOnline, wasOffline };
}

/**
 * Check if device is online
 */
export async function checkNetworkConnection(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return !!state.isConnected && !!state.isInternetReachable;
}

/**
 * Get network info
 */
export async function getNetworkInfo() {
  const state = await NetInfo.fetch();
  return {
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable ?? false,
    type: state.type,
    details: state.details,
  };
}
