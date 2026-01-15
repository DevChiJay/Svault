/**
 * Export Service
 * Export password entries to JSON and CSV formats
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { PasswordEntry } from '@/types';

export interface ExportOptions {
  format: 'json' | 'csv';
  includePasswords?: boolean;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

class ExportService {
  /**
   * Export entries to file
   */
  async exportEntries(
    entries: PasswordEntry[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const { format, includePasswords = false } = options;

      let content: string;
      let fileName: string;
      let mimeType: string;

      if (format === 'json') {
        content = this.generateJSON(entries, includePasswords);
        fileName = `secvault_export_${this.getTimestamp()}.json`;
        mimeType = 'application/json';
      } else {
        content = this.generateCSV(entries, includePasswords);
        fileName = `secvault_export_${this.getTimestamp()}.csv`;
        mimeType = 'text/csv';
      }

      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      return {
        success: true,
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  /**
   * Export and share file
   */
  async exportAndShare(
    entries: PasswordEntry[],
    options: ExportOptions
  ): Promise<ExportResult> {
    const result = await this.exportEntries(entries, options);

    if (result.success && result.filePath) {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(result.filePath, {
          mimeType: options.format === 'json' ? 'application/json' : 'text/csv',
          dialogTitle: 'Export Password Vault',
          UTI: options.format === 'json' ? 'public.json' : 'public.comma-separated-values-text',
        });
      }
    }

    return result;
  }

  /**
   * Generate JSON export
   */
  private generateJSON(entries: PasswordEntry[], includePasswords: boolean): string {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      entries: entries.map(entry => ({
        website_name: entry.website_name,
        website_url: entry.website_url || '',
        login_email_or_username: entry.login_email_or_username,
        // Note: passwords are not included in export for security
        // Users will need to reveal them individually from the API
        password: includePasswords ? '[ENCRYPTED - REVEAL FROM APP]' : undefined,
        notes: entry.notes || '',
        password_strength: entry.password_strength,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      })),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Generate CSV export
   */
  private generateCSV(entries: PasswordEntry[], includePasswords: boolean): string {
    const headers = [
      'Website Name',
      'Website URL',
      'Username/Email',
      includePasswords ? 'Password' : null,
      'Notes',
      'Strength',
      'Created',
      'Updated',
    ].filter(Boolean);

    const rows = entries.map(entry => [
      this.escapeCSV(entry.website_name),
      this.escapeCSV(entry.website_url || ''),
      this.escapeCSV(entry.login_email_or_username),
      includePasswords ? '[ENCRYPTED - REVEAL FROM APP]' : null,
      this.escapeCSV(entry.notes || ''),
      entry.password_strength,
      entry.created_at,
      entry.updated_at,
    ].filter(v => v !== null));

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Escape CSV field
   */
  private escapeCSV(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Get timestamp for filename
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }

  /**
   * Delete exported file
   */
  async deleteExportFile(filePath: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(filePath, { idempotent: true });
    } catch (error) {
      console.warn('Failed to delete export file:', error);
    }
  }
}

export const exportService = new ExportService();
