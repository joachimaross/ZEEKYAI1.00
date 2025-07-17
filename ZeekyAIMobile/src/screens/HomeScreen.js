// Zeeky AI Mobile - Home Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Avatar,
  Chip,
  Surface,
  Text,
  useTheme,
  ActivityIndicator
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import ApiService from '../services/ApiService';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalChats: 0,
    imagesGenerated: 0,
    filesProcessed: 0,
    voiceCommands: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load user data
      const user = await ApiService.getUserData();
      setUserData(user);

      // Load user statistics (mock data for now)
      setStats({
        totalChats: 47,
        imagesGenerated: 12,
        filesProcessed: 8,
        voiceCommands: 23
      });

      // Load recent activity
      setRecentActivity([
        {
          id: 1,
          type: 'chat',
          title: 'General conversation',
          time: '2 minutes ago',
          icon: 'chatbubbles'
        },
        {
          id: 2,
          type: 'image',
          title: 'Generated landscape image',
          time: '1 hour ago',
          icon: 'camera'
        },
        {
          id: 3,
          type: 'file',
          title: 'Processed document.pdf',
          time: '3 hours ago',
          icon: 'document'
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      title: 'Start Chat',
      icon: 'chatbubbles',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('Chat')
    },
    {
      title: 'Generate Image',
      icon: 'camera',
      color: '#4CAF50',
      onPress: () => navigation.navigate('Vision')
    },
    {
      title: 'Voice Command',
      icon: 'mic',
      color: '#FF9800',
      onPress: () => navigation.navigate('Voice')
    },
    {
      title: 'Process File',
      icon: 'folder',
      color: '#9C27B0',
      onPress: () => navigation.navigate('Files')
    }
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
          style={styles.headerGradient}
        >
          <Animatable.View animation="fadeInDown" duration={1000}>
            <View style={styles.welcomeHeader}>
              <Avatar.Icon 
                size={60} 
                icon="robot" 
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
              <View style={styles.welcomeText}>
                <Title style={[styles.welcomeTitle, { color: theme.colors.onPrimary }]}>
                  Welcome back{userData?.username ? `, ${userData.username}` : ''}!
                </Title>
                <Paragraph style={{ color: theme.colors.onPrimary, opacity: 0.9 }}>
                  Your AI assistant is ready to help
                </Paragraph>
              </View>
            </View>
          </Animatable.View>
        </LinearGradient>

        {/* Quick Actions */}
        <Animatable.View animation="fadeInUp" duration={1000} delay={200}>
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Quick Actions</Title>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <Card 
                  key={index}
                  style={[styles.quickActionCard, { borderLeftColor: action.color }]}
                  onPress={action.onPress}
                >
                  <Card.Content style={styles.quickActionContent}>
                    <Ionicons 
                      name={action.icon} 
                      size={24} 
                      color={action.color} 
                    />
                    <Text style={styles.quickActionText}>{action.title}</Text>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </Surface>
        </Animatable.View>

        {/* Statistics */}
        <Animatable.View animation="fadeInUp" duration={1000} delay={400}>
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Your Activity</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalChats}</Text>
                <Text style={styles.statLabel}>Chats</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.imagesGenerated}</Text>
                <Text style={styles.statLabel}>Images</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.filesProcessed}</Text>
                <Text style={styles.statLabel}>Files</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.voiceCommands}</Text>
                <Text style={styles.statLabel}>Voice</Text>
              </View>
            </View>
          </Surface>
        </Animatable.View>

        {/* Recent Activity */}
        <Animatable.View animation="fadeInUp" duration={1000} delay={600}>
          <Surface style={styles.section}>
            <Title style={styles.sectionTitle}>Recent Activity</Title>
            {recentActivity.map((activity) => (
              <Card key={activity.id} style={styles.activityCard}>
                <Card.Content style={styles.activityContent}>
                  <Ionicons 
                    name={activity.icon} 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                  <View style={styles.activityText}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </Surface>
        </Animatable.View>

        {/* AI Personalities Preview */}
        <Animatable.View animation="fadeInUp" duration={1000} delay={800}>
          <Surface style={styles.section}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>AI Personalities</Title>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('Personalities')}
              >
                View All
              </Button>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.personalitiesRow}>
                {['Default', 'Professional', 'Creative', 'Technical'].map((personality, index) => (
                  <Chip 
                    key={index}
                    style={styles.personalityChip}
                    onPress={() => navigation.navigate('Chat', { personality })}
                  >
                    {personality}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </Surface>
        </Animatable.View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate('Chat')}
        label="New Chat"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 64) / 2,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  quickActionText: {
    marginLeft: 12,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  activityCard: {
    marginBottom: 8,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityText: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  personalitiesRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  personalityChip: {
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
