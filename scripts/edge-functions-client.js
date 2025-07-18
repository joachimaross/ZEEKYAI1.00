// Edge Functions Client for Zeeky AI
// Handles client-side interactions with Netlify Edge Functions

class EdgeFunctionsClient {
    constructor() {
        this.baseUrl = window.location.origin;
        this.personalizationData = window.ZEEKY_PERSONALIZATION || {};
        this.localizationData = window.ZEEKY_LOCALIZATION || {};
        this.performanceData = window.ZEEKY_PERFORMANCE || {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializePersonalization();
        this.initializeLocalization();
        this.setupPerformanceMonitoring();
    }

    setupEventListeners() {
        // Listen for personalization events
        window.addEventListener('zeeky:personalized', (event) => {
            this.handlePersonalizationUpdate(event.detail);
        });

        // Listen for localization events
        window.addEventListener('zeeky:localized', (event) => {
            this.handleLocalizationUpdate(event.detail);
        });

        // Setup API interaction buttons
        document.addEventListener('click', (event) => {
            if (event.target.matches('[data-edge-api]')) {
                this.handleEdgeAPICall(event.target);
            }
        });
    }

    initializePersonalization() {
        if (!this.personalizationData.location) return;

        // Update UI based on personalization data
        this.updateLocationInfo();
        this.updateGreeting();
        this.updateDeviceOptimizations();
    }

    initializeLocalization() {
        if (!this.localizationData.language) return;

        // Apply localization
        this.updateLanguageElements();
        this.updateCurrencyElements();
        this.updateDateTimeElements();
    }

    setupPerformanceMonitoring() {
        if (!this.performanceData.device) return;

        // Apply performance optimizations
        this.applyDeviceOptimizations();
        this.setupLazyLoading();
        this.monitorPerformance();
    }

    // API Methods
    async callEdgeAPI(endpoint, data = null, method = 'GET') {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };

            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.baseUrl}/edge-api/${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`Edge API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Edge API call failed:', error);
            throw error;
        }
    }

    async getWeather() {
        try {
            const weather = await this.callEdgeAPI('weather');
            this.updateWeatherDisplay(weather);
            return weather;
        } catch (error) {
            console.error('Failed to get weather:', error);
            return null;
        }
    }

    async getNews() {
        try {
            const news = await this.callEdgeAPI('news');
            this.updateNewsDisplay(news);
            return news;
        } catch (error) {
            console.error('Failed to get news:', error);
            return null;
        }
    }

    async getAIStatus() {
        try {
            const status = await this.callEdgeAPI('ai-status');
            this.updateAIStatusDisplay(status);
            return status;
        } catch (error) {
            console.error('Failed to get AI status:', error);
            return null;
        }
    }

    async getSmartHomeData() {
        try {
            const smartHome = await this.callEdgeAPI('smart-home');
            this.updateSmartHomeDisplay(smartHome);
            return smartHome;
        } catch (error) {
            console.error('Failed to get smart home data:', error);
            return null;
        }
    }

    async sendChatMessage(message, context = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/.netlify/functions/ai-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    context,
                    personality: this.personalizationData.preferences?.aiPersonality || 'professional',
                    language: this.localizationData.language || 'en'
                })
            });

            if (!response.ok) {
                throw new Error(`Chat API Error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            this.handleChatResponse(result);
            return result;
        } catch (error) {
            console.error('Failed to send chat message:', error);
            throw error;
        }
    }

    // Authentication Methods
    async login(email, password, rememberMe = false) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, rememberMe })
            });

            const result = await response.json();
            
            if (result.success) {
                this.handleLoginSuccess(result);
            } else {
                this.handleLoginError(result);
            }

            return result;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    async logout() {
        try {
            const response = await fetch(`${this.baseUrl}/auth/logout`, {
                method: 'POST'
            });

            const result = await response.json();
            
            if (result.success) {
                this.handleLogoutSuccess();
            }

            return result;
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }

    async verifyAuth() {
        try {
            const response = await fetch(`${this.baseUrl}/auth/verify`);
            const result = await response.json();
            
            if (result.authenticated) {
                this.handleAuthVerified(result.user);
            }

            return result;
        } catch (error) {
            console.error('Auth verification failed:', error);
            return { authenticated: false };
        }
    }

    // UI Update Methods
    updateLocationInfo() {
        const locationElements = document.querySelectorAll('[data-location]');
        locationElements.forEach(element => {
            const locationType = element.dataset.location;
            switch (locationType) {
                case 'city':
                    element.textContent = this.personalizationData.location.city;
                    break;
                case 'country':
                    element.textContent = this.personalizationData.location.country;
                    break;
                case 'time':
                    element.textContent = this.personalizationData.location.localTime;
                    break;
            }
        });
    }

    updateGreeting() {
        const greetingElements = document.querySelectorAll('.greeting, .welcome-message, .personalized-greeting');
        greetingElements.forEach(element => {
            if (this.personalizationData.greeting) {
                element.textContent = `${this.personalizationData.greeting} from ${this.personalizationData.location.city}`;
            }
        });
    }

    updateDeviceOptimizations() {
        const device = this.personalizationData.device;
        if (!device) return;

        // Add device-specific classes
        document.body.classList.add(`device-${device.type}`);
        
        if (device.isMobile) {
            document.body.classList.add('mobile-device');
        }
        
        if (device.isTablet) {
            document.body.classList.add('tablet-device');
        }
    }

    updateLanguageElements() {
        const langElements = document.querySelectorAll('[data-translate]');
        langElements.forEach(element => {
            const key = element.dataset.translate;
            const translation = this.getTranslation(key);
            if (translation) {
                element.textContent = translation;
            }
        });
    }

    updateCurrencyElements() {
        const currencyElements = document.querySelectorAll('[data-currency]');
        currencyElements.forEach(element => {
            const amount = parseFloat(element.dataset.currency);
            const currency = this.localizationData.currency || 'USD';
            const formatted = this.formatCurrency(amount, currency);
            element.textContent = formatted;
        });
    }

    updateDateTimeElements() {
        const dateElements = document.querySelectorAll('[data-datetime]');
        dateElements.forEach(element => {
            const timestamp = element.dataset.datetime;
            const formatted = this.formatDateTime(timestamp);
            element.textContent = formatted;
        });
    }

    updateWeatherDisplay(weather) {
        const weatherContainer = document.querySelector('.weather-display, #weather-info');
        if (!weatherContainer) return;

        weatherContainer.innerHTML = `
            <div class="weather-current">
                <div class="weather-temp">${weather.current.temperature}°</div>
                <div class="weather-condition">${weather.current.condition}</div>
                <div class="weather-location">${weather.location.city}</div>
            </div>
            <div class="weather-details">
                <div>Humidity: ${weather.current.humidity}%</div>
                <div>Wind: ${weather.current.windSpeed} km/h</div>
            </div>
        `;
    }

    updateNewsDisplay(news) {
        const newsContainer = document.querySelector('.news-display, #news-feed');
        if (!newsContainer) return;

        const articlesHTML = news.articles.map(article => `
            <div class="news-article">
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
                <small>${new Date(article.timestamp).toLocaleDateString()}</small>
            </div>
        `).join('');

        newsContainer.innerHTML = articlesHTML;
    }

    updateAIStatusDisplay(status) {
        const statusContainer = document.querySelector('.ai-status-display, #ai-status');
        if (!statusContainer) return;

        statusContainer.innerHTML = `
            <div class="status-indicator ${status.status}">
                <div class="status-dot"></div>
                <span>${status.status.toUpperCase()}</span>
            </div>
            <div class="performance-metrics">
                <div>Response Time: ${status.performance.responseTime}ms</div>
                <div>CPU Usage: ${status.performance.cpuUsage}%</div>
                <div>Memory: ${status.performance.memoryUsage}%</div>
            </div>
        `;
    }

    updateSmartHomeDisplay(smartHome) {
        const smartHomeContainer = document.querySelector('.smart-home-display, #smart-home-devices');
        if (!smartHomeContainer) return;

        const devicesHTML = smartHome.devices.map(device => `
            <div class="device-card" data-device-id="${device.id}">
                <div class="device-name">${device.name}</div>
                <div class="device-status ${device.status}">${device.status}</div>
                <div class="device-room">${device.room}</div>
            </div>
        `).join('');

        smartHomeContainer.innerHTML = `
            <div class="devices-grid">${devicesHTML}</div>
            <div class="summary">
                <div>Total Devices: ${smartHome.summary.totalDevices}</div>
                <div>Online: ${smartHome.summary.onlineDevices}</div>
                <div>Energy Usage: ${smartHome.summary.energyUsage}W</div>
            </div>
        `;
    }

    handleChatResponse(response) {
        const chatContainer = document.querySelector('.chat-messages, #chat-messages');
        if (!chatContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message ai-message';
        messageElement.innerHTML = `
            <div class="message-content">${response.response}</div>
            <div class="message-suggestions">
                ${response.suggestions.map(suggestion => 
                    `<button class="suggestion-btn" data-suggestion="${suggestion}">${suggestion}</button>`
                ).join('')}
            </div>
            <div class="message-metadata">
                <small>Confidence: ${Math.round(response.metadata.confidence * 100)}% | ${response.metadata.processingTime}ms</small>
            </div>
        `;

        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Event Handlers
    handlePersonalizationUpdate(data) {
        this.personalizationData = data;
        console.log('Personalization updated:', data);
    }

    handleLocalizationUpdate(data) {
        this.localizationData = data;
        console.log('Localization updated:', data);
    }

    handleEdgeAPICall(element) {
        const apiEndpoint = element.dataset.edgeApi;
        const apiMethod = element.dataset.method || 'GET';
        const apiData = element.dataset.data ? JSON.parse(element.dataset.data) : null;

        this.callEdgeAPI(apiEndpoint, apiData, apiMethod)
            .then(result => {
                console.log(`Edge API ${apiEndpoint} result:`, result);
                // Trigger custom event with result
                window.dispatchEvent(new CustomEvent(`zeeky:api:${apiEndpoint}`, { 
                    detail: result 
                }));
            })
            .catch(error => {
                console.error(`Edge API ${apiEndpoint} failed:`, error);
            });
    }

    handleLoginSuccess(result) {
        console.log('Login successful:', result.user);
        window.dispatchEvent(new CustomEvent('zeeky:auth:login', { 
            detail: result.user 
        }));
    }

    handleLoginError(result) {
        console.error('Login failed:', result.error);
        window.dispatchEvent(new CustomEvent('zeeky:auth:error', { 
            detail: result 
        }));
    }

    handleLogoutSuccess() {
        console.log('Logout successful');
        window.dispatchEvent(new CustomEvent('zeeky:auth:logout'));
    }

    handleAuthVerified(user) {
        console.log('Auth verified:', user);
        window.dispatchEvent(new CustomEvent('zeeky:auth:verified', { 
            detail: user 
        }));
    }

    // Utility Methods
    getTranslation(key) {
        // This would integrate with your translation system
        return key; // Placeholder
    }

    formatCurrency(amount, currency) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    formatDateTime(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    applyDeviceOptimizations() {
        if (this.performanceData.device?.lowEnd) {
            // Disable heavy animations for low-end devices
            document.body.classList.add('low-end-device');
        }
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.fallback && !img.complete) {
                            img.onerror = () => {
                                img.src = img.dataset.fallback;
                            };
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    monitorPerformance() {
        if ('performance' in window && 'PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                    }
                });
            });

            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }
}

// Initialize Edge Functions Client
document.addEventListener('DOMContentLoaded', () => {
    window.edgeFunctionsClient = new EdgeFunctionsClient();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EdgeFunctionsClient;
}
