// Netlify Edge Function for AI Personalization
// Personalizes content based on user preferences, location, and behavior

export default async (request, context) => {
  const url = new URL(request.url);
  
  // Get user context
  const country = context.geo?.country?.code || 'US';
  const city = context.geo?.city || 'Unknown';
  const timezone = context.geo?.timezone || 'UTC';
  const userAgent = request.headers.get('user-agent') || '';
  
  // Detect device type
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const isTablet = /iPad|Tablet/i.test(userAgent);
  const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
  
  // Get user preferences from cookies
  const cookies = request.headers.get('cookie') || '';
  const preferences = parseCookies(cookies);
  
  // Personalization data
  const personalizationData = {
    location: {
      country,
      city,
      timezone,
      localTime: new Date().toLocaleString('en-US', { timeZone: timezone })
    },
    device: {
      type: deviceType,
      isMobile,
      isTablet
    },
    preferences: {
      theme: preferences.theme || 'dark',
      language: preferences.language || getLanguageFromCountry(country),
      aiPersonality: preferences.aiPersonality || 'professional',
      notifications: preferences.notifications !== 'false'
    },
    features: {
      smartHome: preferences.smartHome !== 'false',
      carMode: preferences.carMode !== 'false',
      codeLab: preferences.codeLab !== 'false',
      voiceCommands: preferences.voiceCommands !== 'false'
    }
  };
  
  // Get the original response
  const response = await context.next();
  
  // Only process HTML responses
  if (!response.headers.get('content-type')?.includes('text/html')) {
    return response;
  }
  
  // Get the HTML content
  let html = await response.text();
  
  // Inject personalization data
  html = injectPersonalizationData(html, personalizationData);
  
  // Personalize content based on location
  html = personalizeByLocation(html, personalizationData.location);
  
  // Personalize content based on device
  html = personalizeByDevice(html, personalizationData.device);
  
  // Add personalized welcome message
  html = addPersonalizedWelcome(html, personalizationData);
  
  // Create new response with personalized content
  const personalizedResponse = new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers),
      'content-type': 'text/html; charset=utf-8',
      'x-personalized': 'true',
      'x-edge-location': context.geo?.city || 'unknown',
      'x-device-type': deviceType
    }
  });
  
  return personalizedResponse;
};

function parseCookies(cookieString) {
  const cookies = {};
  cookieString.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}

function getLanguageFromCountry(country) {
  const languageMap = {
    'US': 'en',
    'GB': 'en',
    'CA': 'en',
    'AU': 'en',
    'FR': 'fr',
    'DE': 'de',
    'ES': 'es',
    'IT': 'it',
    'JP': 'ja',
    'CN': 'zh',
    'KR': 'ko',
    'BR': 'pt',
    'MX': 'es',
    'IN': 'en',
    'RU': 'ru'
  };
  return languageMap[country] || 'en';
}

function injectPersonalizationData(html, data) {
  // Inject personalization data as a script tag
  const script = `
    <script>
      window.ZEEKY_PERSONALIZATION = ${JSON.stringify(data)};
      
      // Apply personalization immediately
      document.addEventListener('DOMContentLoaded', function() {
        if (window.applyPersonalization) {
          window.applyPersonalization(window.ZEEKY_PERSONALIZATION);
        }
      });
    </script>
  `;
  
  return html.replace('</head>', script + '</head>');
}

function personalizeByLocation(html, location) {
  // Add location-specific content
  const locationInfo = `
    <div class="location-info" style="display: none;" data-country="${location.country}" data-city="${location.city}" data-timezone="${location.timezone}">
      <span class="local-time">${location.localTime}</span>
    </div>
  `;
  
  // Replace placeholder or add to body
  if (html.includes('{{LOCATION_INFO}}')) {
    html = html.replace('{{LOCATION_INFO}}', locationInfo);
  } else {
    html = html.replace('<body', locationInfo + '<body');
  }
  
  // Localize time-sensitive content
  if (location.country === 'US') {
    html = html.replace(/colour/g, 'color');
    html = html.replace(/centre/g, 'center');
  }
  
  return html;
}

function personalizeByDevice(html, device) {
  // Add device-specific classes
  const deviceClasses = `device-${device.type} ${device.isMobile ? 'mobile' : ''} ${device.isTablet ? 'tablet' : ''}`;
  html = html.replace('<body', `<body class="${deviceClasses}"`);
  
  // Mobile-specific optimizations
  if (device.isMobile) {
    // Add mobile-specific meta tags
    const mobileOptimizations = `
      <meta name="mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    `;
    html = html.replace('</head>', mobileOptimizations + '</head>');
  }
  
  return html;
}

function addPersonalizedWelcome(html, data) {
  const timeOfDay = getTimeOfDay(data.location.timezone);
  const greeting = getLocalizedGreeting(data.preferences.language, timeOfDay);
  
  const welcomeMessage = `
    <div class="personalized-welcome" style="display: none;" data-greeting="${greeting}" data-location="${data.location.city}">
      <span class="greeting">${greeting}</span>
      <span class="location">from ${data.location.city}</span>
    </div>
  `;
  
  // Add welcome message
  html = html.replace('<body', welcomeMessage + '<body');
  
  return html;
}

function getTimeOfDay(timezone) {
  const hour = new Date().toLocaleString('en-US', { 
    timeZone: timezone, 
    hour: 'numeric', 
    hour12: false 
  });
  
  const hourNum = parseInt(hour);
  
  if (hourNum >= 5 && hourNum < 12) return 'morning';
  if (hourNum >= 12 && hourNum < 17) return 'afternoon';
  if (hourNum >= 17 && hourNum < 21) return 'evening';
  return 'night';
}

function getLocalizedGreeting(language, timeOfDay) {
  const greetings = {
    en: {
      morning: 'Good morning',
      afternoon: 'Good afternoon', 
      evening: 'Good evening',
      night: 'Good evening'
    },
    es: {
      morning: 'Buenos días',
      afternoon: 'Buenas tardes',
      evening: 'Buenas tardes',
      night: 'Buenas noches'
    },
    fr: {
      morning: 'Bonjour',
      afternoon: 'Bon après-midi',
      evening: 'Bonsoir',
      night: 'Bonsoir'
    },
    de: {
      morning: 'Guten Morgen',
      afternoon: 'Guten Tag',
      evening: 'Guten Abend',
      night: 'Guten Abend'
    },
    it: {
      morning: 'Buongiorno',
      afternoon: 'Buon pomeriggio',
      evening: 'Buonasera',
      night: 'Buonasera'
    },
    pt: {
      morning: 'Bom dia',
      afternoon: 'Boa tarde',
      evening: 'Boa tarde',
      night: 'Boa noite'
    },
    ja: {
      morning: 'おはようございます',
      afternoon: 'こんにちは',
      evening: 'こんばんは',
      night: 'こんばんは'
    },
    zh: {
      morning: '早上好',
      afternoon: '下午好',
      evening: '晚上好',
      night: '晚上好'
    },
    ko: {
      morning: '좋은 아침',
      afternoon: '좋은 오후',
      evening: '좋은 저녁',
      night: '좋은 저녁'
    },
    ru: {
      morning: 'Доброе утро',
      afternoon: 'Добрый день',
      evening: 'Добрый вечер',
      night: 'Добрый вечер'
    }
  };
  
  return greetings[language]?.[timeOfDay] || greetings.en[timeOfDay];
}

export const config = {
  path: "/*",
  excludedPath: ["/api/*", "/assets/*", "/styles/*", "/scripts/*", "/_redirects", "/robots.txt", "/sitemap.xml"]
};
