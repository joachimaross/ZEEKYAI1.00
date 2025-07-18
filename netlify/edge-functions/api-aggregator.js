// Netlify Edge Function for API Aggregation
// Aggregates multiple APIs and provides unified responses for Zeeky AI

export default async (request, context) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Handle different API endpoints
  if (pathname.startsWith('/edge-api/')) {
    const endpoint = pathname.replace('/edge-api/', '');
    
    try {
      switch (endpoint) {
        case 'weather':
          return await handleWeatherAPI(request, context);
        case 'news':
          return await handleNewsAPI(request, context);
        case 'ai-status':
          return await handleAIStatusAPI(request, context);
        case 'smart-home':
          return await handleSmartHomeAPI(request, context);
        case 'analytics':
          return await handleAnalyticsAPI(request, context);
        default:
          return new Response(JSON.stringify({ error: 'Unknown endpoint' }), {
            status: 404,
            headers: { 'content-type': 'application/json' }
          });
      }
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'API Error', 
        message: error.message 
      }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
  }
  
  // Pass through other requests
  return context.next();
};

async function handleWeatherAPI(request, context) {
  const country = context.geo?.country?.code || 'US';
  const city = context.geo?.city || 'New York';
  const lat = context.geo?.latitude || 40.7128;
  const lon = context.geo?.longitude || -74.0060;
  
  // Mock weather data (in production, you'd call a real weather API)
  const weatherData = {
    location: { city, country, lat, lon },
    current: {
      temperature: Math.round(Math.random() * 30 + 10), // 10-40°C
      condition: ['sunny', 'cloudy', 'rainy', 'partly-cloudy'][Math.floor(Math.random() * 4)],
      humidity: Math.round(Math.random() * 40 + 40), // 40-80%
      windSpeed: Math.round(Math.random() * 20 + 5), // 5-25 km/h
      timestamp: new Date().toISOString()
    },
    forecast: Array.from({ length: 5 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      high: Math.round(Math.random() * 30 + 15),
      low: Math.round(Math.random() * 15 + 5),
      condition: ['sunny', 'cloudy', 'rainy', 'partly-cloudy'][Math.floor(Math.random() * 4)]
    }))
  };
  
  return new Response(JSON.stringify(weatherData), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=600', // Cache for 10 minutes
      'x-edge-location': city
    }
  });
}

async function handleNewsAPI(request, context) {
  const country = context.geo?.country?.code || 'US';
  
  // Mock news data (in production, you'd call a real news API)
  const newsData = {
    country,
    articles: [
      {
        id: 1,
        title: 'AI Technology Advances in 2025',
        summary: 'Latest developments in artificial intelligence and machine learning.',
        category: 'technology',
        timestamp: new Date().toISOString(),
        relevance: 'high'
      },
      {
        id: 2,
        title: 'Smart Home Integration Trends',
        summary: 'How IoT devices are becoming more intelligent and interconnected.',
        category: 'smart-home',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        relevance: 'medium'
      },
      {
        id: 3,
        title: 'Edge Computing Revolution',
        summary: 'The impact of edge computing on web applications and user experience.',
        category: 'technology',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        relevance: 'high'
      }
    ],
    lastUpdated: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(newsData), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=1800', // Cache for 30 minutes
      'x-country': country
    }
  });
}

async function handleAIStatusAPI(request, context) {
  const statusData = {
    status: 'online',
    version: '1.0.0',
    uptime: Math.floor(Math.random() * 86400), // Random uptime in seconds
    performance: {
      responseTime: Math.round(Math.random() * 100 + 50), // 50-150ms
      cpuUsage: Math.round(Math.random() * 60 + 20), // 20-80%
      memoryUsage: Math.round(Math.random() * 50 + 30), // 30-80%
      activeConnections: Math.floor(Math.random() * 1000 + 100)
    },
    features: {
      voiceRecognition: true,
      imageProcessing: true,
      naturalLanguage: true,
      codeGeneration: true,
      smartHome: true,
      carMode: true
    },
    lastHealthCheck: new Date().toISOString(),
    edgeLocation: context.geo?.city || 'Unknown'
  };
  
  return new Response(JSON.stringify(statusData), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=60', // Cache for 1 minute
      'x-ai-status': statusData.status
    }
  });
}

async function handleSmartHomeAPI(request, context) {
  const smartHomeData = {
    devices: [
      {
        id: 'light-001',
        name: 'Living Room Light',
        type: 'light',
        status: 'on',
        brightness: Math.round(Math.random() * 100),
        room: 'living-room'
      },
      {
        id: 'thermostat-001',
        name: 'Main Thermostat',
        type: 'thermostat',
        status: 'on',
        temperature: Math.round(Math.random() * 10 + 20), // 20-30°C
        targetTemperature: 22,
        room: 'living-room'
      },
      {
        id: 'camera-001',
        name: 'Front Door Camera',
        type: 'camera',
        status: 'active',
        recording: false,
        room: 'entrance'
      },
      {
        id: 'lock-001',
        name: 'Front Door Lock',
        type: 'lock',
        status: 'locked',
        room: 'entrance'
      }
    ],
    summary: {
      totalDevices: 4,
      onlineDevices: 4,
      offlineDevices: 0,
      energyUsage: Math.round(Math.random() * 500 + 200), // 200-700W
      securityStatus: 'secure'
    },
    lastUpdated: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(smartHomeData), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=30', // Cache for 30 seconds
      'x-device-count': smartHomeData.summary.totalDevices.toString()
    }
  });
}

async function handleAnalyticsAPI(request, context) {
  const country = context.geo?.country?.code || 'US';
  const city = context.geo?.city || 'Unknown';
  
  const analyticsData = {
    session: {
      id: generateSessionId(),
      startTime: new Date().toISOString(),
      location: { country, city },
      device: getDeviceInfo(request.headers.get('user-agent') || ''),
      referrer: request.headers.get('referer') || 'direct'
    },
    metrics: {
      pageViews: Math.floor(Math.random() * 1000 + 100),
      uniqueVisitors: Math.floor(Math.random() * 500 + 50),
      averageSessionDuration: Math.round(Math.random() * 300 + 120), // 2-7 minutes
      bounceRate: Math.round(Math.random() * 30 + 20) // 20-50%
    },
    features: {
      mostUsed: ['chat', 'smart-home', 'voice-commands'],
      leastUsed: ['code-lab', 'car-mode'],
      trending: ['ai-personalities', 'file-upload']
    },
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(analyticsData), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'private, max-age=0', // Don't cache analytics
      'x-session-id': analyticsData.session.id
    }
  });
}

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function getDeviceInfo(userAgent) {
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const isTablet = /iPad|Tablet/i.test(userAgent);
  
  return {
    type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    isMobile,
    isTablet,
    browser: getBrowser(userAgent),
    os: getOS(userAgent)
  };
}

function getBrowser(userAgent) {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getOS(userAgent) {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

export const config = {
  path: "/edge-api/*"
};
