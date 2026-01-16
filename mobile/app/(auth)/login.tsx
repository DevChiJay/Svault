/**
 * Login Screen
 * User authentication with email and password
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/hooks/useAuth';
import { userLoginSchema, type UserLoginInput } from '@/schemas';
import { getErrorMessage } from '@/utils/errorHandling';
import { biometricService } from '@/services/biometric';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserLoginInput>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  React.useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await biometricService.isAvailable();
    const enabled = await biometricService.isBiometricLoginEnabled();
    setBiometricAvailable(available && enabled);
  };

  const onSubmit = async (data: UserLoginInput) => {
    try {
      await login(data);
      
      // Check if we should prompt for biometric setup
      const available = await biometricService.isAvailable();
      const enabled = await biometricService.isBiometricLoginEnabled();
      
      if (available && !enabled) {
        // Biometric is available but not enabled, ask user if they want to enable it
        const typeName = await biometricService.getBiometricTypeName();
        Alert.alert(
          'Enable Biometric Login?',
          `Would you like to use ${typeName} for faster login next time?`,
          [
            {
              text: 'Not Now',
              style: 'cancel',
              onPress: () => router.replace('/(main)/vault'),
            },
            {
              text: 'Enable',
              onPress: async () => {
                try {
                  const authenticated = await biometricService.authenticate(
                    `Enable ${typeName} login`
                  );
                  if (authenticated) {
                    await biometricService.enableBiometricLogin();
                  }
                } catch (error) {
                  console.error('Failed to enable biometric:', error);
                }
                router.replace('/(main)/vault');
              },
            },
          ]
        );
      } else {
        router.replace('/(main)/vault');
      }
    } catch (error) {
      const message = getErrorMessage(error);
      
      if (message.includes('not verified') || message.includes('verify your email')) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email address before logging in.',
          [
            { text: 'OK' },
            {
              text: 'Resend Verification',
              onPress: () => router.push('/(auth)/verify-email'),
            },
          ]
        );
      } else {
        Alert.alert('Login Failed', message);
      }
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const typeName = await biometricService.getBiometricTypeName();
      const success = await biometricService.authenticate(
        `Use ${typeName} to access your vault`
      );

      if (success) {
        // Biometric authentication successful, now verify the stored token
        const { tokenStorage } = await import('@/services/storage/tokenStorage');
        const hasToken = await tokenStorage.hasToken();
        
        if (!hasToken) {
          Alert.alert(
            'No Saved Session',
            'Please log in with your email and password first to enable biometric login.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Token exists, trigger a user refresh to validate it
        const { queryClient } = await import('@/utils/queryClient');
        const { queryKeys } = await import('@/utils/queryClient');
        
        try {
          // Invalidate and refetch user data to validate the token
          await queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
          await queryClient.refetchQueries({ queryKey: queryKeys.currentUser });
          
          // If we get here, token is valid
          router.replace('/(main)/vault');
        } catch (error) {
          // Token is invalid or expired
          await tokenStorage.clearAll();
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log in again.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      Alert.alert('Authentication Failed', getErrorMessage(error));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/icon.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Welcome to sVault</Text>
          <Text style={styles.subtitle}>Secure password management</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="your.email@example.com"
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoggingIn}
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      errors.password && styles.inputError,
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    editable={!isLoggingIn}
                  />
                )}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            style={[styles.button, isLoggingIn && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {biometricAvailable && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
            >
              <Ionicons name="finger-print" size={24} color="#6366f1" />
              <Text style={styles.biometricText}>Use Biometric Login</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Create New Account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 13,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  button: {
    height: 50,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#6366f1',
    borderRadius: 8,
    marginBottom: 24,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  secondaryButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#6366f1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
});
