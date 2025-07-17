// Zeeky AI Mobile - Main App Component
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';

// Import navigation and services
import AppNavigator from './src/navigation/AppNavigator';
import ApiService from './src/services/ApiService';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Custom theme colors for Zeeky AI
const ZeekyLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1a73e8',
    primaryContainer: '#e3f2fd',
    secondary: '#0066cc',
    secondaryContainer: '#bbdefb',
    surface: '#ffffff',
    surfaceVariant: '#f5f5f5',
    background: '#fafafa',
    error: '#d32f2f',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onSurface: '#1c1b1f',
    onBackground: '#1c1b1f',
  },
};

const ZeekyDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4285f4',
    primaryContainer: '#1565c0',
    secondary: '#42a5f5',
    secondaryContainer: '#1976d2',
    surface: '#121212',
    surfaceVariant: '#1e1e1e',
    background: '#000000',
    error: '#cf6679',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onSurface: '#ffffff',
    onBackground: '#ffffff',
  },
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState(false);

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? ZeekyDarkTheme : ZeekyLightTheme;

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check authentication status
      const authenticated = await ApiService.isAuthenticated();
      setIsAuthenticated(authenticated);

      // Request notification permissions
      await requestNotificationPermissions();

      // Set up notification listeners
      setupNotificationListeners();

      // Hide splash screen
      await SplashScreen.hideAsync();
    } catch (error) {
      console.error('App initialization error:', error);
      Alert.alert('Error', 'Failed to initialize app. Please restart.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationPermission(status === 'granted');

      if (status === 'granted') {
        // Get push token for notifications
        const token = await Notifications.getExpoPushTokenAsync();
        console.log('Push token:', token.data);

        // Send token to backend for push notifications
        await ApiService.trackUserAction('push_token_registered', { token: token.data });
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  };

  const setupNotificationListeners = () => {
    // Handle notification received while app is running
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // Handle navigation based on notification data
    });
  };

  if (isLoading) {
    // Return null to keep splash screen visible
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar
            style={colorScheme === 'dark' ? 'light' : 'dark'}
            backgroundColor={theme.colors.primary}
          />
          <AppNavigator
            isAuthenticated={isAuthenticated}
            onAuthChange={setIsAuthenticated}
          />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
