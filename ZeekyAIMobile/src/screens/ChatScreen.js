// Zeeky AI Mobile - Chat Screen
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Avatar,
  Text,
  useTheme,
  IconButton,
  Chip,
  Surface,
  ActivityIndicator
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

import ApiService from '../services/ApiService';

const { width } = Dimensions.get('window');

export default function ChatScreen({ navigation, route }) {
  const theme = useTheme();
  const flatListRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersonality, setCurrentPersonality] = useState(
    route.params?.personality || 'default'
  );
  const [conversationId, setConversationId] = useState(null);

  const personalities = [
    { key: 'default', label: 'Default', color: '#1a73e8' },
    { key: 'professional', label: 'Professional', color: '#2c3e50' },
    { key: 'creative', label: 'Creative', color: '#e91e63' },
    { key: 'technical', label: 'Technical', color: '#4caf50' },
    { key: 'friendly', label: 'Friendly', color: '#ff9800' },
  ];

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: 1,
        text: `Hello! I'm Zeeky AI with ${currentPersonality} personality. How can I help you today?`,
        isUser: false,
        timestamp: new Date(),
        personality: currentPersonality
      }
    ]);
  }, [currentPersonality]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await ApiService.sendMessage(
        userMessage.text,
        currentPersonality,
        conversationId
      );

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.response,
          isUser: false,
          timestamp: new Date(),
          personality: currentPersonality,
          model: response.model || 'zeeky-enhanced-ai'
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Set conversation ID if not set
        if (response.conversation_id && !conversationId) {
          setConversationId(response.conversation_id);
        }

        // Track user interaction
        await ApiService.trackUserAction('message_sent', {
          personality: currentPersonality,
          message_length: userMessage.text.length
        });
      } else {
        throw new Error(response.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const changePersonality = (personality) => {
    setCurrentPersonality(personality);
    
    const personalityMessage = {
      id: Date.now(),
      text: `Switched to ${personality} personality mode.`,
      isUser: false,
      timestamp: new Date(),
      isSystem: true
    };

    setMessages(prev => [...prev, personalityMessage]);
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            setConversationId(null);
          }
        }
      ]
    );
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.isUser;
    const isSystem = item.isSystem;
    const isError = item.isError;

    return (
      <Animatable.View
        animation="fadeInUp"
        duration={500}
        delay={index * 100}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer
        ]}
      >
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
          isSystem && styles.systemBubble,
          isError && styles.errorBubble
        ]}>
          {!isUser && !isSystem && (
            <View style={styles.messageHeader}>
              <Avatar.Icon 
                size={24} 
                icon="robot" 
                style={{ 
                  backgroundColor: personalities.find(p => p.key === item.personality)?.color || theme.colors.primary 
                }}
              />
              <Text style={styles.personalityLabel}>
                {personalities.find(p => p.key === item.personality)?.label || 'Zeeky AI'}
              </Text>
            </View>
          )}
          
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.aiMessageText,
            isSystem && styles.systemMessageText,
            isError && styles.errorMessageText
          ]}>
            {item.text}
          </Text>
          
          <Text style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.aiTimestamp
          ]}>
            {item.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </Animatable.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Personality Selector */}
        <Surface style={styles.personalitySelector}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={personalities}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <Chip
                selected={currentPersonality === item.key}
                onPress={() => changePersonality(item.key)}
                style={[
                  styles.personalityChip,
                  { backgroundColor: currentPersonality === item.key ? item.color : 'transparent' }
                ]}
                textStyle={{
                  color: currentPersonality === item.key ? 'white' : item.color
                }}
              >
                {item.label}
              </Chip>
            )}
          />
        </Surface>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          style={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Zeeky is thinking...</Text>
          </View>
        )}

        {/* Input Area */}
        <Surface style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              multiline
              maxLength={1000}
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <IconButton
              icon="send"
              size={24}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
              style={[
                styles.sendButton,
                { backgroundColor: theme.colors.primary }
              ]}
              iconColor="white"
            />
          </View>
          
          <View style={styles.inputActions}>
            <IconButton
              icon="microphone"
              size={20}
              onPress={() => navigation.navigate('Voice')}
            />
            <IconButton
              icon="camera"
              size={20}
              onPress={() => navigation.navigate('Vision')}
            />
            <IconButton
              icon="folder"
              size={20}
              onPress={() => navigation.navigate('Files')}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={clearChat}
            />
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  personalitySelector: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 2,
  },
  personalityChip: {
    marginRight: 8,
    borderWidth: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.8,
    padding: 12,
    borderRadius: 16,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#1a73e8',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  systemBubble: {
    backgroundColor: '#e3f2fd',
    alignSelf: 'center',
  },
  errorBubble: {
    backgroundColor: '#ffebee',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  personalityLabel: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#333',
  },
  systemMessageText: {
    color: '#1a73e8',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorMessageText: {
    color: '#d32f2f',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: 'white',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#666',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: 16,
    elevation: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    marginRight: 8,
    backgroundColor: 'white',
  },
  sendButton: {
    margin: 0,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
});
