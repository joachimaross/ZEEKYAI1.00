// Zeeky AI API Client - Frontend to Backend Integration
class ZeekyAPIClient {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.token = localStorage.getItem('zeeky_auth_token');
        this.refreshToken = localStorage.getItem('zeeky_refresh_token');
        this.requestQueue = [];
        this.isRefreshing = false;
        
        this.setupInterceptors();
    }

    getBaseURL() {
        // Determine API base URL based on environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:5000/api';
        } else {
            return '/api'; // Production API endpoint
        }
    }

    setupInterceptors() {
        // Setup request/response interceptors for authentication
        this.originalFetch = window.fetch;
        window.fetch = this.interceptedFetch.bind(this);
    }

    async interceptedFetch(url, options = {}) {
        // Add authentication headers
        if (this.token && !options.headers?.Authorization) {
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            };
        }

        try {
            const response = await this.originalFetch(url, options);
            
            // Handle token refresh
            if (response.status === 401 && this.token) {
                return await this.handleTokenRefresh(url, options);
            }
            
            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async handleTokenRefresh(url, options) {
        if (this.isRefreshing) {
            // Queue the request if token refresh is in progress
            return new Promise((resolve, reject) => {
                this.requestQueue.push({ resolve, reject, url, options });
            });
        }

        this.isRefreshing = true;

        try {
            const refreshResponse = await this.originalFetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh_token: this.refreshToken })
            });

            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                this.token = data.access_token;
                localStorage.setItem('zeeky_auth_token', this.token);

                // Retry original request
                options.headers.Authorization = `Bearer ${this.token}`;
                const retryResponse = await this.originalFetch(url, options);

                // Process queued requests
                this.processRequestQueue();

                return retryResponse;
            } else {
                // Refresh failed, logout user
                this.logout();
                throw new Error('Authentication failed');
            }
        } catch (error) {
            this.logout();
            throw error;
        } finally {
            this.isRefreshing = false;
        }
    }

    processRequestQueue() {
        this.requestQueue.forEach(({ resolve, reject, url, options }) => {
            options.headers.Authorization = `Bearer ${this.token}`;
            this.originalFetch(url, options)
                .then(resolve)
                .catch(reject);
        });
        this.requestQueue = [];
    }

    // Authentication methods
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                this.token = data.token;
                this.refreshToken = data.refresh_token;
                localStorage.setItem('zeeky_auth_token', this.token);
                localStorage.setItem('zeeky_refresh_token', this.refreshToken);
                localStorage.setItem('zeeky_user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    logout() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('zeeky_auth_token');
        localStorage.removeItem('zeeky_refresh_token');
        localStorage.removeItem('zeeky_user');
        window.location.href = '/login';
    }

    // Chat API methods
    async sendMessage(message, personality = 'default') {
        try {
            const response = await fetch(`${this.baseURL}/chat/message`, {
                method: 'POST',
                body: JSON.stringify({
                    message,
                    personality,
                    timestamp: Date.now()
                })
            });

            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getChatHistory(limit = 50) {
        try {
            const response = await fetch(`${this.baseURL}/chat/history?limit=${limit}`);
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // File API methods
    async uploadFile(file, metadata = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('metadata', JSON.stringify(metadata));

            const response = await fetch(`${this.baseURL}/files/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async analyzeFile(fileId) {
        try {
            const response = await fetch(`${this.baseURL}/files/${fileId}/analyze`, {
                method: 'POST'
            });

            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Image generation API methods
    async generateImage(prompt, style = 'realistic', size = '1024x1024') {
        try {
            const response = await fetch(`${this.baseURL}/images/generate`, {
                method: 'POST',
                body: JSON.stringify({
                    prompt,
                    style,
                    size
                })
            });

            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async analyzeImage(imageData) {
        try {
            const response = await fetch(`${this.baseURL}/images/analyze`, {
                method: 'POST',
                body: JSON.stringify({
                    image_data: imageData
                })
            });

            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Code execution API methods
    async executeCode(code, language) {
        try {
            const response = await fetch(`${this.baseURL}/code/execute`, {
                method: 'POST',
                body: JSON.stringify({
                    code,
                    language
                })
            });

            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Analytics API methods
    async trackEvent(event, data = {}) {
        try {
            const response = await fetch(`${this.baseURL}/analytics/track`, {
                method: 'POST',
                body: JSON.stringify({
                    event,
                    data,
                    timestamp: Date.now()
                })
            });

            return await response.json();
        } catch (error) {
            // Fail silently for analytics
            console.warn('Analytics tracking failed:', error);
            return { success: false };
        }
    }

    async getAnalytics(timeRange = '7d') {
        try {
            const response = await fetch(`${this.baseURL}/analytics/dashboard?range=${timeRange}`);
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Collaboration API methods
    async createRoom(roomData) {
        try {
            const response = await fetch(`${this.baseURL}/collaboration/rooms`, {
                method: 'POST',
                body: JSON.stringify(roomData)
            });

            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async joinRoom(roomId) {
        try {
            const response = await fetch(`${this.baseURL}/collaboration/rooms/${roomId}/join`, {
                method: 'POST'
            });

            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Workflow API methods
    async createWorkflow(workflowData) {
        try {
            const response = await fetch(`${this.baseURL}/workflows`, {
                method: 'POST',
                body: JSON.stringify(workflowData)
            });

            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async executeWorkflow(workflowId, triggerData = {}) {
        try {
            const response = await fetch(`${this.baseURL}/workflows/${workflowId}/execute`, {
                method: 'POST',
                body: JSON.stringify(triggerData)
            });

            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        const userData = localStorage.getItem('zeeky_user');
        return userData ? JSON.parse(userData) : null;
    }

    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Global API client instance
window.zeekyAPI = new ZeekyAPIClient();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZeekyAPIClient;
}
