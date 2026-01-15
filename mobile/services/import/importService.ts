/**
 * Import Service
 * Import password entries from JSON and CSV formats
 */

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { PasswordEntryCreate } from '@/types';

export interface ImportResult {
  success: boolean;
  entries?: PasswordEntryCreate[];
  error?: string;
  validCount?: number;
  invalidCount?: number;
  errors?: string[];
}

interface ImportedEntry {
  website_name: string;
  website_url?: string;
  login_email_or_username: string;
  password: string;
  notes?: string;
}

class ImportService {
  /**
   * Pick and import file
   */
  async pickAndImport(): Promise<ImportResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/csv', 'text/comma-separated-values'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return {
          success: false,
          error: 'Import cancelled',
        };
      }

      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Determine format from mime type or extension
      const isJSON = file.mimeType === 'application/json' || file.name.endsWith('.json');
      
      if (isJSON) {
        return this.importJSON(content);
      } else {
        return this.importCSV(content);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Import failed',
      };
    }
  }

  /**
   * Import from JSON
   */
  private importJSON(content: string): ImportResult {
    try {
      const data = JSON.parse(content);
      
      let entries: ImportedEntry[];
      
      // Handle secVault export format
      if (data.entries && Array.isArray(data.entries)) {
        entries = data.entries;
      } 
      // Handle direct array format
      else if (Array.isArray(data)) {
        entries = data;
      } 
      else {
        return {
          success: false,
          error: 'Invalid JSON format. Expected an array of entries.',
        };
      }

      return this.validateAndConvertEntries(entries);
    } catch (error) {
      return {
        success: false,
        error: 'Invalid JSON file',
      };
    }
  }

  /**
   * Import from CSV
   */
  private importCSV(content: string): ImportResult {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        return {
          success: false,
          error: 'CSV file is empty or has no data rows',
        };
      }

      const headers = this.parseCSVLine(lines[0]);
      const entries: ImportedEntry[] = [];

      // Map common header names
      const headerMap = this.createHeaderMap(headers);

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        
        if (values.length === 0) continue;

        const entry: any = {};
        
        values.forEach((value, index) => {
          const headerKey = headerMap.get(index);
          if (headerKey) {
            entry[headerKey] = value;
          }
        });

        if (entry.website_name && entry.login_email_or_username && entry.password) {
          entries.push(entry);
        }
      }

      return this.validateAndConvertEntries(entries);
    } catch (error) {
      return {
        success: false,
        error: 'Invalid CSV file',
      };
    }
  }

  /**
   * Parse CSV line (handles quoted fields)
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Create header mapping for CSV
   */
  private createHeaderMap(headers: string[]): Map<number, string> {
    const map = new Map<number, string>();
    
    const headerMappings: Record<string, string> = {
      'website name': 'website_name',
      'name': 'website_name',
      'site': 'website_name',
      'website': 'website_name',
      'website url': 'website_url',
      'url': 'website_url',
      'username': 'login_email_or_username',
      'email': 'login_email_or_username',
      'login': 'login_email_or_username',
      'username/email': 'login_email_or_username',
      'login email or username': 'login_email_or_username',
      'password': 'password',
      'notes': 'notes',
      'note': 'notes',
    };

    headers.forEach((header, index) => {
      const normalized = header.toLowerCase().trim();
      const mappedKey = headerMappings[normalized];
      if (mappedKey) {
        map.set(index, mappedKey);
      }
    });

    return map;
  }

  /**
   * Validate and convert imported entries
   */
  private validateAndConvertEntries(entries: ImportedEntry[]): ImportResult {
    const validEntries: PasswordEntryCreate[] = [];
    const errors: string[] = [];
    let invalidCount = 0;

    entries.forEach((entry, index) => {
      try {
        // Validate required fields
        if (!entry.website_name?.trim()) {
          throw new Error('Missing website name');
        }
        if (!entry.login_email_or_username?.trim()) {
          throw new Error('Missing username/email');
        }
        if (!entry.password?.trim()) {
          throw new Error('Missing password');
        }

        // Validate field lengths
        if (entry.website_name.length > 200) {
          throw new Error('Website name too long (max 200 characters)');
        }
        if (entry.login_email_or_username.length > 200) {
          throw new Error('Username/email too long (max 200 characters)');
        }
        if (entry.notes && entry.notes.length > 1000) {
          throw new Error('Notes too long (max 1000 characters)');
        }

        // Create valid entry
        const validEntry: PasswordEntryCreate = {
          website_name: entry.website_name.trim(),
          website_url: entry.website_url?.trim() || undefined,
          login_email_or_username: entry.login_email_or_username.trim(),
          password: entry.password.trim(),
          notes: entry.notes?.trim() || undefined,
        };

        validEntries.push(validEntry);
      } catch (error) {
        invalidCount++;
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Invalid entry'}`);
      }
    });

    if (validEntries.length === 0) {
      return {
        success: false,
        error: 'No valid entries found in file',
        errors,
      };
    }

    return {
      success: true,
      entries: validEntries,
      validCount: validEntries.length,
      invalidCount,
      errors: invalidCount > 0 ? errors : undefined,
    };
  }
}

export const importService = new ImportService();
