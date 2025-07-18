// Netlify Edge Function for Content Localization
// Localizes content based on user location and language preferences

export default async (request, context) => {
  const url = new URL(request.url);
  
  // Skip non-HTML requests
  if (url.pathname.includes('.') && !url.pathname.endsWith('.html')) {
    return context.next();
  }
  
  // Get user location and language preferences
  const country = context.geo?.country?.code || 'US';
  const acceptLanguage = request.headers.get('accept-language') || 'en';
  const cookies = request.headers.get('cookie') || '';
  const userLanguage = extractLanguageFromCookies(cookies) || extractLanguageFromHeader(acceptLanguage);
  
  // Get the original response
  const response = await context.next();
  
  // Only process HTML responses
  if (!response.headers.get('content-type')?.includes('text/html')) {
    return response;
  }
  
  let html = await response.text();
  
  // Apply localization
  html = localizeContent(html, userLanguage, country);
  html = localizeCurrency(html, country);
  html = localizeDateTime(html, context.geo?.timezone || 'UTC');
  html = localizeUnits(html, country);
  
  // Inject localization data
  const localizationScript = `
    <script>
      window.ZEEKY_LOCALIZATION = {
        language: '${userLanguage}',
        country: '${country}',
        timezone: '${context.geo?.timezone || 'UTC'}',
        currency: '${getCurrencyForCountry(country)}',
        dateFormat: '${getDateFormatForCountry(country)}',
        units: '${getUnitsForCountry(country)}',
        rtl: ${isRTLLanguage(userLanguage)}
      };
      
      // Apply RTL if needed
      if (window.ZEEKY_LOCALIZATION.rtl) {
        document.documentElement.dir = 'rtl';
        document.documentElement.classList.add('rtl');
      }
      
      // Set language attribute
      document.documentElement.lang = '${userLanguage}';
      
      // Trigger localization event
      document.addEventListener('DOMContentLoaded', function() {
        window.dispatchEvent(new CustomEvent('zeeky:localized', { 
          detail: window.ZEEKY_LOCALIZATION 
        }));
      });
    </script>
  `;
  
  html = html.replace('</head>', localizationScript + '</head>');
  
  // Create localized response
  const localizedResponse = new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers),
      'content-type': 'text/html; charset=utf-8',
      'content-language': userLanguage,
      'x-localized': 'true',
      'x-user-language': userLanguage,
      'x-user-country': country,
      'vary': 'Accept-Language, Cookie'
    }
  });
  
  return localizedResponse;
};

function extractLanguageFromCookies(cookies) {
  const match = cookies.match(/zeeky_language=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function extractLanguageFromHeader(acceptLanguage) {
  const languages = acceptLanguage.split(',').map(lang => {
    const [code, quality] = lang.trim().split(';q=');
    return { code: code.split('-')[0], quality: quality ? parseFloat(quality) : 1.0 };
  });
  
  languages.sort((a, b) => b.quality - a.quality);
  return languages[0]?.code || 'en';
}

function localizeContent(html, language, country) {
  const translations = getTranslations();
  
  // Replace translatable content
  Object.entries(translations[language] || translations.en).forEach(([key, value]) => {
    const regex = new RegExp(`{{t:${key}}}`, 'g');
    html = html.replace(regex, value);
  });
  
  // Localize common UI elements
  html = html.replace(/{{WELCOME}}/g, translations[language]?.welcome || translations.en.welcome);
  html = html.replace(/{{SETTINGS}}/g, translations[language]?.settings || translations.en.settings);
  html = html.replace(/{{LOADING}}/g, translations[language]?.loading || translations.en.loading);
  
  return html;
}

function localizeCurrency(html, country) {
  const currency = getCurrencyForCountry(country);
  const symbol = getCurrencySymbol(currency);
  
  // Replace currency placeholders
  html = html.replace(/\$(\d+(?:\.\d{2})?)/g, (match, amount) => {
    const convertedAmount = convertCurrency(parseFloat(amount), 'USD', currency);
    return `${symbol}${convertedAmount.toFixed(2)}`;
  });
  
  return html;
}

function localizeDateTime(html, timezone) {
  const now = new Date();
  const localTime = now.toLocaleString('en-US', { timeZone: timezone });
  
  // Replace time placeholders
  html = html.replace(/{{CURRENT_TIME}}/g, localTime);
  html = html.replace(/{{CURRENT_DATE}}/g, now.toLocaleDateString('en-US', { timeZone: timezone }));
  
  return html;
}

function localizeUnits(html, country) {
  const useMetric = country !== 'US';
  
  if (useMetric) {
    // Convert Fahrenheit to Celsius
    html = html.replace(/(\d+)°F/g, (match, temp) => {
      const celsius = Math.round((parseInt(temp) - 32) * 5 / 9);
      return `${celsius}°C`;
    });
    
    // Convert miles to kilometers
    html = html.replace(/(\d+(?:\.\d+)?)\s*miles?/g, (match, distance) => {
      const km = (parseFloat(distance) * 1.60934).toFixed(1);
      return `${km} km`;
    });
    
    // Convert feet to meters
    html = html.replace(/(\d+)\s*feet?/g, (match, feet) => {
      const meters = (parseInt(feet) * 0.3048).toFixed(1);
      return `${meters} m`;
    });
  }
  
  return html;
}

function getTranslations() {
  return {
    en: {
      welcome: 'Welcome to Zeeky AI',
      settings: 'Settings',
      loading: 'Loading...',
      dashboard: 'Dashboard',
      smartHome: 'Smart Home',
      carMode: 'Car Mode',
      codeLab: 'Code Lab',
      testing: 'Testing',
      profile: 'Profile',
      logout: 'Logout',
      login: 'Login',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      help: 'Help'
    },
    es: {
      welcome: 'Bienvenido a Zeeky AI',
      settings: 'Configuración',
      loading: 'Cargando...',
      dashboard: 'Panel de Control',
      smartHome: 'Casa Inteligente',
      carMode: 'Modo Automóvil',
      codeLab: 'Laboratorio de Código',
      testing: 'Pruebas',
      profile: 'Perfil',
      logout: 'Cerrar Sesión',
      login: 'Iniciar Sesión',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      search: 'Buscar',
      help: 'Ayuda'
    },
    fr: {
      welcome: 'Bienvenue sur Zeeky AI',
      settings: 'Paramètres',
      loading: 'Chargement...',
      dashboard: 'Tableau de Bord',
      smartHome: 'Maison Intelligente',
      carMode: 'Mode Voiture',
      codeLab: 'Laboratoire de Code',
      testing: 'Tests',
      profile: 'Profil',
      logout: 'Déconnexion',
      login: 'Connexion',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      search: 'Rechercher',
      help: 'Aide'
    },
    de: {
      welcome: 'Willkommen bei Zeeky AI',
      settings: 'Einstellungen',
      loading: 'Laden...',
      dashboard: 'Dashboard',
      smartHome: 'Smart Home',
      carMode: 'Auto-Modus',
      codeLab: 'Code-Labor',
      testing: 'Tests',
      profile: 'Profil',
      logout: 'Abmelden',
      login: 'Anmelden',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      search: 'Suchen',
      help: 'Hilfe'
    },
    ja: {
      welcome: 'Zeeky AIへようこそ',
      settings: '設定',
      loading: '読み込み中...',
      dashboard: 'ダッシュボード',
      smartHome: 'スマートホーム',
      carMode: 'カーモード',
      codeLab: 'コードラボ',
      testing: 'テスト',
      profile: 'プロフィール',
      logout: 'ログアウト',
      login: 'ログイン',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      search: '検索',
      help: 'ヘルプ'
    }
  };
}

function getCurrencyForCountry(country) {
  const currencyMap = {
    'US': 'USD', 'CA': 'CAD', 'GB': 'GBP', 'AU': 'AUD',
    'FR': 'EUR', 'DE': 'EUR', 'ES': 'EUR', 'IT': 'EUR', 'NL': 'EUR',
    'JP': 'JPY', 'CN': 'CNY', 'KR': 'KRW', 'IN': 'INR',
    'BR': 'BRL', 'MX': 'MXN', 'RU': 'RUB', 'CH': 'CHF'
  };
  return currencyMap[country] || 'USD';
}

function getCurrencySymbol(currency) {
  const symbols = {
    'USD': '$', 'CAD': 'C$', 'GBP': '£', 'AUD': 'A$',
    'EUR': '€', 'JPY': '¥', 'CNY': '¥', 'KRW': '₩',
    'INR': '₹', 'BRL': 'R$', 'MXN': '$', 'RUB': '₽', 'CHF': 'CHF'
  };
  return symbols[currency] || '$';
}

function convertCurrency(amount, fromCurrency, toCurrency) {
  // Mock exchange rates (in production, use a real currency API)
  const rates = {
    'USD': 1.0, 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110.0,
    'CAD': 1.25, 'AUD': 1.35, 'CNY': 6.45, 'KRW': 1180.0,
    'INR': 74.5, 'BRL': 5.2, 'MXN': 20.1, 'RUB': 73.5, 'CHF': 0.92
  };
  
  const usdAmount = amount / (rates[fromCurrency] || 1);
  return usdAmount * (rates[toCurrency] || 1);
}

function getDateFormatForCountry(country) {
  const formats = {
    'US': 'MM/DD/YYYY',
    'GB': 'DD/MM/YYYY',
    'CA': 'DD/MM/YYYY',
    'AU': 'DD/MM/YYYY',
    'DE': 'DD.MM.YYYY',
    'FR': 'DD/MM/YYYY',
    'JP': 'YYYY/MM/DD',
    'CN': 'YYYY/MM/DD',
    'KR': 'YYYY.MM.DD'
  };
  return formats[country] || 'MM/DD/YYYY';
}

function getUnitsForCountry(country) {
  return country === 'US' ? 'imperial' : 'metric';
}

function isRTLLanguage(language) {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language);
}

export const config = {
  path: "/*",
  excludedPath: ["/api/*", "/edge-api/*", "/auth/*", "/assets/*", "/styles/*", "/scripts/*", "/_redirects", "/robots.txt", "/sitemap.xml"]
};
