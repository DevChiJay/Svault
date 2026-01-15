/**
 * Create Entry Screen
 * Quick access to create new password entry
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function CreateScreen() {
  const router = useRouter();

  useEffect(() => {
    // Immediately navigate to the new entry screen
    router.push('/(main)/entry/new');
  }, []);

  // This screen just redirects, so return null
  return null;
}
