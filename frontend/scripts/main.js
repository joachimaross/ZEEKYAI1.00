// Zeeky AI Frontend JavaScript
class ZeekyAI {
    constructor() {
        this.apiBaseUrl = 'https://your-backend-api.herokuapp.com'; // Replace with your actual backend URL
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.apiStatus = document.getElementById('api-status');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkApiStatus();
        this.loadWelcomeMessage();
    }

    setupEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key press
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Auto-resize chat input
        this.chatInput.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = this.chatInput.scrollHeight + 'px';
        });
    }

    async checkApiStatus() {
        try {
            // For demo purposes, we'll simulate API status
            // In production, replace with actual API call
            this.updateApiStatus('Online', 'success');
            
            // Uncomment below for actual API check
            /*
            const response = await fetch(`${this.apiBaseUrl}/health`);
            if (response.ok) {
                this.updateApiStatus('Online', 'success');
            } else {
                this.updateApiStatus('Offline', 'error');
            }
            */
        } catch (error) {
            console.error('API Status Check Failed:', error);
            this.updateApiStatus('Demo Mode', 'warning');
        }
    }

    updateApiStatus(status, type) {
        this.apiStatus.textContent = status;
        this.apiStatus.className = `status-value ${type}`;
        
        // Add CSS classes for different status types
        const statusColors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B'
        };
        
        this.apiStatus.style.color = statusColors[type] || '#10B981';
    }

    loadWelcomeMessage() {
        // Welcome message is already in HTML, but we can add dynamic content
        const welcomeFeatures = [
            "🤖 Natural conversation with multiple AI personalities",
            "🏠 Smart home device control and automation",
            "💼 Business tools including CRM and analytics",
            "🎮 Entertainment features like games and stories",
            "🔒 Advanced security and privacy protection",
            "🌐 Universal translation and language support"
        ];

        // Add feature highlights after a delay
        setTimeout(() => {
            this.addBotMessage("Here are some of my key capabilities:\n\n" + welcomeFeatures.join('\n'));
        }, 2000);
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addUserMessage(message);
        this.chatInput.value = '';

        // Show typing indicator
        const typingId = this.showTypingIndicator();

        try {
            // For demo purposes, we'll use simulated responses
            // In production, replace with actual API call
            const response = await this.simulateApiResponse(message);
            
            // Uncomment below for actual API integration
            /*
            const response = await fetch(`${this.apiBaseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    personality: 'default'
                })
            });

            const data = await response.json();
            */

            this.removeTypingIndicator(typingId);
            this.addBotMessage(response.reply || response);

        } catch (error) {
            console.error('Chat Error:', error);
            this.removeTypingIndicator(typingId);
            this.addBotMessage("I'm sorry, I'm having trouble connecting right now. Please try again later.");
        }
    }

    async simulateApiResponse(message) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const lowerMessage = message.toLowerCase();
        
        // Simulated responses based on keywords
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Hello! I'm Zeeky, your universal AI assistant. I'm here to help with anything you need!";
        } else if (lowerMessage.includes('smart home') || lowerMessage.includes('lights')) {
            return "I can help you control your smart home devices! I can turn lights on/off, adjust temperature, manage security systems, and create custom scenes. What would you like to control?";
        } else if (lowerMessage.includes('business') || lowerMessage.includes('crm')) {
            return "I offer comprehensive business tools including CRM management, task automation, meeting scheduling, email templates, and analytics. How can I help with your business needs?";
        } else if (lowerMessage.includes('game') || lowerMessage.includes('entertainment')) {
            return "I have various entertainment features! I can play text-based games, generate creative stories, recommend music, and even create interactive experiences. What sounds fun to you?";
        } else if (lowerMessage.includes('help') || lowerMessage.includes('features')) {
            return "I have over 7,500 features across 30 different categories! I can help with AI chat, smart home control, business management, entertainment, security, blockchain, quantum computing, and much more. What specific area interests you?";
        } else {
            const responses = [
                "That's an interesting question! I'm processing your request with my advanced AI capabilities.",
                "I understand what you're asking. Let me help you with that using my extensive knowledge base.",
                "Great question! I'm analyzing this with my quantum-enhanced reasoning systems.",
                "I'm here to help! My neural networks are working on the best response for you.",
                "Excellent! I'm using my advanced NLP capabilities to provide you with the most helpful answer."
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                ${this.escapeHtml(message)}
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                ${this.escapeHtml(message).replace(/\n/g, '<br>')}
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = typingId;
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="loading"></div>
                Zeeky is thinking...
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
        return typingId;
    }

    removeTypingIndicator(typingId) {
        const typingElement = document.getElementById(typingId);
        if (typingElement) {
            typingElement.remove();
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Additional utility functions
class ZeekyUtils {
    static formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    static showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#EF4444' : '#10B981'};
            color: white;
            border-radius: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.zeekyAI = new ZeekyAI();
    
    // Add some interactive features
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus chat input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('chat-input').focus();
        }
    });
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .status-value.success { color: #10B981 !important; }
        .status-value.error { color: #EF4444 !important; }
        .status-value.warning { color: #F59E0B !important; }
    `;
    document.head.appendChild(style);
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ZeekyAI, ZeekyUtils };
}
