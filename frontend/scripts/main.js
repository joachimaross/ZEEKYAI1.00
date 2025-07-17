// Zeeky AI Frontend JavaScript
class ZeekyAI {
    constructor() {
        this.apiBaseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : 'https://your-backend-api.herokuapp.com';

        // DOM elements
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.chatInterface = document.getElementById('chat-interface');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.getElementById('main-content');

        // State
        this.currentChatId = null;
        this.chatHistory = [];
        this.isTyping = false;
        this.theme = localStorage.getItem('theme') || 'auto';

        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.loadChatHistory();
        this.setupSuggestionChips();
        this.autoResizeTextarea();
        this.setupForms();
    }

    setupTheme() {
        const applyTheme = (theme) => {
            if (theme === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            } else {
                document.documentElement.setAttribute('data-theme', theme);
            }
        };

        applyTheme(this.theme);

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.theme === 'auto') {
                applyTheme(this.theme);
            }
        });
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle?.addEventListener('click', () => this.toggleTheme());

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        sidebarToggle?.addEventListener('click', () => this.toggleSidebar());

        // New chat button
        const newChatBtn = document.getElementById('new-chat-btn');
        newChatBtn?.addEventListener('click', () => this.startNewChat());

        // Send button
        this.sendButton?.addEventListener('click', () => this.sendMessage());

        // Chat input
        this.chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.chatInput?.addEventListener('input', () => {
            this.updateSendButton();
            this.autoResizeTextarea();
        });

        // Feedback modal
        const feedbackBtn = document.getElementById('feedback-btn');
        const feedbackClose = document.getElementById('feedback-close');

        feedbackBtn?.addEventListener('click', () => this.openModal('feedback-modal'));
        feedbackClose?.addEventListener('click', () => this.closeModal('feedback-modal'));

        // Contact modal
        const contactBtn = document.getElementById('contact-btn');
        const contactClose = document.getElementById('contact-close');

        contactBtn?.addEventListener('click', () => this.openModal('contact-modal'));
        contactClose?.addEventListener('click', () => this.closeModal('contact-modal'));

        // Settings modal
        const settingsBtn = document.getElementById('settings-btn');
        const settingsClose = document.getElementById('settings-close');

        settingsBtn?.addEventListener('click', () => this.openModal('settings-modal'));
        settingsClose?.addEventListener('click', () => this.closeModal('settings-modal'));

        // Admin modal
        const adminBtn = document.getElementById('admin-btn');
        const adminClose = document.getElementById('admin-close');

        adminBtn?.addEventListener('click', () => this.openModal('admin-modal'));
        adminClose?.addEventListener('click', () => this.closeModal('admin-modal'));

        // Admin tabs
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchAdminTab(tab.dataset.tab));
        });

        // Chat actions
        const exportBtn = document.getElementById('export-chat');
        const clearBtn = document.getElementById('clear-chat');

        exportBtn?.addEventListener('click', () => this.exportChat());
        clearBtn?.addEventListener('click', () => this.clearChat());

        // Modal backdrop clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.chatInput?.focus();
            }
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    this.closeModal(modal.id);
                });
            }
        });
    }

    toggleTheme() {
        const themes = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(this.theme);
        this.theme = themes[(currentIndex + 1) % themes.length];
        localStorage.setItem('theme', this.theme);
        this.setupTheme();

        // Update theme toggle icon
        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle?.querySelector('i');
        if (icon) {
            icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    toggleSidebar() {
        this.sidebar?.classList.toggle('open');
    }

    setupSuggestionChips() {
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const suggestion = chip.dataset.suggestion;
                if (suggestion) {
                    this.startChatWithMessage(suggestion);
                }
            });
        });
    }

    startChatWithMessage(message) {
        this.showChatInterface();
        this.chatInput.value = message;
        this.sendMessage();
    }

    startNewChat() {
        this.currentChatId = this.generateChatId();
        this.clearChatMessages();
        this.showChatInterface();
        this.addBotMessage("Hello! I'm Zeeky, your AI assistant. How can I help you today?");
        this.chatInput?.focus();
    }

    showChatInterface() {
        if (this.welcomeScreen) {
            this.welcomeScreen.style.display = 'none';
        }
        if (this.chatInterface) {
            this.chatInterface.style.display = 'flex';
        }
    }

    showWelcomeScreen() {
        if (this.welcomeScreen) {
            this.welcomeScreen.style.display = 'flex';
        }
        if (this.chatInterface) {
            this.chatInterface.style.display = 'none';
        }
    }

    autoResizeTextarea() {
        if (this.chatInput) {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
        }
    }

    updateSendButton() {
        const hasText = this.chatInput?.value.trim().length > 0;
        if (this.sendButton) {
            this.sendButton.disabled = !hasText || this.isTyping;
        }
    }

    generateChatId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    loadChatHistory() {
        const saved = localStorage.getItem('zeeky_chat_history');
        if (saved) {
            try {
                this.chatHistory = JSON.parse(saved);
                this.renderChatHistory();
            } catch (e) {
                console.error('Failed to load chat history:', e);
                this.chatHistory = [];
            }
        }
    }

    saveChatHistory() {
        localStorage.setItem('zeeky_chat_history', JSON.stringify(this.chatHistory));
    }

    renderChatHistory() {
        const historyList = document.getElementById('chat-history-list');
        if (!historyList) return;

        historyList.innerHTML = '';

        this.chatHistory.slice(-10).reverse().forEach(chat => {
            const item = document.createElement('div');
            item.className = 'chat-history-item';
            item.textContent = chat.title || 'New Chat';
            item.addEventListener('click', () => this.loadChat(chat.id));
            historyList.appendChild(item);
        });
    }

    addToChatHistory(chatId, title) {
        const existingIndex = this.chatHistory.findIndex(chat => chat.id === chatId);
        const chatData = {
            id: chatId,
            title: title,
            timestamp: Date.now()
        };

        if (existingIndex >= 0) {
            this.chatHistory[existingIndex] = chatData;
        } else {
            this.chatHistory.push(chatData);
        }

        this.saveChatHistory();
        this.renderChatHistory();
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isTyping) return;

        // Start new chat if needed
        if (!this.currentChatId) {
            this.currentChatId = this.generateChatId();
            this.showChatInterface();
        }

        // Add user message
        this.addUserMessage(message);
        this.chatInput.value = '';
        this.autoResizeTextarea();
        this.updateSendButton();

        // Show typing indicator
        this.isTyping = true;
        const typingId = this.showTypingIndicator();

        try {
            // For demo purposes, use simulated responses
            const response = await this.simulateApiResponse(message);

            // Uncomment for actual API integration
            /*
            const response = await fetch(`${this.apiBaseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    chatId: this.currentChatId,
                    personality: 'default'
                })
            });
            const data = await response.json();
            */

            this.removeTypingIndicator(typingId);
            this.addBotMessage(response.reply || response);

            // Add to chat history
            if (this.currentChatId) {
                const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
                this.addToChatHistory(this.currentChatId, title);
            }

        } catch (error) {
            console.error('Chat Error:', error);
            this.removeTypingIndicator(typingId);
            this.addBotMessage("I'm sorry, I'm having trouble connecting right now. Please try again later.");
        } finally {
            this.isTyping = false;
            this.updateSendButton();
        }
    }

    clearChat() {
        if (confirm('Are you sure you want to clear this chat?')) {
            this.clearChatMessages();
            this.addBotMessage("Chat cleared. How can I help you?");
        }
    }

    clearChatMessages() {
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
        }
    }

    exportChat() {
        const messages = Array.from(this.chatMessages.children).map(msg => {
            const isUser = msg.classList.contains('user-message');
            const content = msg.querySelector('.message-content')?.textContent || '';
            return `${isUser ? 'You' : 'Zeeky'}: ${content}`;
        }).join('\n\n');

        const blob = new Blob([messages], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zeeky-chat-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    switchAdminTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update panels
        document.querySelectorAll('.admin-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });
    }

    setupForms() {
        // Handle all Netlify forms
        document.querySelectorAll('form[netlify]').forEach(form => {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        });

        // Setup rating stars
        this.setupRatingStars();

        // Setup form validation
        this.setupFormValidation();
    }

    setupRatingStars() {
        const ratingContainer = document.getElementById('feedback-rating');
        if (!ratingContainer) return;

        const stars = ratingContainer.querySelectorAll('.star');
        const inputs = ratingContainer.querySelectorAll('input[type="radio"]');

        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                inputs[index].checked = true;
                this.updateStarDisplay(stars, index);
            });

            star.addEventListener('mouseenter', () => {
                this.updateStarDisplay(stars, index, true);
            });
        });

        ratingContainer.addEventListener('mouseleave', () => {
            const checkedIndex = Array.from(inputs).findIndex(input => input.checked);
            if (checkedIndex >= 0) {
                this.updateStarDisplay(stars, checkedIndex);
            } else {
                this.updateStarDisplay(stars, -1);
            }
        });
    }

    updateStarDisplay(stars, activeIndex, isHover = false) {
        stars.forEach((star, index) => {
            if (index <= activeIndex) {
                star.style.color = '#ffc107';
            } else {
                star.style.color = 'var(--border-color)';
            }
        });
    }

    setupFormValidation() {
        // Real-time validation for email fields
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.addEventListener('blur', () => this.validateEmail(input));
            input.addEventListener('input', () => this.clearValidationError(input));
        });

        // Real-time validation for required fields
        document.querySelectorAll('input[required], textarea[required], select[required]').forEach(input => {
            input.addEventListener('blur', () => this.validateRequired(input));
            input.addEventListener('input', () => this.clearValidationError(input));
        });
    }

    validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (input.value && !emailRegex.test(input.value)) {
            this.showFieldError(input, 'Please enter a valid email address');
            return false;
        }
        this.clearValidationError(input);
        return true;
    }

    validateRequired(input) {
        if (!input.value.trim()) {
            this.showFieldError(input, 'This field is required');
            return false;
        }
        this.clearValidationError(input);
        return true;
    }

    showFieldError(input, message) {
        this.clearValidationError(input);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: var(--danger-color);
            font-size: 12px;
            margin-top: 4px;
        `;

        input.parentNode.appendChild(errorDiv);
        input.style.borderColor = 'var(--danger-color)';
    }

    clearValidationError(input) {
        const errorDiv = input.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.style.borderColor = '';
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const formName = form.getAttribute('name');

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div> Sending...';
        submitBtn.disabled = true;

        try {
            // Validate form before submission
            if (!this.validateForm(form)) {
                throw new Error('Please fix the validation errors');
            }

            // Submit to Netlify
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });

            if (response.ok) {
                this.showFormSuccess(form, formName);
                form.reset();

                // Close modal after success
                setTimeout(() => {
                    const modal = form.closest('.modal');
                    if (modal) {
                        this.closeModal(modal.id);
                    }
                }, 2000);
            } else {
                throw new Error('Network response was not ok');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            this.showFormError(form, 'There was an error sending your message. Please try again.');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateForm(form) {
        let isValid = true;

        // Validate all required fields
        form.querySelectorAll('[required]').forEach(input => {
            if (!this.validateRequired(input)) {
                isValid = false;
            }
        });

        // Validate email fields
        form.querySelectorAll('input[type="email"]').forEach(input => {
            if (!this.validateEmail(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    showFormSuccess(form, formName) {
        const messages = {
            feedback: 'Thank you for your feedback! We appreciate your input.',
            contact: 'Message sent successfully! We\'ll get back to you soon.',
            newsletter: 'Successfully subscribed! Welcome to our newsletter.'
        };

        const message = messages[formName] || 'Form submitted successfully!';

        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

        form.insertBefore(successDiv, form.firstChild);

        // Remove success message after 5 seconds
        setTimeout(() => successDiv.remove(), 5000);

        // Show notification
        ZeekyUtils.showNotification(message, 'success');
    }

    showFormError(form, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;

        form.insertBefore(errorDiv, form.firstChild);

        // Remove error message after 5 seconds
        setTimeout(() => errorDiv.remove(), 5000);

        // Show notification
        ZeekyUtils.showNotification(message, 'error');
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
            <div class="message-avatar">U</div>
            <div class="message-content">
                ${this.formatMessage(message)}
                <div class="message-time">${this.formatTime(new Date())}</div>
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">Z</div>
            <div class="message-content">
                ${this.formatMessage(message)}
                <div class="message-time">${this.formatTime(new Date())}</div>
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = typingId;
        typingDiv.innerHTML = `
            <div class="message-avatar">Z</div>
            <div class="message-content">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
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

    formatMessage(text) {
        // Basic markdown-like formatting
        let formatted = this.escapeHtml(text);

        // Bold text
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic text
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Code blocks
        formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        // Inline code
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    async simulateApiResponse(message) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const lowerMessage = message.toLowerCase();

        // Enhanced responses based on keywords
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! I'm Zeeky, your advanced AI assistant. I'm here to help with anything you need - from answering questions to creative tasks, coding help, and much more!";
        } else if (lowerMessage.includes('what can you') || lowerMessage.includes('help me with')) {
            return `I can help you with a wide variety of tasks:

**💬 Conversation & Questions** - Ask me anything and I'll provide detailed, helpful answers

**✍️ Writing & Creativity** - Stories, essays, poems, scripts, and creative content

**💻 Programming & Tech** - Code help, debugging, explanations, and technical guidance

**📊 Analysis & Research** - Data analysis, research assistance, and problem-solving

**🎯 Planning & Organization** - Project planning, scheduling, and task management

**🌍 Learning & Education** - Explanations, tutoring, and educational content

What would you like to explore today?`;
        } else if (lowerMessage.includes('creative') || lowerMessage.includes('story') || lowerMessage.includes('write')) {
            return "I'd love to help with creative writing! I can create stories, poems, scripts, or any other creative content. What type of creative project are you working on? Give me a theme, genre, or specific idea and I'll craft something unique for you.";
        } else if (lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('debug')) {
            return "I'm great with programming! I can help with:\n\n• **Code writing** in Python, JavaScript, Java, C++, and many other languages\n• **Debugging** and troubleshooting\n• **Code review** and optimization\n• **Algorithm** design and explanation\n• **Framework** guidance (React, Django, etc.)\n\nWhat programming challenge can I help you with?";
        } else if (lowerMessage.includes('plan') || lowerMessage.includes('schedule') || lowerMessage.includes('organize')) {
            return "I'm excellent at planning and organization! I can help you:\n\n• Create detailed project plans\n• Break down complex tasks\n• Set realistic timelines\n• Organize information and resources\n• Develop workflows and processes\n\nWhat would you like to plan or organize?";
        } else if (lowerMessage.includes('explain') || lowerMessage.includes('how does') || lowerMessage.includes('what is')) {
            return "I love explaining things! I can break down complex topics into easy-to-understand explanations. Whether it's science, technology, history, or any other subject, I'll provide clear, detailed explanations tailored to your level of understanding. What would you like me to explain?";
        } else {
            const responses = [
                "That's a great question! Let me think about this carefully and provide you with a comprehensive answer.",
                "Interesting! I'm processing your request using my advanced reasoning capabilities to give you the best possible response.",
                "I understand what you're asking. Let me analyze this thoroughly and provide you with detailed insights.",
                "Excellent question! I'm drawing from my extensive knowledge base to craft a helpful response for you.",
                "I'm here to help! Let me work through this systematically to give you exactly what you need."
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }
}

// Utility functions
class ZeekyUtils {
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? 'var(--danger-color)' : 'var(--success-color)'};
            color: white;
            border-radius: 8px;
            z-index: 1001;
            box-shadow: var(--shadow-lg);
            animation: slideIn 0.3s ease;
            font-size: 14px;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.zeekyAI = new ZeekyAI();

    // Add notification styles
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
    `;
    document.head.appendChild(style);

    // Show welcome notification
    setTimeout(() => {
        ZeekyUtils.showNotification('Welcome to Zeeky AI! Your advanced assistant is ready.', 'info');
    }, 1000);
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ZeekyAI, ZeekyUtils };
}
