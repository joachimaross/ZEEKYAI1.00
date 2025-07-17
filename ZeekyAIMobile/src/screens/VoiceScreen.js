// Zeeky AI Mobile - Voice Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Dimensions
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  Text,
  useTheme,
  Surface,
  ActivityIndicator
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

import ApiService from '../services/ApiService';

const { width } = Dimensions.get('window');

export default function VoiceScreen({ navigation }) {
  const theme = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    requestPermissions();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Microphone permission is needed for voice features');
    }
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      setTranscription('');
      setResponse('');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (isListening) {
          stopListening();
        }
      }, 10000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start voice recording');
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    if (!recording) return;

    try {
      setIsListening(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        await processVoiceCommand(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to process voice recording');
    }
  };

  const processVoiceCommand = async (audioUri) => {
    try {
      // Mock transcription for demo
      const mockTranscription = "Hello Zeeky, what's the weather like today?";
      setTranscription(mockTranscription);

      const response = await ApiService.sendMessage(mockTranscription, 'default');
      
      if (response.success) {
        setResponse(response.response);
        await speakResponse(response.response);
        
        await ApiService.trackUserAction('voice_command_processed', {
          transcription_length: mockTranscription.length
        });
      } else {
        throw new Error(response.error || 'Failed to process voice command');
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      
      // Mock response for demo
      const mockResponse = "I'm sorry, I'm currently in demo mode. Voice processing will be available in the full version.";
      setResponse(mockResponse);
      await speakResponse(mockResponse);
    }
  };

  const speakResponse = async (text) => {
    try {
      setIsSpeaking(true);
      
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Voice Visualizer */}
        <Animatable.View 
          animation={isListening ? "pulse" : undefined}
          iterationCount="infinite"
          duration={1000}
          style={styles.voiceVisualizer}
        >
          <View style={[
            styles.microphoneButton,
            { 
              backgroundColor: isListening ? '#f44336' : theme.colors.primary,
              transform: [{ scale: isListening ? 1.1 : 1 }]
            }
          ]}>
            <Ionicons 
              name={isListening ? "mic" : "mic-outline"} 
              size={60} 
              color="white" 
            />
          </View>
        </Animatable.View>

        {/* Status Text */}
        <Text style={styles.statusText}>
          {isListening ? 'Listening...' : 
           isSpeaking ? 'Speaking...' : 
           'Tap to start voice command'}
        </Text>

        {/* Voice Controls */}
        <View style={styles.controlsContainer}>
          {!isListening ? (
            <Button
              mode="contained"
              onPress={startListening}
              disabled={isSpeaking}
              style={styles.controlButton}
              contentStyle={styles.buttonContent}
              icon="microphone"
            >
              Start Listening
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={stopListening}
              style={[styles.controlButton, { backgroundColor: '#f44336' }]}
              contentStyle={styles.buttonContent}
              icon="stop"
            >
              Stop Listening
            </Button>
          )}

          {isSpeaking && (
            <Button
              mode="outlined"
              onPress={stopSpeaking}
              style={styles.controlButton}
              contentStyle={styles.buttonContent}
              icon="volume-off"
            >
              Stop Speaking
            </Button>
          )}
        </View>

        {/* Transcription */}
        {transcription ? (
          <Animatable.View animation="fadeInUp" duration={500}>
            <Surface style={styles.transcriptionCard}>
              <Title style={styles.cardTitle}>You said:</Title>
              <Text style={styles.transcriptionText}>{transcription}</Text>
            </Surface>
          </Animatable.View>
        ) : null}

        {/* Response */}
        {response ? (
          <Animatable.View animation="fadeInUp" duration={500} delay={200}>
            <Surface style={styles.responseCard}>
              <Title style={styles.cardTitle}>Zeeky AI responds:</Title>
              <Text style={styles.responseText}>{response}</Text>
              {isSpeaking && (
                <View style={styles.speakingIndicator}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.speakingText}>Speaking...</Text>
                </View>
              )}
            </Surface>
          </Animatable.View>
        ) : null}

        {/* Quick Actions */}
        <Surface style={styles.quickActionsCard}>
          <Title style={styles.cardTitle}>Quick Voice Commands:</Title>
          <View style={styles.quickActions}>
            <Text style={styles.quickActionItem}>• "What's the weather?"</Text>
            <Text style={styles.quickActionItem}>• "Tell me a joke"</Text>
            <Text style={styles.quickActionItem}>• "Generate an image of..."</Text>
            <Text style={styles.quickActionItem}>• "Analyze this document"</Text>
            <Text style={styles.quickActionItem}>• "Switch to creative mode"</Text>
          </View>
        </Surface>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  voiceVisualizer: {
    marginTop: 40,
    marginBottom: 30,
  },
  microphoneButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  controlsContainer: {
    gap: 12,
    marginBottom: 30,
    width: '100%',
  },
  controlButton: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  transcriptionCard: {
    width: width - 40,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  responseCard: {
    width: width - 40,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  transcriptionText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
  },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
  },
  speakingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  speakingText: {
    marginLeft: 8,
    fontStyle: 'italic',
    color: '#666',
  },
  quickActionsCard: {
    width: width - 40,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  quickActions: {
    gap: 8,
  },
  quickActionItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
