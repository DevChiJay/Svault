/**
 * Vault Dashboard Screen
 * Main screen showing all password entries with Phase 3 features
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useEntries, useSearchEntries } from '@/hooks/useEntries';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { PasswordEntry } from '@/types';
import { getPasswordStrengthColor } from '@/utils/passwordStrength';
import { formatDate } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import OfflineBanner from '@/components/common/OfflineBanner';
import AnimatedCard from '@/components/common/AnimatedCard';

export default function VaultScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'website' | 'email'>('website');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 500);
  
  const { 
    entries, 
    isLoading, 
    refetch,
    totalPages,
  } = useEntries(page);

  const {
    entries: searchResults,
    isSearching,
  } = useSearchEntries(searchType, debouncedSearch, page);

  const displayEntries = debouncedSearch.length > 0 ? searchResults : entries;
  const loading = debouncedSearch.length > 0 ? isSearching : isLoading;

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const renderEntryCard = ({ item, index }: { item: PasswordEntry; index: number }) => (
    <AnimatedCard delay={index * 50}>
      <TouchableOpacity
        style={styles.entryCard}
        onPress={() => router.push(`/(main)/entry/${item.entry_id}`)}
      >
        <View style={styles.entryHeader}>
          <View style={styles.entryIcon}>
            <Ionicons name="globe-outline" size={24} color="#6366f1" />
          </View>
          <View style={styles.entryInfo}>
            <Text style={styles.entryTitle} numberOfLines={1}>
              {item.website_name}
            </Text>
            <Text style={styles.entryUsername} numberOfLines={1}>
              {item.login_email_or_username}
            </Text>
          </View>
          <View style={styles.entryMeta}>
            <View
              style={[
                styles.strengthIndicator,
                { backgroundColor: getPasswordStrengthColor(item.password_strength) },
              ]}
            />
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </View>
        {item.website_url && (
          <Text style={styles.entryUrl} numberOfLines={1}>
            {item.website_url}
          </Text>
        )}
        <Text style={styles.entryDate}>
          Updated {formatDate(item.updated_at)}
        </Text>
      </TouchableOpacity>
    </AnimatedCard>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="shield-outline"
      title={debouncedSearch ? "No Matches Found" : "No Passwords Yet"}
      description={
        debouncedSearch
          ? "Try adjusting your search query"
          : "Add your first password to get started with secVault"
      }
      actionLabel={!debouncedSearch ? "Add Password" : undefined}
      onAction={!debouncedSearch ? () => router.push('/(main)/entry/new') : undefined}
    />
  );

  return (
    <View style={styles.container}>
      {/* Offline Banner */}
      <OfflineBanner />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>secVault</Text>
          <Text style={styles.headerSubtitle}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search passwords..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.searchTypeToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, searchType === 'website' && styles.toggleButtonActive]}
            onPress={() => setSearchType('website')}
          >
            <Text style={[styles.toggleText, searchType === 'website' && styles.toggleTextActive]}>
              Website
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, searchType === 'email' && styles.toggleButtonActive]}
            onPress={() => setSearchType('email')}
          >
            <Text style={[styles.toggleText, searchType === 'email' && styles.toggleTextActive]}>
              Username
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Entries List */}
      {loading && displayEntries.length === 0 ? (
        <LoadingSpinner message="Loading your vault..." />
      ) : (
        <FlatList
          data={displayEntries}
          renderItem={renderEntryCard}
          keyExtractor={(item) => item.entry_id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              tintColor="#6366f1"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  toggleTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  searchTypeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#ffffff',
  },
  toggleText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  entryUsername: {
    fontSize: 14,
    color: '#6b7280',
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  entryUrl: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
