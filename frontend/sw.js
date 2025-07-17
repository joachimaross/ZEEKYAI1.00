// Zeeky AI Service Worker - PWA Functionality
const CACHE_NAME = 'zeeky-ai-v1.0.0';
const STATIC_CACHE = 'zeeky-static-v1.0.0';
const DYNAMIC_CACHE = 'zeeky-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/styles/extensions.css',
    '/scripts/main.js',
    '/scripts/admin.js',
    '/scripts/extensions/voice-handler.js',
    '/scripts/extensions/file-handler.js',
    '/scripts/extensions/analytics.js',
    '/scripts/extensions/keyboard-shortcuts.js',
    '/scripts/extensions/ai-models.js',
    '/scripts/extensions/theme-manager.js',
    '/scripts/extensions/collaboration.js',
    '/scripts/extensions/ai-personalities.js',
    '/scripts/extensions/code-laboratory.js',
    '/scripts/extensions/vision-ai.js',
    '/scripts/extensions/workflow-automation.js',
    '/manifest.json',
    '/assets/zeeky-logo.svg'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('🚀 Zeeky AI Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Caching static files...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🔄 Zeeky AI Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached files or fetch from network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (STATIC_FILES.includes(url.pathname)) {
        // Static files - cache first strategy
        event.respondWith(cacheFirst(request));
    } else if (url.pathname.startsWith('/api/')) {
        // API requests - network first strategy
        event.respondWith(networkFirst(request));
    } else if (request.destination === 'image') {
        // Images - cache first strategy
        event.respondWith(cacheFirst(request));
    } else {
        // Other requests - network first strategy
        event.respondWith(networkFirst(request));
    }
});

// Cache first strategy
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }
        
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync-messages') {
        event.waitUntil(syncOfflineMessages());
    } else if (event.tag === 'background-sync-analytics') {
        event.waitUntil(syncOfflineAnalytics());
    }
});

// Sync offline messages when back online
async function syncOfflineMessages() {
    try {
        const offlineMessages = await getOfflineMessages();
        
        for (const message of offlineMessages) {
            try {
                await fetch('/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(message)
                });
                
                // Remove from offline storage after successful sync
                await removeOfflineMessage(message.id);
            } catch (error) {
                console.error('Failed to sync message:', error);
            }
        }
        
        console.log('✅ Offline messages synced');
    } catch (error) {
        console.error('❌ Failed to sync offline messages:', error);
    }
}

// Sync offline analytics when back online
async function syncOfflineAnalytics() {
    try {
        const offlineAnalytics = await getOfflineAnalytics();
        
        for (const analytics of offlineAnalytics) {
            try {
                await fetch('/api/analytics', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(analytics)
                });
                
                await removeOfflineAnalytics(analytics.id);
            } catch (error) {
                console.error('Failed to sync analytics:', error);
            }
        }
        
        console.log('✅ Offline analytics synced');
    } catch (error) {
        console.error('❌ Failed to sync offline analytics:', error);
    }
}

// Push notification handling
self.addEventListener('push', event => {
    console.log('📱 Push notification received');
    
    const options = {
        body: 'You have new updates in Zeeky AI',
        icon: '/assets/icon-192.png',
        badge: '/assets/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open Zeeky AI',
                icon: '/assets/icon-192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/icon-192.png'
            }
        ]
    };
    
    if (event.data) {
        const data = event.data.json();
        options.body = data.body || options.body;
        options.title = data.title || 'Zeeky AI';
    }
    
    event.waitUntil(
        self.registration.showNotification('Zeeky AI', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('🔔 Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper functions for offline storage
async function getOfflineMessages() {
    // Implementation would use IndexedDB
    return [];
}

async function removeOfflineMessage(id) {
    // Implementation would use IndexedDB
    console.log('Removing offline message:', id);
}

async function getOfflineAnalytics() {
    // Implementation would use IndexedDB
    return [];
}

async function removeOfflineAnalytics(id) {
    // Implementation would use IndexedDB
    console.log('Removing offline analytics:', id);
}

// Message handling for communication with main thread
self.addEventListener('message', event => {
    console.log('📨 Service Worker received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('🚀 Zeeky AI Service Worker loaded successfully');
