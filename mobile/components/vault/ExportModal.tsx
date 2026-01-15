/**
 * Export Modal Component
 * UI for exporting password entries
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { exportService, ExportOptions } from '@/services/export/exportService';
import { PasswordEntry } from '@/types';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  entries: PasswordEntry[];
  onExportComplete?: () => void;
}

export default function ExportModal({
  visible,
  onClose,
  entries,
  onExportComplete,
}: ExportModalProps) {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (entries.length === 0) {
      Alert.alert('No Entries', 'There are no password entries to export.');
      return;
    }

    // Security warning
    Alert.alert(
      'Security Warning',
      'Exported files contain sensitive information. Store them securely and delete after use.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: async () => {
            setIsExporting(true);
            try {
              const options: ExportOptions = {
                format,
                includePasswords: false, // Never export actual passwords for security
              };

              const result = await exportService.exportAndShare(entries, options);

              if (result.success) {
                Alert.alert(
                  'Export Successful',
                  `Exported ${entries.length} entries to ${format.toUpperCase()} format.`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        onExportComplete?.();
                        onClose();
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
              setIsExporting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Export Password Vault</Text>
            <TouchableOpacity onPress={onClose} disabled={isExporting}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Entry Count */}
            <View style={styles.infoCard}>
              <Ionicons name="shield-checkmark" size={32} color="#6366F1" />
              <Text style={styles.infoText}>
                {entries.length} password {entries.length === 1 ? 'entry' : 'entries'} will be exported
              </Text>
            </View>

            {/* Format Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Export Format</Text>
              
              <TouchableOpacity
                style={[styles.formatOption, format === 'json' && styles.formatOptionActive]}
                onPress={() => setFormat('json')}
                disabled={isExporting}
              >
                <View style={styles.formatOptionHeader}>
                  <Ionicons
                    name="document-text"
                    size={24}
                    color={format === 'json' ? '#6366F1' : '#6B7280'}
                  />
                  <View style={styles.formatOptionContent}>
                    <Text
                      style={[
                        styles.formatOptionTitle,
                        format === 'json' && styles.formatOptionTitleActive,
                      ]}
                    >
                      JSON Format
                    </Text>
                    <Text style={styles.formatOptionDescription}>
                      Structured data format, easy to re-import
                    </Text>
                  </View>
                  {format === 'json' && (
                    <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.formatOption, format === 'csv' && styles.formatOptionActive]}
                onPress={() => setFormat('csv')}
                disabled={isExporting}
              >
                <View style={styles.formatOptionHeader}>
                  <Ionicons
                    name="grid"
                    size={24}
                    color={format === 'csv' ? '#6366F1' : '#6B7280'}
                  />
                  <View style={styles.formatOptionContent}>
                    <Text
                      style={[
                        styles.formatOptionTitle,
                        format === 'csv' && styles.formatOptionTitleActive,
                      ]}
                    >
                      CSV Format
                    </Text>
                    <Text style={styles.formatOptionDescription}>
                      Compatible with spreadsheet apps
                    </Text>
                  </View>
                  {format === 'csv' && (
                    <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Security Notice */}
            <View style={styles.warningCard}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <Text style={styles.warningText}>
                Passwords are not included in exports for security. You'll need to access them from within the app.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isExporting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
                onPress={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="download" size={18} color="#FFFFFF" />
                    <Text style={styles.exportButtonText}>Export</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4338CA',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  formatOption: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  formatOptionActive: {
    borderColor: '#6366F1',
    backgroundColor: '#F9FAFB',
  },
  formatOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formatOptionContent: {
    flex: 1,
  },
  formatOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  formatOptionTitleActive: {
    color: '#6366F1',
  },
  formatOptionDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  warningCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
