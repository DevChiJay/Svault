/**
 * Security Insights Component
 * Dashboard showing vault security health
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PasswordEntry, PasswordStrength } from '@/types';
import { useRouter } from 'expo-router';

interface SecurityInsightsProps {
  entries: PasswordEntry[];
}

interface SecurityIssue {
  type: 'weak' | 'reused' | 'old';
  count: number;
  severity: 'high' | 'medium' | 'low';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  description: string;
  entries: PasswordEntry[];
}

export default function SecurityInsights({ entries }: SecurityInsightsProps) {
  const router = useRouter();

  const insights = useMemo(() => {
    const weakPasswords = entries.filter(
      entry => entry.password_strength === 'weak' || entry.password_strength === 'medium'
    );

    // Check for reused passwords by analyzing entries
    const passwordMap = new Map<string, PasswordEntry[]>();
    entries.forEach(entry => {
      const key = `${entry.login_email_or_username}`;
      if (!passwordMap.has(key)) {
        passwordMap.set(key, []);
      }
      passwordMap.get(key)!.push(entry);
    });
    
    const reusedEntries = Array.from(passwordMap.values())
      .filter(group => group.length > 1)
      .flat();

    // Check for old passwords (not updated in 90+ days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const oldPasswords = entries.filter(
      entry => new Date(entry.updated_at) < ninetyDaysAgo
    );

    const issues: SecurityIssue[] = [];

    if (weakPasswords.length > 0) {
      issues.push({
        type: 'weak',
        count: weakPasswords.length,
        severity: 'high',
        icon: 'alert-circle',
        color: '#EF4444',
        title: 'Weak Passwords',
        description: `${weakPasswords.length} password${weakPasswords.length > 1 ? 's' : ''} need strengthening`,
        entries: weakPasswords,
      });
    }

    if (reusedEntries.length > 0) {
      issues.push({
        type: 'reused',
        count: reusedEntries.length,
        severity: 'high',
        icon: 'copy',
        color: '#F59E0B',
        title: 'Reused Passwords',
        description: `${reusedEntries.length} password${reusedEntries.length > 1 ? 's are' : ' is'} used multiple times`,
        entries: reusedEntries,
      });
    }

    if (oldPasswords.length > 0) {
      issues.push({
        type: 'old',
        count: oldPasswords.length,
        severity: 'medium',
        icon: 'time',
        color: '#6366F1',
        title: 'Old Passwords',
        description: `${oldPasswords.length} password${oldPasswords.length > 1 ? 's' : ''} over 90 days old`,
        entries: oldPasswords,
      });
    }

    return issues;
  }, [entries]);

  const calculateVaultHealth = useMemo(() => {
    if (entries.length === 0) return 100;

    const weakCount = insights.find(i => i.type === 'weak')?.count || 0;
    const reusedCount = insights.find(i => i.type === 'reused')?.count || 0;
    const oldCount = insights.find(i => i.type === 'old')?.count || 0;

    const totalIssues = weakCount * 2 + reusedCount * 2 + oldCount;
    const maxPossibleIssues = entries.length * 5;
    const health = Math.max(0, Math.round(100 - (totalIssues / maxPossibleIssues) * 100));

    return health;
  }, [entries, insights]);

  const getHealthColor = (health: number) => {
    if (health >= 80) return '#10B981';
    if (health >= 60) return '#3B82F6';
    if (health >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const getHealthLabel = (health: number) => {
    if (health >= 80) return 'Excellent';
    if (health >= 60) return 'Good';
    if (health >= 40) return 'Fair';
    return 'Poor';
  };

  if (entries.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Security Insights</Text>
      
      {/* Vault Health Score */}
      <View style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <Text style={styles.healthTitle}>Vault Health</Text>
          <Text style={[styles.healthScore, { color: getHealthColor(calculateVaultHealth) }]}>
            {calculateVaultHealth}%
          </Text>
        </View>
        <View style={styles.healthMeter}>
          <View style={styles.healthMeterBg}>
            <View
              style={[
                styles.healthMeterFill,
                {
                  width: `${calculateVaultHealth}%`,
                  backgroundColor: getHealthColor(calculateVaultHealth),
                },
              ]}
            />
          </View>
        </View>
        <Text style={styles.healthLabel}>{getHealthLabel(calculateVaultHealth)}</Text>
      </View>

      {/* Security Issues */}
      {insights.length > 0 && (
        <View style={styles.issuesContainer}>
          <Text style={styles.issuesTitle}>Issues Requiring Attention</Text>
          {insights.map((issue, index) => (
            <TouchableOpacity
              key={index}
              style={styles.issueCard}
              onPress={() => {
                // Navigate to filtered view (would need to implement)
                console.log('Show entries with issue:', issue.type);
              }}
            >
              <View style={[styles.issueIcon, { backgroundColor: `${issue.color}20` }]}>
                <Ionicons name={issue.icon} size={24} color={issue.color} />
              </View>
              <View style={styles.issueContent}>
                <Text style={styles.issueTitle}>{issue.title}</Text>
                <Text style={styles.issueDescription}>{issue.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {insights.length === 0 && (
        <View style={styles.allGoodCard}>
          <Ionicons name="checkmark-circle" size={48} color="#10B981" />
          <Text style={styles.allGoodTitle}>All Good!</Text>
          <Text style={styles.allGoodText}>
            Your vault is secure with no issues detected
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  healthScore: {
    fontSize: 32,
    fontWeight: '700',
  },
  healthMeter: {
    marginBottom: 8,
  },
  healthMeterBg: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  healthMeterFill: {
    height: '100%',
    borderRadius: 6,
  },
  healthLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  issuesContainer: {
    marginTop: 8,
  },
  issuesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  issueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  issueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  issueContent: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  allGoodCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  allGoodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
    marginTop: 12,
    marginBottom: 8,
  },
  allGoodText: {
    fontSize: 14,
    color: '#15803D',
    textAlign: 'center',
  },
});
