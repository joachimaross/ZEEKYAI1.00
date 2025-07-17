// Zeeky AI Environment Configuration
class EnvironmentConfig {
    constructor() {
        this.environment = this.detectEnvironment();
        this.config = this.loadConfig();
        this.features = this.loadFeatureFlags();
        
        this.setupEnvironment();
    }

    detectEnvironment() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // Development environment
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('dev.')) {
            return 'development';
        }
        
        // Staging environment
        if (hostname.includes('staging.') || hostname.includes('test.')) {
            return 'staging';
        }
        
        // Production environment
        return 'production';
    }

    loadConfig() {
        const baseConfig = {
            app: {
                name: 'Zeeky AI',
                version: '1.0.0',
                description: 'Advanced AI Assistant Platform'
            },
            api: {
                timeout: 30000,
                retries: 3,
                rateLimit: {
                    requests: 100,
                    window: 60000 // 1 minute
                }
            },
            storage: {
                prefix: 'zeeky_',
                encryption: false,
                compression: true
            },
            analytics: {
                enabled: true,
                trackingId: null,
                sampleRate: 1.0
            },
            performance: {
                enableMetrics: true,
                reportInterval: 60000,
                maxMemoryUsage: 100 * 1024 * 1024 // 100MB
            },
            security: {
                enableCSP: true,
                enableSRI: true,
                tokenExpiry: 3600000 // 1 hour
            }
        };

        // Environment-specific configurations
        const envConfigs = {
            development: {
                api: {
                    baseURL: 'http://localhost:5000/api',
                    timeout: 60000,
                    debug: true
                },
                analytics: {
                    enabled: false
                },
                performance: {
                    enableMetrics: true,
                    reportInterval: 10000
                },
                security: {
                    enableCSP: false,
                    enableSRI: false
                },
                debug: {
                    enabled: true,
                    level: 'debug',
                    showPerformance: true,
                    showNetworkRequests: true
                }
            },
            staging: {
                api: {
                    baseURL: 'https://staging-api.zeeky.ai/api',
                    timeout: 45000
                },
                analytics: {
                    enabled: true,
                    trackingId: 'GA-STAGING-ID'
                },
                performance: {
                    enableMetrics: true,
                    reportInterval: 30000
                },
                debug: {
                    enabled: true,
                    level: 'warn'
                }
            },
            production: {
                api: {
                    baseURL: '/api',
                    timeout: 30000,
                    debug: false
                },
                analytics: {
                    enabled: true,
                    trackingId: 'GA-PRODUCTION-ID'
                },
                performance: {
                    enableMetrics: true,
                    reportInterval: 60000
                },
                security: {
                    enableCSP: true,
                    enableSRI: true
                },
                debug: {
                    enabled: false,
                    level: 'error'
                }
            }
        };

        // Merge base config with environment-specific config
        return this.deepMerge(baseConfig, envConfigs[this.environment] || {});
    }

    loadFeatureFlags() {
        const baseFeatures = {
            // Core features
            chat: true,
            fileUpload: true,
            voiceInput: true,
            
            // Advanced features
            collaboration: true,
            personalities: true,
            codeLab: true,
            visionAI: true,
            workflows: true,
            
            // Experimental features
            realTimeSync: false,
            advancedAnalytics: false,
            aiTraining: false,
            
            // UI features
            darkMode: true,
            customThemes: true,
            animations: true,
            
            // Performance features
            lazyLoading: true,
            caching: true,
            compression: true,
            
            // Security features
            encryption: false,
            biometricAuth: false,
            
            // Integration features
            thirdPartyAPIs: true,
            webhooks: true,
            
            // Mobile features
            pwa: true,
            offlineMode: true,
            pushNotifications: false
        };

        // Environment-specific feature flags
        const envFeatures = {
            development: {
                realTimeSync: true,
                advancedAnalytics: true,
                aiTraining: true,
                encryption: false,
                pushNotifications: false
            },
            staging: {
                realTimeSync: true,
                advancedAnalytics: true,
                encryption: true,
                pushNotifications: true
            },
            production: {
                realTimeSync: true,
                advancedAnalytics: true,
                encryption: true,
                pushNotifications: true
            }
        };

        return { ...baseFeatures, ...(envFeatures[this.environment] || {}) };
    }

    setupEnvironment() {
        // Set global configuration
        window.ZEEKY_CONFIG = this.config;
        window.ZEEKY_FEATURES = this.features;
        window.ZEEKY_ENV = this.environment;

        // Setup debug mode
        if (this.config.debug?.enabled) {
            this.setupDebugMode();
        }

        // Setup performance monitoring
        if (this.config.performance.enableMetrics) {
            this.setupPerformanceMonitoring();
        }

        // Setup security headers
        if (this.config.security.enableCSP) {
            this.setupContentSecurityPolicy();
        }

        // Setup analytics
        if (this.config.analytics.enabled) {
            this.setupAnalytics();
        }

        console.log(`🚀 Zeeky AI initialized in ${this.environment} mode`);
    }

    setupDebugMode() {
        // Enable console debugging
        window.DEBUG = true;
        
        // Add debug panel
        if (this.config.debug.showPerformance) {
            this.createDebugPanel();
        }

        // Override console methods for better debugging
        const originalLog = console.log;
        console.log = (...args) => {
            if (this.config.debug.level === 'debug') {
                originalLog.apply(console, ['[DEBUG]', new Date().toISOString(), ...args]);
            }
        };

        console.log('Debug mode enabled');
    }

    createDebugPanel() {
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-width: 300px;
            display: none;
        `;
        
        debugPanel.innerHTML = `
            <div>Environment: ${this.environment}</div>
            <div>Version: ${this.config.app.version}</div>
            <div id="debug-memory">Memory: --</div>
            <div id="debug-performance">Performance: --</div>
        `;
        
        document.body.appendChild(debugPanel);

        // Toggle debug panel with Ctrl+Shift+D
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
            }
        });

        // Update debug info
        setInterval(() => {
            if (debugPanel.style.display !== 'none') {
                this.updateDebugInfo();
            }
        }, 1000);
    }

    updateDebugInfo() {
        const memoryInfo = performance.memory;
        const memoryElement = document.getElementById('debug-memory');
        const performanceElement = document.getElementById('debug-performance');
        
        if (memoryInfo && memoryElement) {
            const usedMB = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
            const totalMB = Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024);
            memoryElement.textContent = `Memory: ${usedMB}/${totalMB} MB`;
        }
        
        if (performanceElement) {
            const loadTime = Math.round(performance.now());
            performanceElement.textContent = `Load Time: ${loadTime}ms`;
        }
    }

    setupPerformanceMonitoring() {
        // Monitor performance metrics
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'navigation') {
                    console.log('Navigation timing:', entry);
                } else if (entry.entryType === 'resource') {
                    if (entry.duration > 1000) {
                        console.warn('Slow resource:', entry.name, entry.duration + 'ms');
                    }
                }
            }
        });

        observer.observe({ entryTypes: ['navigation', 'resource'] });

        // Monitor memory usage
        if (this.config.performance.maxMemoryUsage) {
            setInterval(() => {
                if (performance.memory && performance.memory.usedJSHeapSize > this.config.performance.maxMemoryUsage) {
                    console.warn('High memory usage detected:', performance.memory.usedJSHeapSize);
                    this.triggerMemoryCleanup();
                }
            }, 30000);
        }
    }

    setupContentSecurityPolicy() {
        // Set CSP meta tag if not already present
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const cspMeta = document.createElement('meta');
            cspMeta.httpEquiv = 'Content-Security-Policy';
            cspMeta.content = this.generateCSPPolicy();
            document.head.appendChild(cspMeta);
        }
    }

    generateCSPPolicy() {
        const policy = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self'",
            "connect-src 'self' wss: ws:",
            "media-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ];

        return policy.join('; ');
    }

    setupAnalytics() {
        if (this.config.analytics.trackingId) {
            // Setup Google Analytics or other analytics service
            console.log('Analytics initialized with ID:', this.config.analytics.trackingId);
        }
    }

    triggerMemoryCleanup() {
        // Trigger garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Clear caches
        if (window.caches) {
            caches.keys().then(names => {
                names.forEach(name => {
                    if (name.includes('dynamic')) {
                        caches.delete(name);
                    }
                });
            });
        }
        
        console.log('Memory cleanup triggered');
    }

    // Utility methods
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    // Public API
    get(path) {
        return this.getNestedValue(this.config, path);
    }

    getFeature(featureName) {
        return this.features[featureName] || false;
    }

    getEnvironment() {
        return this.environment;
    }

    isProduction() {
        return this.environment === 'production';
    }

    isDevelopment() {
        return this.environment === 'development';
    }

    isStaging() {
        return this.environment === 'staging';
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    updateFeature(featureName, enabled) {
        this.features[featureName] = enabled;
        window.ZEEKY_FEATURES = this.features;
        
        // Trigger feature update event
        window.dispatchEvent(new CustomEvent('featureUpdated', {
            detail: { feature: featureName, enabled }
        }));
    }
}

// Initialize environment configuration
window.environmentConfig = new EnvironmentConfig();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvironmentConfig;
}
