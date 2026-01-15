/**
 * Clipboard Countdown Component
 * Visual countdown timer for clipboard auto-clear
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clipboardManager } from '@/utils/clipboard';
import { SECURITY_CONFIG } from '@/constants/config';

interface ClipboardCountdownProps {
  onClear?: () => void;
}

export default function ClipboardCountdown({ onClear }: ClipboardCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    Math.ceil(SECURITY_CONFIG.CLIPBOARD_CLEAR_TIMEOUT / 1000)
  );
  const [isVisible, setIsVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleHide();
          onClear?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleShow = () => {
    setTimeRemaining(Math.ceil(SECURITY_CONFIG.CLIPBOARD_CLEAR_TIMEOUT / 1000));
    setIsVisible(true);
  };

  const handleHide = () => {
    setIsVisible(false);
  };

  const handleClearNow = async () => {
    await clipboardManager.clear();
    handleHide();
    onClear?.();
  };

  // Expose method to show countdown (can be called from parent)
  React.useImperativeHandle(React.useRef(null), () => ({
    show: handleShow,
    hide: handleHide,
  }));

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Ionicons name="copy-outline" size={20} color="#6366F1" />
        <Text style={styles.message}>
          Clipboard will clear in <Text style={styles.time}>{timeRemaining}s</Text>
        </Text>
        <TouchableOpacity onPress={handleClearNow} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear Now</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${(timeRemaining / (SECURITY_CONFIG.CLIPBOARD_CLEAR_TIMEOUT / 1000)) * 100}%`,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

export function useClipboardCountdown() {
  const [showCountdown, setShowCountdown] = useState(false);

  const startCountdown = () => {
    setShowCountdown(true);
  };

  const stopCountdown = () => {
    setShowCountdown(false);
  };

  return {
    showCountdown,
    startCountdown,
    stopCountdown,
    ClipboardCountdown,
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  time: {
    fontWeight: '700',
    color: '#6366F1',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
  },
});
