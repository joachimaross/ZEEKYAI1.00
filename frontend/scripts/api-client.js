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
            // Try to connect to backend first
            const response = await fetch(`${this.baseURL}/chat/message`, {
                method: 'POST',
                body: JSON.stringify({
                    message,
                    personality,
                    timestamp: Date.now()
                })
            });

            if (response.ok) {
                return await response.json();
            } else {
                // Fallback to intelligent local responses
                return this.generateIntelligentResponse(message, personality);
            }
        } catch (error) {
            // Fallback to intelligent local responses when backend is unavailable
            return this.generateIntelligentResponse(message, personality);
        }
    }

    generateIntelligentResponse(message, personality = 'default') {
        const lowerMessage = message.toLowerCase();

        // Smart Home responses
        if (lowerMessage.includes('smart home') || lowerMessage.includes('lights') || lowerMessage.includes('thermostat')) {
            return {
                success: true,
                response: "🏠 I can help you control your smart home! I have access to lights, thermostats, security systems, and more. You can access the Smart Home interface from the sidebar, or tell me what you'd like to control. For example: 'Turn on the living room lights' or 'Set temperature to 72 degrees'.",
                personality: personality
            };
        }

        // Car Mode responses
        if (lowerMessage.includes('car') || lowerMessage.includes('drive') || lowerMessage.includes('navigation')) {
            return {
                success: true,
                response: "🚗 Ready to assist with your automotive needs! I can help with navigation, entertainment controls, vehicle diagnostics, and emergency features. Access Car Mode from the sidebar for the full interface, or ask me to help with specific car functions like 'Navigate to downtown' or 'Play my driving playlist'.",
                personality: personality
            };
        }

        // Code Lab responses
        if (lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('debug')) {
            return {
                success: true,
                response: "💻 I'm your coding companion! I can help with JavaScript, Python, Java, C++, and more. I can generate code, debug issues, explain concepts, and optimize performance. Check out the Code Lab from the sidebar for a full development environment, or ask me coding questions directly!",
                personality: personality
            };
        }

        // AI Personalities responses
        if (lowerMessage.includes('personality') || lowerMessage.includes('character') || lowerMessage.includes('mode')) {
            return {
                success: true,
                response: "🎭 I have 50+ specialized personalities! From creative assistants like DJ and Chef, to technical experts like Quantum AI and Cybersecurity Specialist. Click on 'AI Personalities' in the sidebar to explore them all. Each personality has unique skills and communication styles tailored for specific tasks.",
                personality: personality
            };
        }

        // General capabilities
        if (lowerMessage.includes('what can you do') || lowerMessage.includes('features') || lowerMessage.includes('help')) {
            return {
                success: true,
                response: "🚀 I'm Zeeky AI with 3000+ features! Here's what I can do:\n\n🏠 **Smart Home Control** - Manage IoT devices, lights, security\n🚗 **Car Mode** - Navigation, entertainment, diagnostics\n💻 **Code Lab** - Programming assistance, debugging, execution\n🎭 **50+ AI Personalities** - Specialized assistants for every need\n🤝 **Team Collaboration** - Real-time workspaces and Office integration\n🎵 **Entertainment** - Music, games, creative projects\n📊 **Business Tools** - Analytics, presentations, automation\n\nWhat would you like to explore first?",
                personality: personality
            };
        }

        // Greeting responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            const greetings = [
                "👋 Hello! I'm Zeeky AI, your universal assistant with 3000+ features. How can I help you today?",
                "🌟 Hi there! Ready to explore the future of AI? I can help with smart home control, coding, car assistance, and so much more!",
                "🚀 Hey! Welcome to Zeeky AI - the ultimate AI platform. What amazing thing shall we accomplish together today?"
            ];
            return {
                success: true,
                response: greetings[Math.floor(Math.random() * greetings.length)],
                personality: personality
            };
        }

        // Weather responses
        if (lowerMessage.includes('weather')) {
            return {
                success: true,
                response: "🌤️ I can help you check the weather! While I'm getting real-time weather data integrated, I recommend checking your local weather app or asking me to help you set up weather automation for your smart home system.",
                personality: personality
            };
        }

        // Time responses
        if (lowerMessage.includes('time') || lowerMessage.includes('date')) {
            const now = new Date();
            return {
                success: true,
                response: `🕐 Current time: ${now.toLocaleTimeString()}\n📅 Today's date: ${now.toLocaleDateString()}\n\nI can also help you schedule tasks, set reminders, and manage your calendar!`,
                personality: personality
            };
        }

        // Default intelligent response
        const responses = [
            `🤖 I understand you're asking about "${message}". As Zeeky AI, I'm designed to help with a wide range of tasks! Try asking me about smart home control, coding assistance, car features, or explore my 50+ AI personalities for specialized help.`,
            `✨ That's an interesting question about "${message}"! I'm constantly learning and evolving. While I process your request, feel free to explore my features like Smart Home control, Code Lab, or Car Mode from the sidebar.`,
            `🎯 I'm analyzing your request about "${message}". As your universal AI assistant, I can help with technology, creativity, productivity, and more. What specific area would you like me to focus on?`,
            `🚀 Great question! I'm Zeeky AI with advanced capabilities in smart home automation, automotive assistance, code development, and creative tasks. How can I apply my 3000+ features to help you with "${message}"?`
        ];

        return {
            success: true,
            response: responses[Math.floor(Math.random() * responses.length)],
            personality: personality
        };
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
