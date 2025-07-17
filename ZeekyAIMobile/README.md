# Zeeky AI Mobile App

A powerful mobile application that brings all the features of Zeeky AI to iOS and Android devices.

## Features

### 🤖 AI Chat
- Multiple AI personalities (Default, Professional, Creative, Technical, Friendly, Academic)
- Real-time conversation with advanced AI
- Chat history and conversation management
- Personality switching during conversations

### 🎨 Vision AI
- Image analysis and description
- AI image generation with multiple styles
- Photo capture and library integration
- Image gallery management

### 🎤 Voice Assistant
- Voice commands and speech recognition
- Text-to-speech responses
- Hands-free interaction
- Voice command processing

### 📁 File Management
- Document upload and processing
- File analysis with AI
- Support for multiple file formats
- Cloud storage integration

### ⚙️ Settings & Customization
- Theme customization (Light/Dark mode)
- Notification preferences
- Privacy settings
- Account management

## Technology Stack

- **Framework**: React Native with Expo
- **UI Library**: React Native Paper (Material Design 3)
- **Navigation**: React Navigation 6
- **State Management**: React Hooks + Context
- **Authentication**: Expo SecureStore
- **Animations**: React Native Animatable
- **Voice**: Expo Speech & Audio
- **Camera**: Expo Camera & Image Picker
- **Notifications**: Expo Notifications

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Setup
1. Clone the repository
2. Navigate to the mobile app directory:
   ```bash
   cd ZeekyAIMobile
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```

### Running on Devices
- **iOS**: `npm run ios`
- **Android**: `npm run android`
- **Web**: `npm run web`

## Building for Production

### Using EAS Build (Recommended)
1. Install EAS CLI:
   ```bash
   npm install -g @expo/eas-cli
   ```
2. Login to Expo:
   ```bash
   eas login
   ```
3. Configure the project:
   ```bash
   eas build:configure
   ```
4. Build for production:
   ```bash
   npm run build:all
   ```

### Platform-specific builds
- **Android**: `npm run build:android`
- **iOS**: `npm run build:ios`

## App Store Deployment

### iOS App Store
1. Build production iOS app:
   ```bash
   npm run build:ios
   ```
2. Submit to App Store:
   ```bash
   npm run submit:ios
   ```

### Google Play Store
1. Build production Android app:
   ```bash
   npm run build:android
   ```
2. Submit to Play Store:
   ```bash
   npm run submit:android
   ```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
API_BASE_URL=https://your-api-endpoint.com
OPENAI_API_KEY=your-openai-key
EXPO_PROJECT_ID=your-expo-project-id
```

### App Configuration
Update `app.json` with your app details:
- App name and description
- Bundle identifiers
- App icons and splash screens
- Permissions and capabilities

## Project Structure

```
ZeekyAIMobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens
│   ├── services/           # API and backend services
│   ├── navigation/         # Navigation configuration
│   ├── utils/              # Utility functions
│   ├── constants/          # App constants
│   ├── hooks/              # Custom React hooks
│   └── store/              # State management
├── assets/                 # Images, fonts, etc.
├── app.json               # Expo configuration
├── eas.json               # EAS Build configuration
└── package.json           # Dependencies and scripts
```

## Key Components

### ApiService
Handles all API communication with the backend:
- Authentication
- Chat messages
- File uploads
- Image processing
- Voice commands

### Navigation
- Tab navigation for main features
- Stack navigation for detailed screens
- Modal presentations for specific features

### Screens
- **HomeScreen**: Dashboard with quick actions
- **ChatScreen**: Main chat interface
- **VisionScreen**: Image analysis and generation
- **VoiceScreen**: Voice command interface
- **FilesScreen**: File management
- **SettingsScreen**: App configuration

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Debugging
- Use Expo DevTools for debugging
- React Native Debugger for advanced debugging
- Flipper for native debugging

## Deployment Checklist

### Pre-deployment
- [ ] Update version numbers
- [ ] Test on physical devices
- [ ] Verify all permissions
- [ ] Test offline functionality
- [ ] Performance optimization
- [ ] Security audit

### App Store Requirements
- [ ] App icons (all sizes)
- [ ] Screenshots for all devices
- [ ] App description and keywords
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Age rating information

### Post-deployment
- [ ] Monitor crash reports
- [ ] Track user analytics
- [ ] Gather user feedback
- [ ] Plan updates and improvements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Email: zeekyai@hotmail.com
- GitHub Issues: Create an issue in the repository
- Documentation: Check the docs folder

## Roadmap

### Version 1.1
- [ ] Offline mode improvements
- [ ] Advanced voice commands
- [ ] Custom personality creation
- [ ] Enhanced file processing

### Version 1.2
- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] Widget support
- [ ] Apple Watch/Wear OS apps

### Version 2.0
- [ ] AR/VR integration
- [ ] Advanced AI models
- [ ] Enterprise features
- [ ] Multi-language support
