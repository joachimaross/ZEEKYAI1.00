// Zeeky AI Mobile - Login Screen
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions
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
  Divider,
  Surface
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

import ApiService from '../services/ApiService';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation, onAuthChange }) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await ApiService.login(email.trim(), password);

      if (response.success) {
        Alert.alert('Success', 'Welcome to Zeeky AI!', [
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
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Error',
        error.message || 'Failed to login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    
    try {
      // Simulate guest login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Guest Mode', 'You are now using Zeeky AI in guest mode. Some features may be limited.', [
        {
          text: 'OK',
          onPress: () => {
            if (onAuthChange) {
              onAuthChange(true);
            }
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to start guest mode');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Logo */}
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryContainer]}
            style={styles.headerGradient}
          >
            <Animatable.View animation="bounceIn" duration={1500}>
              <Avatar.Icon 
                size={80} 
                icon="robot" 
                style={styles.logo}
              />
            </Animatable.View>
            
            <Animatable.View animation="fadeInUp" duration={1000} delay={500}>
              <Title style={styles.appTitle}>Zeeky AI</Title>
              <Paragraph style={styles.appSubtitle}>
                Your Advanced AI Assistant
              </Paragraph>
            </Animatable.View>
          </LinearGradient>

          {/* Login Form */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={800}>
            <Surface style={styles.loginCard}>
              <Card.Content>
                <Title style={styles.loginTitle}>Welcome Back</Title>
                <Paragraph style={styles.loginSubtitle}>
                  Sign in to continue your AI journey
                </Paragraph>

                <View style={styles.formContainer}>
                  <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
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
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
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

                  <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.loginButton}
                    contentStyle={styles.buttonContent}
                  >
                    Sign In
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => Alert.alert('Forgot Password', 'Password reset feature coming soon!')}
                    disabled={isLoading}
                    style={styles.forgotButton}
                  >
                    Forgot Password?
                  </Button>
                </View>
              </Card.Content>
            </Surface>
          </Animatable.View>

          {/* Divider */}
          <Animatable.View animation="fadeIn" duration={1000} delay={1200}>
            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <Divider style={styles.divider} />
            </View>
          </Animatable.View>

          {/* Alternative Options */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={1400}>
            <View style={styles.alternativeOptions}>
              <Button
                mode="outlined"
                onPress={handleGuestLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.guestButton}
                contentStyle={styles.buttonContent}
                icon="account-outline"
              >
                Continue as Guest
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.navigate('Register')}
                disabled={isLoading}
                style={styles.registerButton}
              >
                Don't have an account? Sign Up
              </Button>
            </View>
          </Animatable.View>

          {/* Features Preview */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={1600}>
            <Surface style={styles.featuresPreview}>
              <Title style={styles.featuresTitle}>What you'll get:</Title>
              <View style={styles.featuresList}>
                <Text style={styles.featureItem}>🤖 Advanced AI Chat with Multiple Personalities</Text>
                <Text style={styles.featureItem}>🎨 AI Image Generation & Analysis</Text>
                <Text style={styles.featureItem}>🎤 Voice Commands & Speech Recognition</Text>
                <Text style={styles.featureItem}>📁 Smart File Processing</Text>
                <Text style={styles.featureItem}>💼 Business Tools & Analytics</Text>
                <Text style={styles.featureItem}>🔒 Secure & Private</Text>
              </View>
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
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 8,
  },
  loginCard: {
    margin: 20,
    borderRadius: 16,
    elevation: 4,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  loginSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  formContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  loginButton: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  forgotButton: {
    alignSelf: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 40,
    marginVertical: 20,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    opacity: 0.6,
    fontWeight: 'bold',
  },
  alternativeOptions: {
    marginHorizontal: 20,
    gap: 12,
  },
  guestButton: {
    borderWidth: 2,
  },
  registerButton: {
    alignSelf: 'center',
  },
  featuresPreview: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
