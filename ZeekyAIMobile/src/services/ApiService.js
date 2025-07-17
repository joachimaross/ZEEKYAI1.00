// Zeeky AI Mobile - API Service
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

class ApiService {
  constructor() {
    // Determine API base URL based on environment
    this.baseURL = __DEV__ 
      ? 'http://localhost:5000' 
      : 'https://your-production-api.herokuapp.com';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          await this.handleTokenRefresh();
        }
        return Promise.reject(error);
      }
    );
  }

  async handleTokenRefresh() {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (refreshToken) {
        const response = await this.api.post('/auth/refresh', {
          refresh_token: refreshToken
        });
        
        if (response.data.success) {
          await SecureStore.setItemAsync('auth_token', response.data.token);
          return response.data.token;
        }
      }
    } catch (error) {
      // Refresh failed, logout user
      await this.logout();
    }
    return null;
  }

  // Authentication methods
  async login(email, password) {
    try {
      const response = await this.api.post('/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        await SecureStore.setItemAsync('auth_token', response.data.token);
        await SecureStore.setItemAsync('refresh_token', response.data.refresh_token);
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(email, password, username, profileData = {}) {
    try {
      const response = await this.api.post('/auth/register', {
        email,
        password,
        username,
        profile_data: profileData
      });

      if (response.data.success) {
        await SecureStore.setItemAsync('auth_token', response.data.token);
        await SecureStore.setItemAsync('refresh_token', response.data.refresh_token);
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('refresh_token');
      await SecureStore.deleteItemAsync('user_data');
    }
  }

  // Chat methods
  async sendMessage(message, personality = 'default', conversationId = null) {
    try {
      const response = await this.api.post('/api/chat', {
        message,
        personality,
        conversation_id: conversationId
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConversations() {
    try {
      const response = await this.api.get('/conversations');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConversationMessages(conversationId) {
    try {
      const response = await this.api.get(`/conversations/${conversationId}/messages`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // File processing methods
  async uploadFile(fileUri, fileName, fileType) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: fileType
      });

      const response = await this.api.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async processFile(fileId, processingType = 'analyze') {
    try {
      const response = await this.api.post('/api/files/process', {
        file_id: fileId,
        processing_type: processingType
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Image generation and analysis
  async generateImage(prompt, style = 'realistic', size = '1024x1024') {
    try {
      const response = await this.api.post('/api/images/generate', {
        prompt,
        style,
        size
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async analyzeImage(imageUri) {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: 'image.jpg',
        type: 'image/jpeg'
      });

      const response = await this.api.post('/api/images/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Voice and speech methods
  async processVoiceCommand(audioUri) {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        name: 'voice.m4a',
        type: 'audio/m4a'
      });

      const response = await this.api.post('/api/voice/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Analytics and tracking
  async trackUserAction(action, data = {}) {
    try {
      const response = await this.api.post('/api/analytics/track', {
        action,
        data,
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      // Don't throw errors for analytics to avoid disrupting user experience
      console.warn('Analytics tracking failed:', error);
      return { success: false };
    }
  }

  // Utility methods
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data.message || 'Server error occurred',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        status: 0,
        data: null
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1,
        data: null
      };
    }
  }

  async isAuthenticated() {
    const token = await SecureStore.getItemAsync('auth_token');
    return !!token;
  }

  async getUserData() {
    const userData = await SecureStore.getItemAsync('user_data');
    return userData ? JSON.parse(userData) : null;
  }
}

export default new ApiService();
