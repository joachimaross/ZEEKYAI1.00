// Netlify Edge Function for Performance Optimization
// Optimizes content delivery based on device capabilities and network conditions

export default async (request, context) => {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Skip non-HTML requests for most optimizations
  if (url.pathname.includes('.') && !url.pathname.endsWith('.html')) {
    return handleAssetOptimization(request, context);
  }
  
  // Get device and network information
  const deviceInfo = getDeviceInfo(userAgent);
  const networkInfo = getNetworkInfo(request.headers);
  
  // Get the original response
  const response = await context.next();
  
  // Only process HTML responses for content optimization
  if (!response.headers.get('content-type')?.includes('text/html')) {
    return response;
  }
  
  let html = await response.text();
  
  // Apply performance optimizations based on device and network
  html = optimizeForDevice(html, deviceInfo);
  html = optimizeForNetwork(html, networkInfo);
  html = addPerformanceHints(html, deviceInfo, networkInfo);
  html = optimizeImages(html, deviceInfo);
  html = optimizeScripts(html, deviceInfo, networkInfo);
  
  // Inject performance monitoring
  const performanceScript = `
    <script>
      window.ZEEKY_PERFORMANCE = {
        device: ${JSON.stringify(deviceInfo)},
        network: ${JSON.stringify(networkInfo)},
        optimizations: {
          imageOptimization: ${deviceInfo.lowEnd || networkInfo.slow},
          scriptDefer: ${networkInfo.slow},
          lazyLoading: true,
          prefetch: ${!networkInfo.slow}
        },
        edgeLocation: '${context.geo?.city || 'unknown'}',
        timestamp: ${Date.now()}
      };
      
      // Performance monitoring
      if ('performance' in window) {
        window.addEventListener('load', function() {
          setTimeout(function() {
            const perfData = {
              loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
              domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
              firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
              firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
            };
            
            // Send performance data (optional)
            if (window.ZEEKY_PERFORMANCE.network.connection !== 'slow') {
              fetch('/edge-api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'performance', data: perfData })
              }).catch(() => {}); // Ignore errors
            }
          }, 1000);
        });
      }
    </script>
  `;
  
  html = html.replace('</head>', performanceScript + '</head>');
  
  // Create optimized response with performance headers
  const optimizedResponse = new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers),
      'content-type': 'text/html; charset=utf-8',
      'x-optimized': 'true',
      'x-device-type': deviceInfo.type,
      'x-network-type': networkInfo.connection,
      'x-edge-optimized': 'true',
      // Performance headers
      'cache-control': getCacheControl(deviceInfo, networkInfo),
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'strict-origin-when-cross-origin'
    }
  });
  
  return optimizedResponse;
};

async function handleAssetOptimization(request, context) {
  const response = await context.next();
  const url = new URL(request.url);
  
  // Add optimized headers for static assets
  const headers = new Headers(response.headers);
  
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
    headers.set('cache-control', 'public, max-age=31536000, immutable');
    headers.set('x-content-type-options', 'nosniff');
  }
  
  if (url.pathname.match(/\.(js|css|html|svg)$/)) {
    headers.set('content-encoding', 'gzip');
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function getDeviceInfo(userAgent) {
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const isTablet = /iPad|Tablet/i.test(userAgent);
  const isLowEnd = /Android.*[2-4]\.|iPhone.*OS [5-9]_/i.test(userAgent);
  
  return {
    type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    isMobile,
    isTablet,
    lowEnd: isLowEnd,
    browser: getBrowser(userAgent),
    supportsWebP: userAgent.includes('Chrome') || userAgent.includes('Firefox'),
    supportsAVIF: userAgent.includes('Chrome/') && parseInt(userAgent.match(/Chrome\/(\d+)/)?.[1] || '0') >= 85
  };
}

function getNetworkInfo(headers) {
  const connection = headers.get('downlink') || headers.get('connection');
  const saveData = headers.get('save-data') === 'on';
  
  let connectionType = 'unknown';
  let slow = false;
  
  if (saveData) {
    connectionType = 'slow';
    slow = true;
  } else if (connection) {
    const downlink = parseFloat(connection);
    if (downlink < 1.5) {
      connectionType = 'slow';
      slow = true;
    } else if (downlink < 5) {
      connectionType = 'medium';
    } else {
      connectionType = 'fast';
    }
  }
  
  return {
    connection: connectionType,
    slow,
    saveData,
    downlink: connection ? parseFloat(connection) : null
  };
}

function optimizeForDevice(html, deviceInfo) {
  if (deviceInfo.isMobile) {
    // Add mobile-specific optimizations
    html = html.replace('<meta name="viewport"', 
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"');
    
    // Add mobile web app capabilities
    const mobileOptimizations = `
      <meta name="mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
      <meta name="theme-color" content="#6366F1">
    `;
    html = html.replace('</head>', mobileOptimizations + '</head>');
  }
  
  if (deviceInfo.lowEnd) {
    // Reduce animations and effects for low-end devices
    const lowEndOptimizations = `
      <style>
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-delay: -0.01ms !important;
          transition-duration: 0.01ms !important;
          transition-delay: 0.01ms !important;
        }
        .dashboard-bg::before { animation: none !important; }
        .progress-fill::after { animation: none !important; }
      </style>
    `;
    html = html.replace('</head>', lowEndOptimizations + '</head>');
  }
  
  return html;
}

function optimizeForNetwork(html, networkInfo) {
  if (networkInfo.slow || networkInfo.saveData) {
    // Remove non-essential content for slow connections
    html = html.replace(/<video[^>]*>.*?<\/video>/gs, '');
    
    // Reduce image quality hints
    html = html.replace(/(<img[^>]*)/g, '$1 loading="lazy"');
    
    // Add data-saver optimizations
    const dataSaverOptimizations = `
      <style>
        .dashboard-bg { display: none !important; }
        .card-shadow, .glow-shadow { box-shadow: none !important; }
        .backdrop-filter { backdrop-filter: none !important; }
      </style>
    `;
    html = html.replace('</head>', dataSaverOptimizations + '</head>');
  }
  
  return html;
}

function addPerformanceHints(html, deviceInfo, networkInfo) {
  let hints = '';
  
  // Add resource hints based on device and network
  if (!networkInfo.slow) {
    hints += '<link rel="dns-prefetch" href="//fonts.googleapis.com">\n';
    hints += '<link rel="dns-prefetch" href="//cdnjs.cloudflare.com">\n';
    hints += '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n';
  }
  
  // Preload critical resources
  hints += '<link rel="preload" href="/assets/zeeky-logo.svg" as="image">\n';
  hints += '<link rel="preload" href="/styles/futuristic-dashboard.css" as="style">\n';
  
  if (!deviceInfo.lowEnd && !networkInfo.slow) {
    hints += '<link rel="prefetch" href="/smart-home.html">\n';
    hints += '<link rel="prefetch" href="/car-mode.html">\n';
  }
  
  html = html.replace('</head>', hints + '</head>');
  
  return html;
}

function optimizeImages(html, deviceInfo) {
  // Add responsive image attributes
  html = html.replace(/<img([^>]*src="[^"]*\.(jpg|jpeg|png|webp)"[^>]*)>/gi, (match, attrs) => {
    if (!attrs.includes('loading=')) {
      attrs += ' loading="lazy"';
    }
    if (!attrs.includes('decoding=')) {
      attrs += ' decoding="async"';
    }
    
    // Add WebP support for compatible browsers
    if (deviceInfo.supportsWebP && !attrs.includes('srcset=')) {
      const srcMatch = attrs.match(/src="([^"]+)"/);
      if (srcMatch) {
        const originalSrc = srcMatch[1];
        const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/, '.webp');
        attrs = attrs.replace(/src="[^"]*"/, `src="${webpSrc}"`);
        attrs += ` data-fallback="${originalSrc}"`;
      }
    }
    
    return `<img${attrs}>`;
  });
  
  return html;
}

function optimizeScripts(html, deviceInfo, networkInfo) {
  if (networkInfo.slow) {
    // Defer non-critical scripts
    html = html.replace(/<script(?![^>]*defer)(?![^>]*async)([^>]*src="[^"]*"[^>]*)>/gi, 
      '<script defer$1>');
  }
  
  if (deviceInfo.lowEnd) {
    // Remove heavy scripts for low-end devices
    html = html.replace(/<script[^>]*src="[^"]*analytics[^"]*"[^>]*><\/script>/gi, '');
  }
  
  return html;
}

function getCacheControl(deviceInfo, networkInfo) {
  if (networkInfo.slow || deviceInfo.lowEnd) {
    return 'public, max-age=3600, stale-while-revalidate=86400';
  } else {
    return 'public, max-age=300, stale-while-revalidate=3600';
  }
}

function getBrowser(userAgent) {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

export const config = {
  path: "/*"
};
