/**
 * Vault Filters and Sorting Component
 * Filter and sort password entries
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PasswordStrength } from '@/types';

export type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'updated-asc' | 'updated-desc';

export interface FilterOptions {
  strengthFilter: PasswordStrength | 'all';
  dateRange: 'all' | 'week' | 'month' | 'year';
}

interface VaultFiltersProps {
  currentSort: SortOption;
  currentFilters: FilterOptions;
  onSortChange: (sort: SortOption) => void;
  onFiltersChange: (filters: FilterOptions) => void;
  entriesCount: number;
}

export default function VaultFilters({
  currentSort,
  currentFilters,
  onSortChange,
  onFiltersChange,
  entriesCount,
}: VaultFiltersProps) {
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const sortOptions = [
    { value: 'name-asc' as SortOption, label: 'Name (A-Z)', icon: 'text' as const },
    { value: 'name-desc' as SortOption, label: 'Name (Z-A)', icon: 'text' as const },
    { value: 'date-desc' as SortOption, label: 'Newest First', icon: 'calendar' as const },
    { value: 'date-asc' as SortOption, label: 'Oldest First', icon: 'calendar' as const },
    { value: 'updated-desc' as SortOption, label: 'Recently Updated', icon: 'time' as const },
    { value: 'updated-asc' as SortOption, label: 'Least Recently Updated', icon: 'time' as const },
  ];

  const strengthOptions = [
    { value: 'all', label: 'All Strengths', color: '#6B7280' },
    { value: 'weak', label: 'Weak', color: '#EF4444' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'strong', label: 'Strong', color: '#3B82F6' },
    { value: 'very_strong', label: 'Very Strong', color: '#10B981' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'year', label: 'Last Year' },
  ];

  const hasActiveFilters = currentFilters.strengthFilter !== 'all' || currentFilters.dateRange !== 'all';

  const getSortLabel = () => {
    return sortOptions.find(opt => opt.value === currentSort)?.label || 'Sort';
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.count}>{entriesCount} {entriesCount === 1 ? 'entry' : 'entries'}</Text>
        
        <View style={styles.actions}>
          {/* Sort Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="swap-vertical" size={18} color="#6366F1" />
            <Text style={styles.actionButtonText}>Sort</Text>
          </TouchableOpacity>

          {/* Filter Button */}
          <TouchableOpacity
            style={[styles.actionButton, hasActiveFilters && styles.actionButtonActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="funnel" size={18} color={hasActiveFilters ? '#FFFFFF' : '#6366F1'} />
            <Text style={[styles.actionButtonText, hasActiveFilters && styles.actionButtonTextActive]}>
              Filter
            </Text>
            {hasActiveFilters && <View style={styles.activeDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    currentSort === option.value && styles.modalOptionActive,
                  ]}
                  onPress={() => {
                    onSortChange(option.value);
                    setShowSortModal(false);
                  }}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={currentSort === option.value ? '#6366F1' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.modalOptionText,
                      currentSort === option.value && styles.modalOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {currentSort === option.value && (
                    <Ionicons name="checkmark" size={20} color="#6366F1" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Entries</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Password Strength Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Password Strength</Text>
                {strengthOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.modalOption,
                      currentFilters.strengthFilter === option.value && styles.modalOptionActive,
                    ]}
                    onPress={() => {
                      onFiltersChange({
                        ...currentFilters,
                        strengthFilter: option.value as PasswordStrength | 'all',
                      });
                    }}
                  >
                    <View
                      style={[styles.strengthDot, { backgroundColor: option.color }]}
                    />
                    <Text
                      style={[
                        styles.modalOptionText,
                        currentFilters.strengthFilter === option.value && styles.modalOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {currentFilters.strengthFilter === option.value && (
                      <Ionicons name="checkmark" size={20} color="#6366F1" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Date Range</Text>
                {dateRangeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.modalOption,
                      currentFilters.dateRange === option.value && styles.modalOptionActive,
                    ]}
                    onPress={() => {
                      onFiltersChange({
                        ...currentFilters,
                        dateRange: option.value as any,
                      });
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        currentFilters.dateRange === option.value && styles.modalOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {currentFilters.dateRange === option.value && (
                      <Ionicons name="checkmark" size={20} color="#6366F1" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    onFiltersChange({
                      strengthFilter: 'all',
                      dateRange: 'all',
                    });
                  }}
                >
                  <Text style={styles.clearButtonText}>Clear All Filters</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  count: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  actionButtonActive: {
    backgroundColor: '#6366F1',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
  },
  actionButtonTextActive: {
    color: '#FFFFFF',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionActive: {
    backgroundColor: '#F9FAFB',
  },
  modalOptionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  modalOptionTextActive: {
    fontWeight: '600',
    color: '#6366F1',
  },
  strengthDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  filterSection: {
    paddingTop: 16,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 20,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearButton: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});
