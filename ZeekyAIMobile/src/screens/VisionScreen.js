// Zeeky AI Mobile - Vision Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Image
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  Text,
  useTheme,
  FAB,
  Chip,
  Surface,
  ActivityIndicator,
  Modal,
  Portal
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

import ApiService from '../services/ApiService';

const { width } = Dimensions.get('window');

export default function VisionScreen({ navigation }) {
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' or 'generate'

  useEffect(() => {
    requestPermissions();
    loadGeneratedImages();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are needed for image features.'
      );
    }
  };

  const loadGeneratedImages = () => {
    // Mock generated images for demo
    setGeneratedImages([
      {
        id: 1,
        uri: 'https://picsum.photos/300/300?random=1',
        prompt: 'Beautiful sunset landscape',
        style: 'realistic',
        timestamp: new Date()
      },
      {
        id: 2,
        uri: 'https://picsum.photos/300/300?random=2',
        prompt: 'Futuristic city skyline',
        style: 'cyberpunk',
        timestamp: new Date()
      }
    ]);
  };

  const pickImageFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        setAnalysisResult(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from library');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        setAnalysisResult(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await ApiService.analyzeImage(selectedImage.uri);

      if (response.success) {
        setAnalysisResult(response.analysis);
        await ApiService.trackUserAction('image_analyzed', {
          image_size: selectedImage.fileSize
        });
      } else {
        throw new Error(response.error || 'Failed to analyze image');
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      
      // Mock analysis result for demo
      setAnalysisResult({
        description: 'This appears to be a beautiful landscape image with vibrant colors and natural elements.',
        objects: ['sky', 'trees', 'grass', 'clouds'],
        colors: ['blue', 'green', 'white', 'brown'],
        mood: 'peaceful and serene',
        confidence: 0.92
      });
      
      Alert.alert('Demo Mode', 'Using simulated image analysis results');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateImage = async (prompt, style = 'realistic') => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt for image generation');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await ApiService.generateImage(prompt, style);

      if (response.success) {
        const newImage = {
          id: Date.now(),
          uri: response.image_url,
          prompt,
          style,
          timestamp: new Date()
        };

        setGeneratedImages(prev => [newImage, ...prev]);
        
        await ApiService.trackUserAction('image_generated', {
          prompt_length: prompt.length,
          style
        });

        Alert.alert('Success', 'Image generated successfully!');
      } else {
        throw new Error(response.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      
      // Mock generated image for demo
      const newImage = {
        id: Date.now(),
        uri: `https://picsum.photos/300/300?random=${Date.now()}`,
        prompt,
        style,
        timestamp: new Date()
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      Alert.alert('Demo Mode', 'Using placeholder image for demonstration');
    } finally {
      setIsGenerating(false);
    }
  };

  const showImageInModal = (image) => {
    setModalImage(image);
    setShowImageModal(true);
  };

  const imageStyles = [
    { key: 'realistic', label: 'Realistic', color: '#4CAF50' },
    { key: 'artistic', label: 'Artistic', color: '#E91E63' },
    { key: 'cartoon', label: 'Cartoon', color: '#FF9800' },
    { key: 'abstract', label: 'Abstract', color: '#9C27B0' },
    { key: 'cyberpunk', label: 'Cyberpunk', color: '#00BCD4' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Selector */}
      <Surface style={styles.tabContainer}>
        <View style={styles.tabButtons}>
          <Button
            mode={activeTab === 'analyze' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('analyze')}
            style={styles.tabButton}
          >
            Analyze Image
          </Button>
          <Button
            mode={activeTab === 'generate' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('generate')}
            style={styles.tabButton}
          >
            Generate Image
          </Button>
        </View>
      </Surface>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'analyze' ? (
          <Animatable.View animation="fadeIn" duration={500}>
            {/* Image Analysis Section */}
            <Surface style={styles.section}>
              <Title style={styles.sectionTitle}>Image Analysis</Title>
              
              {selectedImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                  <View style={styles.imageActions}>
                    <Button
                      mode="contained"
                      onPress={analyzeImage}
                      loading={isAnalyzing}
                      disabled={isAnalyzing}
                      icon="magnify"
                    >
                      Analyze Image
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => setSelectedImage(null)}
                      disabled={isAnalyzing}
                    >
                      Clear
                    </Button>
                  </View>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={64} color={theme.colors.outline} />
                  <Text style={styles.placeholderText}>No image selected</Text>
                  <View style={styles.imagePickerButtons}>
                    <Button
                      mode="contained"
                      onPress={takePhoto}
                      icon="camera"
                      style={styles.imagePickerButton}
                    >
                      Take Photo
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={pickImageFromLibrary}
                      icon="folder"
                      style={styles.imagePickerButton}
                    >
                      Choose from Library
                    </Button>
                  </View>
                </View>
              )}

              {/* Analysis Results */}
              {analysisResult && (
                <Animatable.View animation="fadeInUp" duration={500}>
                  <Card style={styles.analysisCard}>
                    <Card.Content>
                      <Title>Analysis Results</Title>
                      
                      <View style={styles.analysisSection}>
                        <Text style={styles.analysisLabel}>Description:</Text>
                        <Paragraph>{analysisResult.description}</Paragraph>
                      </View>

                      <View style={styles.analysisSection}>
                        <Text style={styles.analysisLabel}>Detected Objects:</Text>
                        <View style={styles.chipContainer}>
                          {analysisResult.objects?.map((object, index) => (
                            <Chip key={index} style={styles.analysisChip}>
                              {object}
                            </Chip>
                          ))}
                        </View>
                      </View>

                      <View style={styles.analysisSection}>
                        <Text style={styles.analysisLabel}>Dominant Colors:</Text>
                        <View style={styles.chipContainer}>
                          {analysisResult.colors?.map((color, index) => (
                            <Chip key={index} style={styles.analysisChip}>
                              {color}
                            </Chip>
                          ))}
                        </View>
                      </View>

                      <View style={styles.analysisSection}>
                        <Text style={styles.analysisLabel}>Mood:</Text>
                        <Paragraph>{analysisResult.mood}</Paragraph>
                      </View>

                      <View style={styles.analysisSection}>
                        <Text style={styles.analysisLabel}>Confidence:</Text>
                        <Text style={styles.confidenceText}>
                          {Math.round(analysisResult.confidence * 100)}%
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                </Animatable.View>
              )}
            </Surface>
          </Animatable.View>
        ) : (
          <Animatable.View animation="fadeIn" duration={500}>
            {/* Image Generation Section */}
            <Surface style={styles.section}>
              <Title style={styles.sectionTitle}>Generate Images</Title>
              
              <Button
                mode="contained"
                onPress={() => navigation.navigate('ImageGenerator')}
                icon="plus"
                style={styles.generateButton}
              >
                Create New Image
              </Button>

              {/* Generated Images Gallery */}
              <Title style={styles.galleryTitle}>Your Generated Images</Title>
              
              {generatedImages.length > 0 ? (
                <View style={styles.imageGrid}>
                  {generatedImages.map((image) => (
                    <Card 
                      key={image.id} 
                      style={styles.imageCard}
                      onPress={() => showImageInModal(image)}
                    >
                      <Image source={{ uri: image.uri }} style={styles.gridImage} />
                      <Card.Content style={styles.imageCardContent}>
                        <Text style={styles.imagePrompt} numberOfLines={2}>
                          {image.prompt}
                        </Text>
                        <Chip style={styles.styleChip}>
                          {image.style}
                        </Chip>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyGallery}>
                  <Ionicons name="images-outline" size={64} color={theme.colors.outline} />
                  <Text style={styles.emptyText}>No generated images yet</Text>
                  <Text style={styles.emptySubtext}>
                    Create your first AI-generated image!
                  </Text>
                </View>
              )}
            </Surface>
          </Animatable.View>
        )}
      </ScrollView>

      {/* Image Modal */}
      <Portal>
        <Modal
          visible={showImageModal}
          onDismiss={() => setShowImageModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {modalImage && (
            <View style={styles.modalContent}>
              <Image source={{ uri: modalImage.uri }} style={styles.modalImage} />
              <Text style={styles.modalPrompt}>{modalImage.prompt}</Text>
              <Text style={styles.modalStyle}>Style: {modalImage.style}</Text>
              <Button
                mode="contained"
                onPress={() => setShowImageModal(false)}
                style={styles.modalCloseButton}
              >
                Close
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
  },
  tabButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
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
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: width - 64,
    height: width - 64,
    borderRadius: 12,
    marginBottom: 16,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imagePlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    marginTop: 16,
    marginBottom: 24,
    opacity: 0.6,
  },
  imagePickerButtons: {
    gap: 12,
  },
  imagePickerButton: {
    minWidth: 150,
  },
  analysisCard: {
    marginTop: 16,
  },
  analysisSection: {
    marginBottom: 12,
  },
  analysisLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  analysisChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  generateButton: {
    marginBottom: 24,
  },
  galleryTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageCard: {
    width: (width - 64) / 2,
    marginBottom: 16,
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  imageCardContent: {
    padding: 8,
  },
  imagePrompt: {
    fontSize: 12,
    marginBottom: 4,
  },
  styleChip: {
    alignSelf: 'flex-start',
  },
  emptyGallery: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    marginTop: 8,
    opacity: 0.6,
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalImage: {
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalPrompt: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalStyle: {
    opacity: 0.7,
    marginBottom: 16,
  },
  modalCloseButton: {
    minWidth: 100,
  },
});
