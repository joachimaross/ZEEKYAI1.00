// Zeeky AI Mobile - Main Navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import PersonalitiesScreen from '../screens/PersonalitiesScreen';
import VisionScreen from '../screens/VisionScreen';
import VoiceScreen from '../screens/VoiceScreen';
import FilesScreen from '../screens/FilesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ConversationScreen from '../screens/ConversationScreen';
import ImageGeneratorScreen from '../screens/ImageGeneratorScreen';
import CodeLabScreen from '../screens/CodeLabScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Tab Navigator
function MainTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Chat':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Vision':
              iconName = focused ? 'camera' : 'camera-outline';
              break;
            case 'Voice':
              iconName = focused ? 'mic' : 'mic-outline';
              break;
            case 'Files':
              iconName = focused ? 'folder' : 'folder-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Zeeky AI',
          headerTitle: 'Zeeky AI Dashboard'
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          title: 'Chat',
          headerTitle: 'AI Chat'
        }}
      />
      <Tab.Screen 
        name="Vision" 
        component={VisionScreen}
        options={{
          title: 'Vision',
          headerTitle: 'AI Vision'
        }}
      />
      <Tab.Screen 
        name="Voice" 
        component={VoiceScreen}
        options={{
          title: 'Voice',
          headerTitle: 'Voice Assistant'
        }}
      />
      <Tab.Screen 
        name="Files" 
        component={FilesScreen}
        options={{
          title: 'Files',
          headerTitle: 'File Manager'
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerTitle: 'App Settings'
        }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack Navigator
function AuthStackNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Welcome to Zeeky AI',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          title: 'Create Account',
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
}

// Main App Stack Navigator
function AppStackNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Personalities" 
        component={PersonalitiesScreen}
        options={{
          title: 'AI Personalities',
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="Conversation" 
        component={ConversationScreen}
        options={({ route }) => ({
          title: route.params?.title || 'Conversation'
        })}
      />
      <Stack.Screen 
        name="ImageGenerator" 
        component={ImageGeneratorScreen}
        options={{
          title: 'Image Generator',
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="CodeLab" 
        component={CodeLabScreen}
        options={{
          title: 'Code Laboratory',
          presentation: 'modal'
        }}
      />
    </Stack.Navigator>
  );
}

// Root Navigator Component
export default function AppNavigator({ isAuthenticated }) {
  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}
