/**
 * Settings Screen
 * Comprehensive app settings and preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { queryClient } from '@/utils/queryClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Settings state
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [autoLockTimeout, setAutoLockTimeout] = useState(5); // minutes
  const [clipboardTimeout, setClipboardTimeout] = useState(30); // seconds
  const [darkMode, setDarkMode] = useState(false);
  const [screenshotProtection, setScreenshotProtection] = useState(true);

  const handleBiometricToggle = async (value: boolean) => {
    try {
      // Check if biometric is available
      // This would use expo-local-authentication
      setBiometricEnabled(value);
      await AsyncStorage.setItem('biometric_enabled', JSON.stringify(value));
      
      if (value) {
        Alert.alert(
          'Biometric Authentication',
          'Biometric authentication has been enabled. You can now use fingerprint or face recognition to unlock the app.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle biometric authentication');
    }
  };

  const handleAutoLockToggle = async (value: boolean) => {
    setAutoLockEnabled(value);
    await AsyncStorage.setItem('auto_lock_enabled', JSON.stringify(value));
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. You will need to fetch your password entries again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await queryClient.clear();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.section}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={32} color="#6366F1" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.username || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Security Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="finger-print" size={20} color="#6366F1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Biometric Authentication</Text>
              <Text style={styles.settingDescription}>
                Use fingerprint or face recognition
              </Text>
            </View>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={handleBiometricToggle}
            trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
            thumbColor={biometricEnabled ? '#6366F1' : '#F3F4F6'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="lock-closed" size={20} color="#6366F1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Auto-Lock</Text>
              <Text style={styles.settingDescription}>
                Lock app after {autoLockTimeout} minutes of inactivity
              </Text>
            </View>
          </View>
          <Switch
            value={autoLockEnabled}
            onValueChange={handleAutoLockToggle}
            trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
            thumbColor={autoLockEnabled ? '#6366F1' : '#F3F4F6'}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="time" size={20} color="#6366F1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Auto-Lock Timeout</Text>
              <Text style={styles.settingDescription}>{autoLockTimeout} minutes</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="shield-checkmark" size={20} color="#6366F1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Screenshot Protection</Text>
              <Text style={styles.settingDescription}>
                Prevent screenshots (Android only)
              </Text>
            </View>
          </View>
          <Switch
            value={screenshotProtection}
            onValueChange={setScreenshotProtection}
            trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
            thumbColor={screenshotProtection ? '#6366F1' : '#F3F4F6'}
          />
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="moon" size={20} color="#6366F1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme</Text>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
            thumbColor={darkMode ? '#6366F1' : '#F3F4F6'}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="copy" size={20} color="#6366F1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Clipboard Auto-Clear</Text>
              <Text style={styles.settingDescription}>{clipboardTimeout} seconds</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="trash" size={20} color="#6366F1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Clear Cache</Text>
              <Text style={styles.settingDescription}>Remove cached data</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="information-circle" size={20} color="#6366F1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>App Version</Text>
              <Text style={styles.settingDescription}>1.0.0</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="document-text" size={20} color="#6366F1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="document" size={20} color="#6366F1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Ionicons name="code" size={20} color="#6366F1" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Open Source Licenses</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Danger Zone</Text>

        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <View style={styles.settingInfo}>
            <View style={[styles.settingIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="log-out" size={20} color="#EF4444" />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: '#EF4444' }]}>Logout</Text>
              <Text style={styles.settingDescription}>Sign out of your account</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>secVault - Secure Password Manager</Text>
        <Text style={styles.footerText}>© 2026 All rights reserved</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});
