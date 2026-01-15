/**
 * Import Modal Component
 * UI for importing password entries
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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { importService, ImportResult } from '@/services/import/importService';
import { entriesService } from '@/services/api';
import { PasswordEntryCreate } from '@/types';

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImportComplete?: (count: number) => void;
}

export default function ImportModal({
  visible,
  onClose,
  onImportComplete,
}: ImportModalProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handlePickFile = async () => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importService.pickAndImport();
      
      if (result.success && result.entries) {
        setImportResult(result);
      } else {
        Alert.alert('Import Error', result.error || 'Failed to import file');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read file. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importResult?.entries || importResult.entries.length === 0) return;

    Alert.alert(
      'Confirm Import',
      `Import ${importResult.validCount} password entries?${importResult.invalidCount ? `\n\n${importResult.invalidCount} invalid entries will be skipped.` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            setIsSaving(true);
            let successCount = 0;
            let failCount = 0;

            try {
              // Import entries one by one (could be optimized with batch API endpoint)
              for (const entry of importResult.entries) {
                try {
                  await entriesService.createEntry(entry);
                  successCount++;
                } catch (error) {
                  failCount++;
                  console.error('Failed to import entry:', error);
                }
              }

              if (successCount > 0) {
                Alert.alert(
                  'Import Complete',
                  `Successfully imported ${successCount} entries${failCount > 0 ? `\n${failCount} entries failed to import.` : ''}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        onImportComplete?.(successCount);
                        handleClose();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert('Import Failed', 'No entries were imported. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'Import failed. Please try again.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    setImportResult(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Import Password Entries</Text>
            <TouchableOpacity onPress={handleClose} disabled={isImporting || isSaving}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {!importResult ? (
              <>
                {/* Instructions */}
                <View style={styles.instructionsCard}>
                  <Ionicons name="information-circle" size={32} color="#6366F1" />
                  <View style={styles.instructionsContent}>
                    <Text style={styles.instructionsTitle}>Supported Formats</Text>
                    <Text style={styles.instructionsText}>
                      • JSON files exported from secVault{'\n'}
                      • CSV files with headers (Website Name, URL, Username/Email, Password, Notes)
                    </Text>
                  </View>
                </View>

                {/* Required Fields */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Required Fields</Text>
                  <View style={styles.fieldList}>
                    <View style={styles.fieldItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text style={styles.fieldText}>Website Name</Text>
                    </View>
                    <View style={styles.fieldItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text style={styles.fieldText}>Username/Email</Text>
                    </View>
                    <View style={styles.fieldItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text style={styles.fieldText}>Password</Text>
                    </View>
                  </View>
                </View>

                {/* Optional Fields */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Optional Fields</Text>
                  <View style={styles.fieldList}>
                    <View style={styles.fieldItem}>
                      <Ionicons name="ellipse-outline" size={20} color="#6B7280" />
                      <Text style={styles.fieldText}>Website URL</Text>
                    </View>
                    <View style={styles.fieldItem}>
                      <Ionicons name="ellipse-outline" size={20} color="#6B7280" />
                      <Text style={styles.fieldText}>Notes</Text>
                    </View>
                  </View>
                </View>

                {/* Security Warning */}
                <View style={styles.warningCard}>
                  <Ionicons name="warning" size={20} color="#F59E0B" />
                  <Text style={styles.warningText}>
                    Only import files from trusted sources. Ensure the file is stored securely.
                  </Text>
                </View>

                {/* Pick File Button */}
                <TouchableOpacity
                  style={[styles.pickButton, (isImporting || isSaving) && styles.pickButtonDisabled]}
                  onPress={handlePickFile}
                  disabled={isImporting || isSaving}
                >
                  {isImporting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="document-text" size={20} color="#FFFFFF" />
                      <Text style={styles.pickButtonText}>Choose File</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Import Preview */}
                <View style={styles.previewCard}>
                  <View style={styles.previewHeader}>
                    <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                    <Text style={styles.previewTitle}>File Parsed Successfully</Text>
                  </View>

                  <View style={styles.previewStats}>
                    <View style={styles.previewStat}>
                      <Text style={styles.previewStatValue}>{importResult.validCount}</Text>
                      <Text style={styles.previewStatLabel}>Valid Entries</Text>
                    </View>
                    {importResult.invalidCount! > 0 && (
                      <View style={styles.previewStat}>
                        <Text style={[styles.previewStatValue, { color: '#EF4444' }]}>
                          {importResult.invalidCount}
                        </Text>
                        <Text style={styles.previewStatLabel}>Invalid Entries</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Error Details */}
                {importResult.errors && importResult.errors.length > 0 && (
                  <View style={styles.errorsCard}>
                    <Text style={styles.errorsTitle}>
                      Issues Found ({importResult.errors.length})
                    </Text>
                    <ScrollView style={styles.errorsList}>
                      {importResult.errors.slice(0, 10).map((error, index) => (
                        <Text key={index} style={styles.errorText}>
                          • {error}
                        </Text>
                      ))}
                      {importResult.errors.length > 10 && (
                        <Text style={styles.errorText}>
                          ... and {importResult.errors.length - 10} more
                        </Text>
                      )}
                    </ScrollView>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setImportResult(null)}
                    disabled={isSaving}
                  >
                    <Text style={styles.cancelButtonText}>Choose Different File</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.importButton, isSaving && styles.importButtonDisabled]}
                    onPress={handleConfirmImport}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                        <Text style={styles.importButtonText}>Import</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
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
  instructionsCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    marginBottom: 24,
  },
  instructionsContent: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4338CA',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 13,
    color: '#4338CA',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  fieldList: {
    gap: 8,
  },
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldText: {
    fontSize: 14,
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
  pickButton: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickButtonDisabled: {
    opacity: 0.6,
  },
  pickButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewCard: {
    padding: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    marginBottom: 20,
  },
  previewHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginTop: 12,
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewStat: {
    alignItems: 'center',
  },
  previewStatValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
  },
  previewStatLabel: {
    fontSize: 13,
    color: '#15803D',
    marginTop: 4,
  },
  errorsCard: {
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    marginBottom: 20,
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 12,
  },
  errorsList: {
    maxHeight: 150,
  },
  errorText: {
    fontSize: 12,
    color: '#B91C1C',
    marginBottom: 6,
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
  importButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  importButtonDisabled: {
    opacity: 0.6,
  },
  importButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
