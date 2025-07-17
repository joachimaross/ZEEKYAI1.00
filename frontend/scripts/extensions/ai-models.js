// AI Models Extension for Zeeky AI
class AIModelsManager {
    constructor() {
        this.models = {
            'gpt-4': {
                name: 'GPT-4',
                provider: 'OpenAI',
                description: 'Most capable model, best for complex tasks',
                maxTokens: 8192,
                costPer1k: 0.03,
                features: ['text', 'code', 'analysis', 'creative'],
                available: true
            },
            'gpt-3.5': {
                name: 'GPT-3.5 Turbo',
                provider: 'OpenAI',
                description: 'Fast and efficient for most tasks',
                maxTokens: 4096,
                costPer1k: 0.002,
                features: ['text', 'code', 'chat'],
                available: true
            },
            'gemini': {
                name: 'Gemini Pro',
                provider: 'Google',
                description: 'Google\'s advanced multimodal AI',
                maxTokens: 32768,
                costPer1k: 0.001,
                features: ['text', 'images', 'code', 'multimodal'],
                available: true
            },
            'claude': {
                name: 'Claude 3',
                provider: 'Anthropic',
                description: 'Helpful, harmless, and honest AI',
                maxTokens: 100000,
                costPer1k: 0.015,
                features: ['text', 'analysis', 'safety', 'long-context'],
                available: false
            }
        };
        
        this.currentModel = 'gpt-3.5';
        this.settings = {
            temperature: 0.7,
            maxTokens: 2000,
            topP: 1.0,
            frequencyPenalty: 0,
            presencePenalty: 0
        };
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateModelDisplay();
    }

    loadSettings() {
        const saved = localStorage.getItem('zeeky_ai_settings');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentModel = data.currentModel || this.currentModel;
                this.settings = { ...this.settings, ...data.settings };
            } catch (e) {
                console.error('Failed to load AI settings:', e);
            }
        }
    }

    saveSettings() {
        const data = {
            currentModel: this.currentModel,
            settings: this.settings
        };
        localStorage.setItem('zeeky_ai_settings', JSON.stringify(data));
    }

    setupEventListeners() {
        // Model selection
        const modelSelect = document.getElementById('ai-model');
        modelSelect?.addEventListener('change', (e) => {
            this.switchModel(e.target.value);
        });

        // Temperature slider
        const tempSlider = document.getElementById('temperature');
        tempSlider?.addEventListener('input', (e) => {
            this.settings.temperature = parseFloat(e.target.value);
            document.getElementById('temperature-value').textContent = this.settings.temperature;
            this.saveSettings();
        });

        // Max tokens slider
        const tokensSlider = document.getElementById('max-tokens');
        tokensSlider?.addEventListener('input', (e) => {
            this.settings.maxTokens = parseInt(e.target.value);
            document.getElementById('tokens-value').textContent = this.settings.maxTokens;
            this.saveSettings();
        });

        // Apply settings when modal opens
        document.getElementById('settings-modal')?.addEventListener('show', () => {
            this.updateSettingsDisplay();
        });
    }

    updateModelDisplay() {
        const modelSelect = document.getElementById('ai-model');
        if (modelSelect) {
            modelSelect.innerHTML = '';
            
            Object.entries(this.models).forEach(([key, model]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = `${model.name} (${model.provider})`;
                option.disabled = !model.available;
                if (key === this.currentModel) {
                    option.selected = true;
                }
                modelSelect.appendChild(option);
            });
        }
    }

    updateSettingsDisplay() {
        // Update temperature
        const tempSlider = document.getElementById('temperature');
        const tempValue = document.getElementById('temperature-value');
        if (tempSlider && tempValue) {
            tempSlider.value = this.settings.temperature;
            tempValue.textContent = this.settings.temperature;
        }

        // Update max tokens
        const tokensSlider = document.getElementById('max-tokens');
        const tokensValue = document.getElementById('tokens-value');
        if (tokensSlider && tokensValue) {
            tokensSlider.value = this.settings.maxTokens;
            tokensValue.textContent = this.settings.maxTokens;
            
            // Update max based on current model
            const currentModelData = this.models[this.currentModel];
            if (currentModelData) {
                tokensSlider.max = currentModelData.maxTokens;
            }
        }
    }

    switchModel(modelKey) {
        if (!this.models[modelKey] || !this.models[modelKey].available) {
            this.showNotification('Selected model is not available', 'error');
            return;
        }

        const previousModel = this.currentModel;
        this.currentModel = modelKey;
        
        // Adjust settings for new model
        const modelData = this.models[modelKey];
        if (this.settings.maxTokens > modelData.maxTokens) {
            this.settings.maxTokens = Math.min(this.settings.maxTokens, modelData.maxTokens);
        }
        
        this.saveSettings();
        this.updateSettingsDisplay();
        
        this.showNotification(`Switched to ${modelData.name}`, 'success');
        
        // Track model switch
        if (window.analyticsManager) {
            window.analyticsManager.trackUserAction('model_switch', modelKey, previousModel);
        }
    }

    async generateResponse(message, options = {}) {
        const model = this.models[this.currentModel];
        if (!model || !model.available) {
            throw new Error('Selected AI model is not available');
        }

        const requestOptions = {
            model: this.currentModel,
            message: message,
            temperature: options.temperature || this.settings.temperature,
            maxTokens: options.maxTokens || this.settings.maxTokens,
            ...options
        };

        // Track request start time
        const startTime = Date.now();

        try {
            let response;
            
            switch (model.provider) {
                case 'OpenAI':
                    response = await this.callOpenAI(requestOptions);
                    break;
                case 'Google':
                    response = await this.callGemini(requestOptions);
                    break;
                case 'Anthropic':
                    response = await this.callClaude(requestOptions);
                    break;
                default:
                    response = await this.simulateResponse(requestOptions);
            }

            // Track response time
            if (window.analyticsManager) {
                window.analyticsManager.trackResponseTime(startTime);
            }

            return response;

        } catch (error) {
            // Track error
            if (window.analyticsManager) {
                window.analyticsManager.trackError('ai_model_error', error.message);
            }
            throw error;
        }
    }

    async callOpenAI(options) {
        // In a real implementation, this would call the OpenAI API
        // For demo purposes, we'll simulate the response
        return this.simulateResponse(options);
    }

    async callGemini(options) {
        // In a real implementation, this would call the Gemini API
        // For demo purposes, we'll simulate the response
        return this.simulateResponse(options);
    }

    async callClaude(options) {
        // In a real implementation, this would call the Claude API
        // For demo purposes, we'll simulate the response
        return this.simulateResponse(options);
    }

    async simulateResponse(options) {
        // Simulate API delay based on model
        const model = this.models[this.currentModel];
        const baseDelay = model.provider === 'OpenAI' ? 1000 : 
                         model.provider === 'Google' ? 800 : 1200;
        
        const delay = baseDelay + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Generate response based on model characteristics
        const responses = this.getModelSpecificResponses(options.message);
        const response = responses[Math.floor(Math.random() * responses.length)];

        return {
            text: response,
            model: this.currentModel,
            tokens: Math.floor(response.length / 4), // Rough token estimate
            cost: this.calculateCost(response.length),
            timestamp: new Date().toISOString()
        };
    }

    getModelSpecificResponses(message) {
        const model = this.models[this.currentModel];
        const lowerMessage = message.toLowerCase();

        // Customize responses based on model characteristics
        if (model.provider === 'OpenAI') {
            if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
                return [
                    "I'd be happy to help with coding! As GPT-4, I can assist with multiple programming languages, debug code, explain algorithms, and provide best practices. What specific programming challenge are you working on?",
                    "Great! I excel at programming tasks. Whether you need help with Python, JavaScript, Java, C++, or other languages, I can help you write, debug, and optimize code. What would you like to work on?"
                ];
            }
            return [
                "I'm GPT-4, OpenAI's most advanced language model. I can help with complex reasoning, creative writing, analysis, and detailed explanations. How can I assist you today?",
                "As GPT-4, I'm designed to provide thoughtful, accurate responses across a wide range of topics. I excel at nuanced understanding and can help with both creative and analytical tasks."
            ];
        } else if (model.provider === 'Google') {
            return [
                "Hello! I'm Gemini Pro, Google's multimodal AI. I can process text, images, and code, and I'm particularly good at understanding context and providing comprehensive answers. What would you like to explore?",
                "I'm Gemini Pro, designed to be helpful, accurate, and comprehensive. I can handle complex queries and provide detailed explanations across many domains. How can I help you today?"
            ];
        } else if (model.provider === 'Anthropic') {
            return [
                "Hi! I'm Claude, created by Anthropic to be helpful, harmless, and honest. I'm designed with strong safety measures and can handle very long conversations while maintaining context. What can I help you with?",
                "I'm Claude 3, built by Anthropic with a focus on being beneficial and truthful. I can process very long documents and maintain context throughout our conversation. How may I assist you?"
            ];
        }

        // Default responses
        return [
            "I'm here to help! As an AI assistant, I can provide information, answer questions, help with analysis, creative tasks, and much more. What would you like to work on?",
            "Hello! I'm ready to assist you with a wide variety of tasks. Whether you need help with writing, analysis, problem-solving, or creative projects, I'm here to help. What can I do for you?"
        ];
    }

    calculateCost(responseLength) {
        const model = this.models[this.currentModel];
        const tokens = Math.floor(responseLength / 4); // Rough estimate
        return (tokens / 1000) * model.costPer1k;
    }

    getModelInfo(modelKey = null) {
        const key = modelKey || this.currentModel;
        return this.models[key];
    }

    getCurrentModel() {
        return {
            key: this.currentModel,
            ...this.models[this.currentModel]
        };
    }

    getAvailableModels() {
        return Object.entries(this.models)
            .filter(([key, model]) => model.available)
            .map(([key, model]) => ({ key, ...model }));
    }

    updateModelAvailability(modelKey, available) {
        if (this.models[modelKey]) {
            this.models[modelKey].available = available;
            this.updateModelDisplay();
            
            if (!available && this.currentModel === modelKey) {
                // Switch to first available model
                const availableModels = this.getAvailableModels();
                if (availableModels.length > 0) {
                    this.switchModel(availableModels[0].key);
                }
            }
        }
    }

    getUsageStats() {
        // This would typically come from your backend
        return {
            totalRequests: 1247,
            totalTokens: 156789,
            totalCost: 12.34,
            modelUsage: {
                'gpt-4': { requests: 234, tokens: 45678, cost: 8.90 },
                'gpt-3.5': { requests: 890, tokens: 89012, cost: 2.67 },
                'gemini': { requests: 123, tokens: 22099, cost: 0.77 }
            }
        };
    }

    showNotification(message, type) {
        if (window.ZeekyUtils) {
            window.ZeekyUtils.showNotification(message, type);
        }
    }

    // Public API
    getCurrentSettings() {
        return {
            model: this.currentModel,
            ...this.settings
        };
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.updateSettingsDisplay();
    }
}

// Initialize AI models manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiModelsManager = new AIModelsManager();
});
