// Zeeky AI Mobile - Personalities Screen
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  useTheme,
  Surface,
  Avatar,
  Chip
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PersonalitiesScreen({ navigation }) {
  const theme = useTheme();
  const [selectedPersonality, setSelectedPersonality] = useState('default');

  const personalities = [
    {
      key: 'default',
      name: 'Default Zeeky',
      description: 'Universal AI assistant with balanced capabilities',
      icon: 'robot',
      color: '#1a73e8',
      traits: ['Helpful', 'Knowledgeable', 'Balanced'],
      example: 'Hello! I\'m here to help you with anything you need.'
    },
    {
      key: 'professional',
      name: 'Professional Assistant',
      description: 'Formal, business-focused communication style',
      icon: 'briefcase',
      color: '#2c3e50',
      traits: ['Formal', 'Efficient', 'Business-focused'],
      example: 'Good day. How may I assist you with your professional needs?'
    },
    {
      key: 'creative',
      name: 'Creative Companion',
      description: 'Imaginative and artistic approach to problems',
      icon: 'palette',
      color: '#e91e63',
      traits: ['Imaginative', 'Artistic', 'Inspiring'],
      example: 'Let\'s unleash your creativity! What amazing ideas shall we explore?'
    },
    {
      key: 'technical',
      name: 'Tech Expert',
      description: 'Technical expertise and programming focus',
      icon: 'code-slash',
      color: '#4caf50',
      traits: ['Technical', 'Precise', 'Analytical'],
      example: 'Ready to dive into technical solutions and code optimization.'
    },
    {
      key: 'friendly',
      name: 'Friendly Buddy',
      description: 'Casual, warm, and conversational style',
      icon: 'happy',
      color: '#ff9800',
      traits: ['Casual', 'Warm', 'Conversational'],
      example: 'Hey there! What\'s up? I\'m excited to chat with you!'
    },
    {
      key: 'academic',
      name: 'Academic Scholar',
      description: 'Educational and research-oriented approach',
      icon: 'school',
      color: '#673ab7',
      traits: ['Educational', 'Thorough', 'Research-focused'],
      example: 'Let\'s explore this topic with academic rigor and depth.'
    }
  ];

  const selectPersonality = (personality) => {
    setSelectedPersonality(personality.key);
    navigation.navigate('Chat', { personality: personality.key });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Surface style={styles.header}>
          <Title style={styles.headerTitle}>AI Personalities</Title>
          <Paragraph style={styles.headerDescription}>
            Choose how Zeeky AI should interact with you
          </Paragraph>
        </Surface>

        <View style={styles.personalitiesGrid}>
          {personalities.map((personality, index) => (
            <Animatable.View
              key={personality.key}
              animation="fadeInUp"
              duration={500}
              delay={index * 100}
            >
              <Card 
                style={[
                  styles.personalityCard,
                  selectedPersonality === personality.key && styles.selectedCard
                ]}
                onPress={() => selectPersonality(personality)}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Avatar.Icon
                      size={48}
                      icon={personality.icon}
                      style={{ backgroundColor: personality.color }}
                    />
                    <View style={styles.cardTitleContainer}>
                      <Title style={styles.cardTitle}>{personality.name}</Title>
                      {selectedPersonality === personality.key && (
                        <Chip 
                          style={styles.activeChip}
                          textStyle={{ color: 'white' }}
                        >
                          Active
                        </Chip>
                      )}
                    </View>
                  </View>

                  <Paragraph style={styles.description}>
                    {personality.description}
                  </Paragraph>

                  <View style={styles.traitsContainer}>
                    {personality.traits.map((trait, traitIndex) => (
                      <Chip 
                        key={traitIndex}
                        style={[styles.traitChip, { borderColor: personality.color }]}
                        textStyle={{ color: personality.color }}
                      >
                        {trait}
                      </Chip>
                    ))}
                  </View>

                  <Surface style={styles.exampleContainer}>
                    <Text style={styles.exampleLabel}>Example response:</Text>
                    <Text style={styles.exampleText}>"{personality.example}"</Text>
                  </Surface>

                  <Button
                    mode={selectedPersonality === personality.key ? "contained" : "outlined"}
                    onPress={() => selectPersonality(personality)}
                    style={[
                      styles.selectButton,
                      { borderColor: personality.color }
                    ]}
                    buttonColor={selectedPersonality === personality.key ? personality.color : 'transparent'}
                  >
                    {selectedPersonality === personality.key ? 'Selected' : 'Select'}
                  </Button>
                </Card.Content>
              </Card>
            </Animatable.View>
          ))}
        </View>

        {/* Custom Personality Section */}
        <Surface style={styles.customSection}>
          <Title style={styles.sectionTitle}>Custom Personality</Title>
          <Paragraph style={styles.sectionDescription}>
            Want a unique AI personality? Create your own custom assistant!
          </Paragraph>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('CreatePersonality')}
            icon="plus"
            style={styles.customButton}
          >
            Create Custom Personality
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
  header: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
  personalitiesGrid: {
    padding: 16,
    gap: 16,
  },
  personalityCard: {
    borderRadius: 16,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#1a73e8',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeChip: {
    backgroundColor: '#4CAF50',
  },
  description: {
    marginBottom: 12,
    opacity: 0.8,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  traitChip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  exampleContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.7,
    marginBottom: 4,
  },
  exampleText: {
    fontStyle: 'italic',
    fontSize: 14,
  },
  selectButton: {
    marginTop: 8,
  },
  customSection: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
    marginBottom: 16,
  },
  customButton: {
    minWidth: 200,
  },
});
