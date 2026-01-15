/**
 * Bulk Operations Component
 * Select and perform bulk actions on password entries
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PasswordEntry } from '@/types';
import { entriesService } from '@/services/api';
import { exportService, ExportOptions } from '@/services/export/exportService';

interface BulkOperationsProps {
  entries: PasswordEntry[];
  onOperationComplete?: () => void;
  onCancel?: () => void;
}

export default function BulkOperations({
  entries,
  onOperationComplete,
  onCancel,
}: BulkOperationsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedEntries = useMemo(() => {
    return entries.filter(entry => selectedIds.has(entry.entry_id));
  }, [entries, selectedIds]);

  const toggleSelection = (entryId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    setSelectedIds(new Set(entries.map(e => e.entry_id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) {
      Alert.alert('No Selection', 'Please select entries to delete.');
      return;
    }

    Alert.alert(
      'Confirm Bulk Delete',
      `Are you sure you want to delete ${selectedIds.size} password ${selectedIds.size === 1 ? 'entry' : 'entries'}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            let successCount = 0;
            let failCount = 0;

            try {
              for (const entryId of selectedIds) {
                try {
                  await entriesService.deleteEntry(entryId);
                  successCount++;
                } catch (error) {
                  failCount++;
                  console.error('Failed to delete entry:', entryId, error);
                }
              }

              Alert.alert(
                'Bulk Delete Complete',
                `Successfully deleted ${successCount} entries${failCount > 0 ? `\n${failCount} entries failed to delete.` : ''}`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      deselectAll();
                      onOperationComplete?.();
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Bulk delete failed. Please try again.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleBulkExport = async () => {
    if (selectedIds.size === 0) {
      Alert.alert('No Selection', 'Please select entries to export.');
      return;
    }

    Alert.alert(
      'Export Format',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'JSON',
          onPress: () => performBulkExport('json'),
        },
        {
          text: 'CSV',
          onPress: () => performBulkExport('csv'),
        },
      ]
    );
  };

  const performBulkExport = async (format: 'json' | 'csv') => {
    setIsProcessing(true);

    try {
      const options: ExportOptions = {
        format,
        includePasswords: false,
      };

      const result = await exportService.exportAndShare(selectedEntries, options);

      if (result.success) {
        Alert.alert(
          'Export Successful',
          `Exported ${selectedIds.size} entries to ${format.toUpperCase()} format.`,
          [
            {
              text: 'OK',
              onPress: () => {
                deselectAll();
              },
            },
          ]
        );
      } else {
        Alert.alert('Export Failed', result.error || 'An error occurred during export.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export entries. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderEntry = ({ item }: { item: PasswordEntry }) => {
    const isSelected = selectedIds.has(item.entry_id);

    return (
      <TouchableOpacity
        style={[styles.entryItem, isSelected && styles.entryItemSelected]}
        onPress={() => toggleSelection(item.entry_id)}
        disabled={isProcessing}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
        <View style={styles.entryInfo}>
          <Text style={styles.entryName} numberOfLines={1}>
            {item.website_name}
          </Text>
          <Text style={styles.entryUsername} numberOfLines={1}>
            {item.login_email_or_username}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Bulk Operations</Text>
          <Text style={styles.headerSubtitle}>
            {selectedIds.size} of {entries.length} selected
          </Text>
        </View>
        <TouchableOpacity onPress={onCancel} disabled={isProcessing}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Selection Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={selectAll}
          disabled={isProcessing}
        >
          <Ionicons name="checkbox-outline" size={20} color="#6366F1" />
          <Text style={styles.controlButtonText}>Select All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={deselectAll}
          disabled={isProcessing}
        >
          <Ionicons name="square-outline" size={20} color="#6366F1" />
          <Text style={styles.controlButtonText}>Deselect All</Text>
        </TouchableOpacity>
      </View>

      {/* Entry List */}
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.entry_id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.exportButton,
            (selectedIds.size === 0 || isProcessing) && styles.actionButtonDisabled,
          ]}
          onPress={handleBulkExport}
          disabled={selectedIds.size === 0 || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#6366F1" size="small" />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#6366F1" />
              <Text style={styles.exportButtonText}>Export Selected</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.deleteButton,
            (selectedIds.size === 0 || isProcessing) && styles.actionButtonDisabled,
          ]}
          onPress={handleBulkDelete}
          disabled={selectedIds.size === 0 || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Delete Selected</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  controlButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  entryItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  entryUsername: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  exportButton: {
    backgroundColor: '#EEF2FF',
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6366F1',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
