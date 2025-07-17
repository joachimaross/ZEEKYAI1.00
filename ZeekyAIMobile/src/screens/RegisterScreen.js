// Zeeky AI Mobile - Register Screen
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Text,
  useTheme,
  Avatar,
  Surface
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

import ApiService from '../services/ApiService';

export default function RegisterScreen({ navigation, onAuthChange }) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    const { username, email, password, confirmPassword } = formData;

    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await ApiService.register(email.trim(), password, username.trim());

      if (response.success) {
        Alert.alert('Success', 'Account created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              if (onAuthChange) {
                onAuthChange(true);
              }
            }
          }
        ]);
      } else {
        Alert.alert('Registration Failed', response.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Error', error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryContainer]}
            style={styles.headerGradient}
          >
            <Animatable.View animation="bounceIn" duration={1500}>
              <Avatar.Icon 
                size={60} 
                icon="account-plus" 
                style={styles.logo}
              />
            </Animatable.View>
            
            <Animatable.View animation="fadeInUp" duration={1000} delay={500}>
              <Title style={styles.title}>Create Account</Title>
              <Paragraph style={styles.subtitle}>
                Join Zeeky AI and unlock the future
              </Paragraph>
            </Animatable.View>
          </LinearGradient>

          {/* Registration Form */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={800}>
            <Surface style={styles.formCard}>
              <Card.Content>
                <View style={styles.formContainer}>
                  <TextInput
                    label="Username"
                    value={formData.username}
                    onChangeText={(value) => updateFormData('username', value)}
                    mode="outlined"
                    autoCapitalize="none"
                    left={<TextInput.Icon icon="account" />}
                    style={styles.input}
                    disabled={isLoading}
                  />

                  <TextInput
                    label="Email"
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value)}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    left={<TextInput.Icon icon="email" />}
                    style={styles.input}
                    disabled={isLoading}
                  />

                  <TextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon 
                        icon={showPassword ? "eye-off" : "eye"}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    style={styles.input}
                    disabled={isLoading}
                  />

                  <TextInput
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    left={<TextInput.Icon icon="lock-check" />}
                    style={styles.input}
                    disabled={isLoading}
                  />

                  <Button
                    mode="contained"
                    onPress={handleRegister}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.registerButton}
                    contentStyle={styles.buttonContent}
                  >
                    Create Account
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('Login')}
                    disabled={isLoading}
                    style={styles.loginButton}
                  >
                    Already have an account? Sign In
                  </Button>
                </View>
              </Card.Content>
            </Surface>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logo: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 8,
  },
  formCard: {
    margin: 20,
    borderRadius: 16,
    elevation: 4,
  },
  formContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  registerButton: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginButton: {
    alignSelf: 'center',
  },
});
