// Zeeky AI Mobile - Files Screen
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Button,
  Card,
  Title,
  Text,
  useTheme,
  Surface,
  FAB,
  List,
  Chip
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FilesScreen({ navigation }) {
  const theme = useTheme();
  const [files, setFiles] = useState([
    {
      id: 1,
      name: 'document.pdf',
      type: 'pdf',
      size: '2.4 MB',
      status: 'processed',
      uploadDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'presentation.pptx',
      type: 'presentation',
      size: '5.1 MB',
      status: 'processing',
      uploadDate: '2024-01-14'
    }
  ]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        Alert.alert('Demo Mode', 'File upload feature will be available in the full version');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return 'document-text';
      case 'presentation': return 'presentation';
      case 'image': return 'image';
      default: return 'document';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return '#4CAF50';
      case 'processing': return '#FF9800';
      case 'error': return '#f44336';
      default: return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>File Manager</Title>
          <Text style={styles.sectionDescription}>
            Upload and process documents with AI
          </Text>

          <Button
            mode="contained"
            onPress={pickDocument}
            icon="upload"
            style={styles.uploadButton}
          >
            Upload Document
          </Button>
        </Surface>

        <Surface style={styles.section}>
          <Title style={styles.sectionTitle}>Your Files</Title>
          
          {files.map((file) => (
            <Card key={file.id} style={styles.fileCard}>
              <List.Item
                title={file.name}
                description={`${file.size} • ${file.uploadDate}`}
                left={() => (
                  <Ionicons 
                    name={getFileIcon(file.type)} 
                    size={24} 
                    color={theme.colors.primary} 
                  />
                )}
                right={() => (
                  <Chip 
                    style={{ backgroundColor: getStatusColor(file.status) }}
                    textStyle={{ color: 'white' }}
                  >
                    {file.status}
                  </Chip>
                )}
              />
            </Card>
          ))}
        </Surface>
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={pickDocument}
      />
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
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: 16,
  },
  uploadButton: {
    marginBottom: 16,
  },
  fileCard: {
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
