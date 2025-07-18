// Netlify Function for AI Chat Processing
// Handles AI chat requests with enhanced processing capabilities

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, context: chatContext, personality, language } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Get user location from headers (passed from edge function)
    const userCountry = event.headers['x-country'] || 'US';
    const userCity = event.headers['x-edge-location'] || 'Unknown';
    const deviceType = event.headers['x-device-type'] || 'desktop';

    // Process the AI chat request
    const aiResponse = await processAIChat({
      message,
      context: chatContext,
      personality: personality || 'professional',
      language: language || 'en',
      userLocation: { country: userCountry, city: userCity },
      deviceType
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: aiResponse.text,
        context: aiResponse.context,
        suggestions: aiResponse.suggestions,
        metadata: {
          processingTime: aiResponse.processingTime,
          model: aiResponse.model,
          confidence: aiResponse.confidence,
          location: { country: userCountry, city: userCity },
          timestamp: new Date().toISOString()
        }
      })
    };

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process AI chat request'
      })
    };
  }
};

async function processAIChat({ message, context, personality, language, userLocation, deviceType }) {
  const startTime = Date.now();
  
  // Simulate AI processing (in production, integrate with your AI service)
  const responses = generateAIResponse(message, personality, language, userLocation, deviceType);
  
  const processingTime = Date.now() - startTime;
  
  return {
    text: responses.text,
    context: responses.context,
    suggestions: responses.suggestions,
    processingTime,
    model: 'zeeky-ai-v1.0',
    confidence: responses.confidence
  };
}

function generateAIResponse(message, personality, language, userLocation, deviceType) {
  const lowerMessage = message.toLowerCase();
  
  // Context-aware responses based on message content
  let response = '';
  let suggestions = [];
  let confidence = 0.8;
  
  // Smart Home related queries
  if (lowerMessage.includes('smart home') || lowerMessage.includes('lights') || lowerMessage.includes('thermostat')) {
    response = getSmartHomeResponse(lowerMessage, personality, language, userLocation);
    suggestions = [
      'Show me my smart home devices',
      'Turn on the living room lights',
      'Set temperature to 22°C',
      'Check security cameras'
    ];
    confidence = 0.9;
  }
  // Car Mode related queries
  else if (lowerMessage.includes('car') || lowerMessage.includes('driving') || lowerMessage.includes('navigation')) {
    response = getCarModeResponse(lowerMessage, personality, language, userLocation);
    suggestions = [
      'Start car mode',
      'Find nearest gas station',
      'Play driving music',
      'Call emergency services'
    ];
    confidence = 0.85;
  }
  // Code Lab related queries
  else if (lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('debug')) {
    response = getCodeLabResponse(lowerMessage, personality, language);
    suggestions = [
      'Open code laboratory',
      'Help me debug this code',
      'Generate a Python function',
      'Explain this algorithm'
    ];
    confidence = 0.9;
  }
  // Weather queries
  else if (lowerMessage.includes('weather') || lowerMessage.includes('temperature')) {
    response = getWeatherResponse(lowerMessage, personality, language, userLocation);
    suggestions = [
      'What\'s the weather like today?',
      'Will it rain tomorrow?',
      'Show me the weekly forecast',
      'What should I wear today?'
    ];
    confidence = 0.95;
  }
  // General greeting
  else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    response = getGreetingResponse(personality, language, userLocation);
    suggestions = [
      'What can you help me with?',
      'Show me my dashboard',
      'What\'s new today?',
      'Help me get started'
    ];
    confidence = 0.95;
  }
  // Help requests
  else if (lowerMessage.includes('help') || lowerMessage.includes('how to') || lowerMessage.includes('what can')) {
    response = getHelpResponse(personality, language, deviceType);
    suggestions = [
      'Show me all features',
      'How do I use smart home?',
      'What is car mode?',
      'Explain code laboratory'
    ];
    confidence = 0.9;
  }
  // Default response
  else {
    response = getDefaultResponse(message, personality, language, userLocation);
    suggestions = [
      'Tell me more about that',
      'How can I help you?',
      'Show me my options',
      'What else can you do?'
    ];
    confidence = 0.6;
  }
  
  return {
    text: response,
    context: { lastTopic: extractTopic(lowerMessage), userLocation, deviceType },
    suggestions,
    confidence
  };
}

function getSmartHomeResponse(message, personality, language, userLocation) {
  const responses = {
    professional: `I can help you manage your smart home devices. Based on your location in ${userLocation.city}, I can assist with lighting, temperature control, security systems, and energy management.`,
    friendly: `Hey! I'd love to help you with your smart home! 🏠 Whether it's adjusting lights, checking your thermostat, or keeping an eye on security, I've got you covered in ${userLocation.city}!`,
    creative: `Your smart home is like a symphony, and I'm the conductor! 🎼 Let's orchestrate the perfect ambiance for your ${userLocation.city} home with intelligent lighting, climate control, and security harmony.`,
    analytical: `Smart home optimization analysis: I can provide data-driven insights for your ${userLocation.city} residence, including energy efficiency metrics, usage patterns, and automated scheduling recommendations.`
  };
  
  return responses[personality] || responses.professional;
}

function getCarModeResponse(message, personality, language, userLocation) {
  const responses = {
    professional: `I can assist with your automotive needs. Car mode provides hands-free operation, navigation assistance, and safety features optimized for driving in ${userLocation.city}.`,
    friendly: `Ready to hit the road! 🚗 Car mode is perfect for safe, hands-free assistance while you're driving around ${userLocation.city}. I can help with navigation, calls, and entertainment!`,
    creative: `Your journey awaits! 🛣️ Car mode transforms me into your co-pilot, ready to navigate the streets of ${userLocation.city} with style and intelligence.`,
    analytical: `Car mode analysis: Optimized for vehicular operation with voice-first interface, minimal visual distractions, and location-aware services for ${userLocation.city} traffic patterns.`
  };
  
  return responses[personality] || responses.professional;
}

function getCodeLabResponse(message, personality, language) {
  const responses = {
    professional: `The Code Laboratory provides a comprehensive development environment with syntax highlighting, debugging tools, and AI-assisted coding capabilities.`,
    friendly: `Time to code! 💻 The Code Lab is your playground for programming. I can help you write, debug, and optimize code in multiple languages!`,
    creative: `Welcome to the digital forge! ⚡ In the Code Laboratory, we'll craft elegant solutions and bring your programming visions to life with AI-powered assistance.`,
    analytical: `Code Laboratory specifications: Multi-language support, real-time syntax analysis, automated testing framework, and performance optimization algorithms.`
  };
  
  return responses[personality] || responses.professional;
}

function getWeatherResponse(message, personality, language, userLocation) {
  const responses = {
    professional: `I can provide current weather conditions and forecasts for ${userLocation.city}, ${userLocation.country}. Would you like current conditions or extended forecast?`,
    friendly: `Let me check the weather for you in ${userLocation.city}! ☀️ I can tell you about current conditions, what to expect today, or the week ahead!`,
    creative: `The atmospheric canvas of ${userLocation.city} awaits! 🌤️ Let me paint you a picture of the weather patterns dancing across your sky.`,
    analytical: `Weather data analysis for ${userLocation.city}: I can provide meteorological data, precipitation probability, temperature trends, and atmospheric pressure readings.`
  };
  
  return responses[personality] || responses.professional;
}

function getGreetingResponse(personality, language, userLocation) {
  const timeOfDay = getTimeOfDay(userLocation.country);
  const greetings = {
    professional: `Good ${timeOfDay}! I'm Zeeky AI, your intelligent assistant. How may I help you today?`,
    friendly: `Hey there! 👋 Great ${timeOfDay} from ${userLocation.city}! I'm Zeeky, and I'm excited to help you with whatever you need!`,
    creative: `Greetings, brilliant human! ✨ The digital realm of ${userLocation.city} welcomes you this fine ${timeOfDay}. I'm Zeeky, your AI companion on this journey!`,
    analytical: `System initialized. Good ${timeOfDay}. I am Zeeky AI, operating from edge location ${userLocation.city}. Ready to process your requests.`
  };
  
  return greetings[personality] || greetings.professional;
}

function getHelpResponse(personality, language, deviceType) {
  const responses = {
    professional: `I can assist with smart home management, car mode for driving, code development in the laboratory, file processing, voice commands, and general AI assistance. What would you like to explore?`,
    friendly: `I'm here to help with tons of cool stuff! 🚀 Smart home control, car mode for safe driving, coding assistance, file uploads, voice commands, and so much more! What sounds interesting?`,
    creative: `Behold the realm of possibilities! 🌟 From commanding your smart castle to navigating digital highways, from crafting code to processing files - I'm your versatile AI companion!`,
    analytical: `Available modules: Smart Home Control System, Automotive Assistant Mode, Code Development Laboratory, File Processing Engine, Voice Recognition Interface, and Multi-modal AI Assistant. Select function for detailed specifications.`
  };
  
  return responses[personality] || responses.professional;
}

function getDefaultResponse(message, personality, language, userLocation) {
  const responses = {
    professional: `I understand you're asking about "${message}". I'm here to help with smart home control, car mode, coding assistance, and general AI tasks. Could you provide more specific details?`,
    friendly: `Interesting question about "${message}"! 🤔 I want to make sure I give you the best help possible. Could you tell me a bit more about what you're looking for?`,
    creative: `Ah, the mystery of "${message}" unfolds! 🔍 Like a digital detective, I'm ready to explore this topic with you. Share more details and let's solve this together!`,
    analytical: `Query analysis: "${message}" - Insufficient context for optimal response generation. Please provide additional parameters or specify desired output format.`
  };
  
  return responses[personality] || responses.professional;
}

function extractTopic(message) {
  if (message.includes('smart home') || message.includes('lights') || message.includes('thermostat')) return 'smart-home';
  if (message.includes('car') || message.includes('driving')) return 'car-mode';
  if (message.includes('code') || message.includes('programming')) return 'code-lab';
  if (message.includes('weather')) return 'weather';
  if (message.includes('help')) return 'help';
  return 'general';
}

function getTimeOfDay(country) {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}
