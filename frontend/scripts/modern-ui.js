// Modern UI Controller for Zeeky AI
class ModernUI {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.sidebarOpen = window.innerWidth > 768;
        this.currentPersonality = 'default';
        this.messageHistory = [];
        this.isTyping = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.setupResponsive();
        this.setupChatInput();
        this.setupKeyboardShortcuts();
        
        console.log('🎨 Modern UI initialized');
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle?.addEventListener('click', () => this.toggleTheme());

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        mobileToggle?.addEventListener('click', () => this.toggleSidebar());

        // New chat button
        const newChatBtn = document.getElementById('new-chat-btn');
        newChatBtn?.addEventListener('click', () => this.startNewChat());

        // Send button
        const sendBtn = document.getElementById('send-btn');
        sendBtn?.addEventListener('click', () => this.sendMessage());

        // Navigation items
        this.setupNavigation();

        // Chat input
        const chatInput = document.getElementById('chat-input');
        chatInput?.addEventListener('input', () => this.handleInputChange());
        chatInput?.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));
                // Add active class to clicked item
                item.classList.add('active');
                
                // Handle navigation
                this.handleNavigation(item.id);
            });
        });
    }

    handleNavigation(navId) {
        switch (navId) {
            case 'collaboration-nav':
                this.openCollaboration();
                break;
            case 'personalities-nav':
                this.openPersonalities();
                break;
            case 'code-lab-nav':
                this.openCodeLab();
                break;
            case 'vision-nav':
                this.openVision();
                break;
            case 'workflows-nav':
                this.openWorkflows();
                break;
            case 'voice-nav':
                this.openVoice();
                break;
            case 'files-nav':
                this.openFiles();
                break;
            case 'analytics-nav':
                this.openAnalytics();
                break;
            case 'theme-nav':
                this.openThemes();
                break;
            case 'settings-nav':
                this.openSettings();
                break;
        }
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    setupResponsive() {
        this.handleResize();
    }

    handleResize() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 768) {
            if (this.sidebarOpen) {
                sidebar?.classList.add('open');
            } else {
                sidebar?.classList.remove('open');
            }
        } else {
            sidebar?.classList.remove('open');
            this.sidebarOpen = true;
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        this.sidebarOpen = !this.sidebarOpen;
        
        if (window.innerWidth <= 768) {
            sidebar?.classList.toggle('open', this.sidebarOpen);
        }
    }

    setupChatInput() {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            // Auto-resize textarea
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto';
                chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for command palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openCommandPalette();
            }
            
            // Ctrl/Cmd + N for new chat
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.startNewChat();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    handleInputChange() {
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        
        if (chatInput && sendBtn) {
            const hasText = chatInput.value.trim().length > 0;
            sendBtn.disabled = !hasText;
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput?.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage(message, 'user');
        chatInput.value = '';
        this.handleInputChange();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Simulate API call
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }

    addMessage(content, type) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = type === 'user' ? 
            '<i class="fas fa-user"></i>' : 
            '<i class="fas fa-robot"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageBubble = document.createElement('div');
        messageBubble.className = 'message-bubble';
        messageBubble.textContent = content;
        
        messageContent.appendChild(messageBubble);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Store in history
        this.messageHistory.push({ content, type, timestamp: Date.now() });
    }

    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing-message';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        typingIndicator?.remove();
    }

    async getAIResponse(message) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Smart response logic based on message content
        const lowerMessage = message.toLowerCase();

        // Feature-specific responses
        if (lowerMessage.includes('collaboration') || lowerMessage.includes('team')) {
            return "🤝 I can help you set up real-time collaboration! With Zeeky AI, you can create rooms where multiple users can chat with AI together, see live typing indicators, and share AI interactions in real-time. Would you like me to show you how to create a collaboration room?";
        }

        if (lowerMessage.includes('personality') || lowerMessage.includes('character')) {
            return "🎭 I have 15+ unique personalities! I can be a Professional Assistant, Creative Writer, Technical Expert, Life Coach, Comedian, and many more. Each personality has unique traits and responds differently. Which personality would you like to try?";
        }

        if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
            return "🧪 I can execute code in real-time! I support JavaScript, Python, HTML, CSS, SQL, and JSON. You can write code, and I'll run it instantly and show you the results. Want to try writing some code together?";
        }

        if (lowerMessage.includes('image') || lowerMessage.includes('picture') || lowerMessage.includes('visual')) {
            return "👁️ I have advanced vision capabilities! I can generate images in multiple styles (realistic, artistic, cyberpunk, etc.), analyze uploaded images to detect objects and text, and even edit images with built-in tools. What kind of image would you like to create or analyze?";
        }

        if (lowerMessage.includes('workflow') || lowerMessage.includes('automation')) {
            return "🔄 I can help you automate tasks with visual workflows! You can create automated processes with triggers (schedule, webhooks, file uploads) and actions (AI chat, emails, API calls). Want to build an automation workflow?";
        }

        if (lowerMessage.includes('voice') || lowerMessage.includes('speak')) {
            return "🔊 I support voice interactions! You can speak to me using voice recognition, and I can respond with text-to-speech. I support multiple languages and voices. Would you like to try voice chat?";
        }

        if (lowerMessage.includes('file') || lowerMessage.includes('upload')) {
            return "📁 I can analyze various file types! Upload PDFs, documents, images, or code files, and I'll extract content, analyze it, and help you work with the information. You can also drag and drop files directly into the chat!";
        }

        if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
            return `🚀 I'm Zeeky AI with revolutionary capabilities:

🤝 **Real-time Collaboration** - Work with teams in shared AI sessions
🎭 **15+ AI Personalities** - Professional, Creative, Technical, and more
🧪 **Live Code Execution** - Run JavaScript, Python, HTML, CSS, SQL, JSON
👁️ **Advanced Vision AI** - Generate, analyze, and edit images
🔄 **Workflow Automation** - Create visual automation workflows
🔊 **Voice Integration** - Speak and listen with AI
📁 **File Processing** - Analyze documents, images, and code

What would you like to explore first?`;
        }

        // General responses
        const responses = [
            "That's an interesting question! I'm here to help you with my revolutionary AI capabilities. What specific feature would you like to explore?",
            "I understand what you're asking. With my advanced features like real-time collaboration, AI personalities, and code execution, I can assist you in many ways!",
            "Great question! I'd be happy to help. I have unique capabilities like vision AI, workflow automation, and live programming environments. What interests you most?",
            "Let me help you with that! As a revolutionary AI platform, I can collaborate with teams, execute code, generate images, and much more. What would you like to try?",
            "That's fascinating! I'm equipped with next-level features including 15+ personalities, real-time collaboration, and advanced automation. How can I assist you today?"
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    startNewChat() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="message bot">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            <p>👋 Hello! I'm Zeeky AI, your revolutionary AI assistant. How can I help you today?</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.messageHistory = [];
        
        // Focus on input
        const chatInput = document.getElementById('chat-input');
        chatInput?.focus();
    }

    // Feature opening methods (placeholders for now)
    openCollaboration() {
        console.log('Opening Collaboration...');
        // Will integrate with existing collaboration extension
    }

    openPersonalities() {
        console.log('Opening AI Personalities...');
        // Will integrate with existing personalities extension
    }

    openCodeLab() {
        console.log('Opening Code Laboratory...');
        // Will integrate with existing code lab extension
    }

    openVision() {
        console.log('Opening Vision AI...');
        // Will integrate with existing vision extension
    }

    openWorkflows() {
        console.log('Opening Workflows...');
        // Will integrate with existing workflow extension
    }

    openVoice() {
        console.log('Opening Voice Chat...');
        const modal = document.getElementById('voice-modal');
        modal?.classList.add('active');
    }

    openFiles() {
        console.log('Opening File Upload...');
        // Will integrate with existing file handler
    }

    openAnalytics() {
        console.log('Opening Analytics...');
        // Will integrate with existing analytics
    }

    openThemes() {
        console.log('Opening Theme Manager...');
        // Will integrate with existing theme manager
    }

    openSettings() {
        console.log('Opening Settings...');
        // Will integrate with existing settings
    }

    openCommandPalette() {
        console.log('Opening Command Palette...');
        // Future feature
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.classList.remove('active'));
    }
}

// Initialize Modern UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.modernUI = new ModernUI();
});
