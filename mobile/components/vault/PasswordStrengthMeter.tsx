/**
 * Password Strength Meter Component
 * Visual representation of password strength
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PasswordStrength } from '@/types';
import { getPasswordStrengthColor, getPasswordStrengthLabel, getPasswordStrengthPercentage } from '@/utils/passwordStrength';

interface PasswordStrengthMeterProps {
  strength: PasswordStrength;
  showLabel?: boolean;
  style?: any;
}

export default function PasswordStrengthMeter({ 
  strength, 
  showLabel = true,
  style 
}: PasswordStrengthMeterProps) {
  const color = getPasswordStrengthColor(strength);
  const label = getPasswordStrengthLabel(strength);
  const percentage = getPasswordStrengthPercentage(strength);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.meterContainer}>
        <View style={styles.meterBackground}>
          <View 
            style={[
              styles.meterFill, 
              { 
                width: `${percentage}%`, 
                backgroundColor: color 
              }
            ]} 
          />
        </View>
        {showLabel && (
          <Text style={[styles.label, { color }]}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  meterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  meterBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },
});
