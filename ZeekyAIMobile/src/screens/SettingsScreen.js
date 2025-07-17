// Zeeky AI Mobile - Settings Screen
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  List,
  Switch,
  Button,
  Card,
  Title,
  Text,
  useTheme,
  Surface,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApiService from '../services/ApiService';

export default function SettingsScreen({ navigation, onAuthChange }) {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    voiceEnabled: true,
    darkMode: false,
    autoSave: true,
    analytics: true
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.logout();
              if (onAuthChange) {
                onAuthChange(false);
              }
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* App Settings */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>App Settings</Title>
          
          <List.Item
            title="Push Notifications"
            description="Receive notifications for updates"
            right={() => (
              <Switch
                value={settings.notifications}
                onValueChange={() => toggleSetting('notifications')}
              />
            )}
          />
          
          <List.Item
            title="Voice Commands"
            description="Enable voice interaction"
            right={() => (
              <Switch
                value={settings.voiceEnabled}
                onValueChange={() => toggleSetting('voiceEnabled')}
              />
            )}
          />
          
          <List.Item
            title="Auto-save Conversations"
            description="Automatically save chat history"
            right={() => (
              <Switch
                value={settings.autoSave}
                onValueChange={() => toggleSetting('autoSave')}
              />
            )}
          />
          
          <List.Item
            title="Analytics"
            description="Help improve the app"
            right={() => (
              <Switch
                value={settings.analytics}
                onValueChange={() => toggleSetting('analytics')}
              />
            )}
          />
        </Surface>

        {/* Account */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Account</Title>
          
          <List.Item
            title="Profile"
            description="Manage your profile"
            left={(props) => <List.Icon {...props} icon="account" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Profile', 'Profile management coming soon!')}
          />
          
          <List.Item
            title="Privacy"
            description="Privacy settings"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon!')}
          />
          
          <List.Item
            title="Data Export"
            description="Export your data"
            left={(props) => <List.Icon {...props} icon="download" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Export', 'Data export coming soon!')}
          />
        </Surface>

        {/* Support */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Support</Title>
          
          <List.Item
            title="Help & FAQ"
            description="Get help and answers"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Help', 'Help section coming soon!')}
          />
          
          <List.Item
            title="Contact Support"
            description="Get in touch with us"
            left={(props) => <List.Icon {...props} icon="email" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Contact', 'Contact support coming soon!')}
          />
          
          <List.Item
            title="Rate App"
            description="Rate us on the app store"
            left={(props) => <List.Icon {...props} icon="star" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Rate', 'App rating coming soon!')}
          />
        </Surface>

        {/* About */}
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>About</Title>
          
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          
          <List.Item
            title="Terms of Service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Terms', 'Terms of service coming soon!')}
          />
          
          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon!')}
          />
        </Surface>

        {/* Logout */}
        <Surface style={styles.section}>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={[styles.logoutButton, { backgroundColor: '#f44336' }]}
            icon="logout"
          >
            Logout
          </Button>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  logoutButton: {
    margin: 16,
  },
});
