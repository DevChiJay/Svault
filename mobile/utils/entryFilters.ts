/**
 * Entry Filters and Sorting Utilities
 * Helper functions for filtering and sorting password entries
 */

import { PasswordEntry, PasswordStrength } from '@/types';
import type { SortOption, FilterOptions } from '@/components/vault/VaultFilters';

/**
 * Apply filters and sorting to entries
 */
export function applyFiltersAndSort(
  entries: PasswordEntry[],
  filters: FilterOptions,
  sort: SortOption
): PasswordEntry[] {
  let filtered = [...entries];

  // Apply strength filter
  if (filters.strengthFilter !== 'all') {
    filtered = filtered.filter(
      (entry) => entry.password_strength === filters.strengthFilter
    );
  }

  // Apply date range filter
  if (filters.dateRange !== 'all') {
    const now = new Date();
    const cutoffDate = new Date();

    switch (filters.dateRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    filtered = filtered.filter(
      (entry) => new Date(entry.created_at) >= cutoffDate
    );
  }

  // Apply sorting
  return sortEntries(filtered, sort);
}

/**
 * Sort entries by given option
 */
export function sortEntries(
  entries: PasswordEntry[],
  sort: SortOption
): PasswordEntry[] {
  const sorted = [...entries];

  sorted.sort((a, b) => {
    switch (sort) {
      case 'name-asc':
        return a.website_name.localeCompare(b.website_name);
      case 'name-desc':
        return b.website_name.localeCompare(a.website_name);
      case 'date-asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'date-desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'updated-asc':
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      case 'updated-desc':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      default:
        return 0;
    }
  });

  return sorted;
}

/**
 * Filter entries by strength
 */
export function filterByStrength(
  entries: PasswordEntry[],
  strength: PasswordStrength | 'all'
): PasswordEntry[] {
  if (strength === 'all') return entries;
  return entries.filter((entry) => entry.password_strength === strength);
}

/**
 * Filter entries by date range
 */
export function filterByDateRange(
  entries: PasswordEntry[],
  range: 'all' | 'week' | 'month' | 'year'
): PasswordEntry[] {
  if (range === 'all') return entries;

  const now = new Date();
  const cutoffDate = new Date();

  switch (range) {
    case 'week':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      cutoffDate.setDate(now.getDate() - 30);
      break;
    case 'year':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return entries.filter((entry) => new Date(entry.created_at) >= cutoffDate);
}

/**
 * Search entries by query (website name or login)
 */
export function searchEntries(
  entries: PasswordEntry[],
  query: string
): PasswordEntry[] {
  if (!query.trim()) return entries;

  const searchTerm = query.toLowerCase().trim();

  return entries.filter(
    (entry) =>
      entry.website_name.toLowerCase().includes(searchTerm) ||
      entry.login_email_or_username.toLowerCase().includes(searchTerm) ||
      entry.website_url?.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get entries that need attention (weak, old, or reused passwords)
 */
export function getEntriesNeedingAttention(
  entries: PasswordEntry[]
): {
  weak: PasswordEntry[];
  old: PasswordEntry[];
  reused: PasswordEntry[];
} {
  // Weak passwords
  const weak = entries.filter(
    (entry) =>
      entry.password_strength === 'weak' || entry.password_strength === 'medium'
  );

  // Old passwords (90+ days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const old = entries.filter(
    (entry) => new Date(entry.updated_at) < ninetyDaysAgo
  );

  // Reused passwords (entries with same username across different sites)
  const usernameMap = new Map<string, PasswordEntry[]>();
  entries.forEach((entry) => {
    const key = entry.login_email_or_username.toLowerCase();
    if (!usernameMap.has(key)) {
      usernameMap.set(key, []);
    }
    usernameMap.get(key)!.push(entry);
  });

  const reused = Array.from(usernameMap.values())
    .filter((group) => group.length > 1)
    .flat();

  return { weak, old, reused };
}

/**
 * Calculate vault statistics
 */
export function calculateVaultStats(entries: PasswordEntry[]) {
  const total = entries.length;
  
  if (total === 0) {
    return {
      total: 0,
      weak: 0,
      medium: 0,
      strong: 0,
      veryStrong: 0,
      weakPercentage: 0,
      strongPercentage: 0,
      averageAge: 0,
    };
  }

  const weak = entries.filter((e) => e.password_strength === 'weak').length;
  const medium = entries.filter((e) => e.password_strength === 'medium').length;
  const strong = entries.filter((e) => e.password_strength === 'strong').length;
  const veryStrong = entries.filter((e) => e.password_strength === 'very_strong').length;

  // Calculate average password age
  const now = Date.now();
  const totalAge = entries.reduce((sum, entry) => {
    const age = now - new Date(entry.updated_at).getTime();
    return sum + age;
  }, 0);
  const averageAge = Math.floor(totalAge / entries.length / (1000 * 60 * 60 * 24)); // in days

  return {
    total,
    weak,
    medium,
    strong,
    veryStrong,
    weakPercentage: Math.round(((weak + medium) / total) * 100),
    strongPercentage: Math.round(((strong + veryStrong) / total) * 100),
    averageAge,
  };
}

/**
 * Group entries by website domain
 */
export function groupByDomain(entries: PasswordEntry[]): Map<string, PasswordEntry[]> {
  const groups = new Map<string, PasswordEntry[]>();

  entries.forEach((entry) => {
    const domain = extractDomain(entry.website_url || entry.website_name);
    if (!groups.has(domain)) {
      groups.set(domain, []);
    }
    groups.get(domain)!.push(entry);
  });

  return groups;
}

/**
 * Extract domain from URL or website name
 */
function extractDomain(urlOrName: string): string {
  try {
    const url = new URL(urlOrName.startsWith('http') ? urlOrName : `https://${urlOrName}`);
    return url.hostname.replace('www.', '');
  } catch {
    // If not a valid URL, use the name as-is
    return urlOrName.toLowerCase().replace('www.', '');
  }
}
