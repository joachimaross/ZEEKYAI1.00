// Modern UI Controller for Zeeky AI
class ModernUI {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.sidebarOpen = window.innerWidth > 768;
        this.sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        this.currentPersonality = 'default';
        this.messageHistory = [];
        this.chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        this.currentChatId = null;
        this.isTyping = false;
        this.welcomeScreenVisible = true;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.setupResponsive();
        this.setupChatInput();
        this.setupKeyboardShortcuts();
        this.setupWelcomeScreen();
        this.setupChatHistory();
        this.applySidebarState();

        console.log('🎨 Modern UI initialized');
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle?.addEventListener('click', () => this.toggleTheme());

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        mobileToggle?.addEventListener('click', () => this.toggleSidebar());

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        sidebarToggle?.addEventListener('click', () => this.toggleSidebarCollapse());

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

        // Welcome screen interactions
        this.setupWelcomeInteractions();

        // Personality modal
        this.setupPersonalityModal();

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

        // Initialize chat if needed
        if (!this.currentChatId) {
            this.currentChatId = this.generateChatId();
        }

        // Add user message
        this.addMessageToDOM('user', message);
        this.messageHistory.push({ type: 'user', content: message, timestamp: Date.now() });

        chatInput.value = '';
        this.handleInputChange();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Simulate API call
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessageToDOM('bot', response);
            this.messageHistory.push({ type: 'bot', content: response, timestamp: Date.now() });

            // Save chat to history
            this.saveChatToHistory();
            this.updateChatHistory();
        } catch (error) {
            this.hideTypingIndicator();
            const errorMessage = 'Sorry, I encountered an error. Please try again.';
            this.addMessageToDOM('bot', errorMessage);
            this.messageHistory.push({ type: 'bot', content: errorMessage, timestamp: Date.now() });
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
        try {
            // Try to use real API first
            const response = await this.callRealAPI(message);
            if (response && response.success) {
                return response.response;
            }
        } catch (error) {
            console.log('API call failed, using enhanced simulation:', error);
        }

        // Fallback to enhanced simulation
        return await this.getEnhancedSimulatedResponse(message);
    }

    async callRealAPI(message) {
        // Check if we have API client available
        if (typeof window.zeekyAPI !== 'undefined') {
            try {
                const response = await window.zeekyAPI.chat({
                    message: message,
                    personality: this.currentPersonality,
                    chat_id: this.currentChatId || 'default',
                    user_id: 'frontend_user'
                });
                return response;
            } catch (error) {
                console.error('Real API call failed:', error);
                return null;
            }
        }

        // Try direct backend call
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    personality: this.currentPersonality,
                    chat_id: this.currentChatId || 'default',
                    user_id: 'frontend_user'
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.error('Backend API call failed:', error);
        }

        return null;
    }

    async getEnhancedSimulatedResponse(message) {
        // Simulate realistic API delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));

        const lowerMessage = message.toLowerCase();
        const personality = this.getPersonalityConfig(this.currentPersonality);

        // Generate personality-based response
        return await this.generatePersonalityResponse(message, lowerMessage, personality);
    }

    getPersonalityConfig(personalityName) {
        const personalities = {
            "default": {
                name: "Zeeky",
                traits: ["helpful", "curious", "empathetic", "intelligent"],
                style: "conversational and warm"
            },
            "creative": {
                name: "Creative Zeeky",
                traits: ["creative", "imaginative", "artistic", "inspiring"],
                style: "expressive and colorful"
            },
            "technical": {
                name: "Tech Zeeky",
                traits: ["analytical", "precise", "knowledgeable", "logical"],
                style: "clear and technical but approachable"
            },
            "casual": {
                name: "Casual Zeeky",
                traits: ["relaxed", "friendly", "humorous", "relatable"],
                style: "casual and friendly like talking to a buddy"
            },
            "professional": {
                name: "Professional Zeeky",
                traits: ["professional", "efficient", "reliable", "articulate"],
                style: "polished and business-appropriate"
            },
            "philosopher": {
                name: "Philosopher Zeeky",
                traits: ["thoughtful", "wise", "contemplative", "insightful"],
                style: "reflective and thought-provoking"
            }
        };

        return personalities[personalityName] || personalities["default"];
    }

    async generatePersonalityResponse(message, lowerMessage, personality) {
        // Check conversation context
        const hasHistory = this.messageHistory.length > 0;
        const lastBotMessage = this.getLastBotMessage();

        // Handle greetings
        if (this.isGreeting(lowerMessage)) {
            return this.generateGreetingResponse(personality);
        }

        // Handle help requests
        if (this.isHelpRequest(lowerMessage)) {
            return this.generateHelpResponse(personality);
        }

        // Handle feature-specific questions
        const featureResponse = this.getFeatureSpecificResponse(lowerMessage, personality);
        if (featureResponse) {
            return featureResponse;
        }

        // Handle follow-up questions
        if (hasHistory && this.isFollowUp(lowerMessage)) {
            return this.generateFollowUpResponse(message, personality, lastBotMessage);
        }

        // Generate contextual response based on personality
        return this.generateContextualResponse(message, lowerMessage, personality);
    }

    isGreeting(message) {
        const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
        return greetings.some(greeting => message.includes(greeting));
    }

    isHelpRequest(message) {
        const helpKeywords = ['help', 'what can you', 'capabilities', 'features', 'what do you do'];
        return helpKeywords.some(keyword => message.includes(keyword));
    }

    isFollowUp(message) {
        const followUpKeywords = ['what about', 'and', 'also', 'tell me more', 'continue', 'explain', 'how'];
        return followUpKeywords.some(keyword => message.includes(keyword));
    }

    getLastBotMessage() {
        for (let i = this.messageHistory.length - 1; i >= 0; i--) {
            if (this.messageHistory[i].type === 'bot') {
                return this.messageHistory[i].content;
            }
        }
        return null;
    }

    generateGreetingResponse(personality) {
        const greetings = {
            "default": [
                "Hello! 👋 I'm Zeeky, your friendly AI assistant. I'm here to help you with anything you need!",
                "Hi there! 😊 Great to meet you! I'm Zeeky, and I'm excited to help you explore my capabilities.",
                "Hey! 🌟 Welcome to Zeeky AI! I'm here to assist you with a wide range of tasks and questions."
            ],
            "creative": [
                "Hey there, creative soul! ✨ I'm Creative Zeeky, buzzing with artistic energy today. What masterpiece shall we create together?",
                "Hello, my imaginative friend! 🎨 The canvas of possibilities is blank before us. What shall we paint with words and ideas?",
                "Greetings, fellow dreamer! 🌟 I can feel the creative sparks flying already. What vision shall we bring to life?"
            ],
            "technical": [
                "Hello! 👨‍💻 Tech Zeeky here, ready to dive into the fascinating world of technology with you. What technical challenge can I help you solve?",
                "Greetings! 🔧 I'm excited to explore the technical realm with you. Whether it's coding, system architecture, or emerging tech - I'm here to help!",
                "Hey there! ⚡ Ready to geek out about technology? I love discussing everything from algorithms to system design. What's on your technical mind?"
            ],
            "casual": [
                "Hey! 👋 What's up? I'm just chilling here, ready to chat about whatever's on your mind!",
                "Yo! 😄 Good to see you! I'm in a pretty good mood today - what's going on with you?",
                "Hey there! 🙂 Just hanging out, ready to help with whatever you need. What's the vibe today?"
            ],
            "professional": [
                "Good day! I'm Professional Zeeky, your dedicated AI assistant. How may I assist you with your professional needs today?",
                "Hello! I'm here to provide you with efficient, reliable assistance for your business and professional requirements.",
                "Greetings! I'm ready to help you achieve your professional goals with precision and expertise."
            ],
            "philosopher": [
                "Greetings, fellow seeker of wisdom! 🤔 I'm Philosopher Zeeky, ready to explore the depths of thought and meaning with you.",
                "Hello! What brings you to this moment of inquiry? I'm here to contemplate life's big questions alongside you.",
                "Welcome, thoughtful soul! 💭 Shall we embark on a journey of philosophical discovery together?"
            ]
        };

        const personalityGreetings = greetings[this.currentPersonality] || greetings["default"];
        return this.getRandomResponse(personalityGreetings);
    }

    generateHelpResponse(personality) {
        const helpResponses = {
            "default": `🚀 I'm Zeeky AI with revolutionary capabilities:

🤝 **Real-time Collaboration** - Work with teams in shared AI sessions
🎭 **Multiple Personalities** - Creative, Technical, Professional, and more
🧪 **Live Code Execution** - Run code in JavaScript, Python, HTML, CSS, SQL, JSON
👁️ **Advanced Vision AI** - Generate, analyze, and edit images
🔄 **Workflow Automation** - Create visual automation workflows
🔊 **Voice Integration** - Natural speech-to-text and text-to-speech
📁 **File Processing** - Analyze documents, images, and code files

What would you like to explore first?`,

            "creative": "Oh, the places we'll go together! 🚀 I can help you brainstorm wild ideas, craft beautiful stories, design stunning visuals, create music concepts, write poetry, or dive into any creative adventure your heart desires! Think of me as your creative muse - what's calling to your artistic spirit?",

            "technical": "I'm here to provide technical expertise across the full stack! 🛠️ I can help with programming languages, system design, code reviews, debugging, performance optimization, cybersecurity, DevOps, databases, and staying current with tech trends. What technical challenge can I tackle for you?",

            "casual": "Sure thing! 😊 I'm pretty good at helping with all sorts of stuff. Whether you want to chat, get answers to questions, work on projects, or just hang out and brainstorm - I'm here for whatever you need! What's going on?",

            "professional": "I provide comprehensive professional assistance including business strategy, project management, communication support, data analysis, research, and productivity optimization. I'm here to help you achieve your professional objectives efficiently and effectively.",

            "philosopher": "Ah, the eternal question of purpose and capability! 🤔 I'm here to explore the depths of human knowledge and experience with you. We can contemplate existence, discuss ethics, examine the nature of consciousness, or dive into any philosophical inquiry that stirs your soul."
        };

        return helpResponses[this.currentPersonality] || helpResponses["default"];
    }

    getFeatureSpecificResponse(lowerMessage, personality) {
        // Collaboration
        if (lowerMessage.includes('collaboration') || lowerMessage.includes('team')) {
            const responses = {
                "creative": "🤝 Collaborative creativity is magical! I can help you set up shared creative spaces where teams can brainstorm, ideate, and create together in real-time. Imagine multiple minds working with AI to birth amazing ideas!",
                "technical": "🤝 Technical collaboration made efficient! I can create shared coding environments where your team can collaborate on code, review together, and solve complex problems with AI assistance in real-time.",
                "default": "🤝 I can help you set up real-time collaboration! Create shared workspaces where multiple users can interact with AI together, see live updates, and collaborate seamlessly. Would you like me to show you how?"
            };
            return responses[this.currentPersonality] || responses["default"];
        }

        // Code/Programming
        if (lowerMessage.includes('code') || lowerMessage.includes('programming')) {
            const responses = {
                "creative": "🧪 Coding is like digital art! Let's write some beautiful, elegant code that's not just functional but poetic. I can help you create clean, creative solutions that are both powerful and aesthetically pleasing.",
                "technical": "🧪 Excellent! Let's write some clean, efficient code. I can help with algorithms, data structures, debugging, optimization, architecture decisions, or any programming language. What are we building?",
                "casual": "🧪 Cool! I love coding. I can help you write code, fix bugs, or just mess around with different programming languages. It's pretty fun actually! What kind of code do you want to work on?",
                "default": "🧪 I can execute code in real-time across multiple languages! I support JavaScript, Python, HTML, CSS, SQL, and JSON. You can write code, and I'll run it instantly. Want to try coding something together?"
            };
            return responses[this.currentPersonality] || responses["default"];
        }

        // Images/Vision
        if (lowerMessage.includes('image') || lowerMessage.includes('picture') || lowerMessage.includes('visual')) {
            const responses = {
                "creative": "👁️ Visual creativity is my passion! I can generate stunning images in any style you can imagine - from photorealistic to abstract art, cyberpunk to watercolor. I can also analyze images and help you edit them. What visual masterpiece shall we create?",
                "technical": "👁️ I have advanced computer vision capabilities! I can generate images using various AI models, analyze image data, extract text with OCR, detect objects, and process visual information programmatically. What's your vision project?",
                "default": "👁️ I have advanced vision capabilities! I can generate images in multiple styles, analyze uploaded images, detect objects and text, and even help with image editing. What kind of visual content would you like to create?"
            };
            return responses[this.currentPersonality] || responses["default"];
        }

        return null; // No specific feature match
    }

    generateFollowUpResponse(message, personality, lastBotMessage) {
        const followUpStarters = {
            "creative": [
                "Ooh, building on that creative energy! ✨",
                "I love where your imagination is taking us! 🎨",
                "Yes! Let's dive deeper into this creative realm! 🌟"
            ],
            "technical": [
                "Great follow-up question! Let me expand on that technical aspect...",
                "Excellent point! Let's dive deeper into the technical details...",
                "Building on our technical discussion..."
            ],
            "casual": [
                "Oh yeah, good point! 😄",
                "That's a cool follow-up! 👍",
                "Nice, let me tell you more about that! 😊"
            ],
            "default": [
                "Great follow-up question!",
                "I'm glad you want to explore this further...",
                "Building on what we were discussing..."
            ]
        };

        const starters = followUpStarters[this.currentPersonality] || followUpStarters["default"];
        const starter = this.getRandomResponse(starters);

        return `${starter} ${this.generateContextualResponse(message, message.toLowerCase(), personality)}`;
    }

    generateContextualResponse(message, lowerMessage, personality) {
        // Generate intelligent contextual responses
        const contextualResponses = [
            "That's a fascinating question! Let me share my insights on this topic...",
            "I understand what you're asking about. Based on my knowledge and capabilities, here's what I can tell you...",
            "Interesting perspective! I'm here to help you explore this further...",
            "Great question! Let me provide you with a comprehensive response..."
        ];

        // Add personality flavor
        const personalityFlavors = {
            "creative": " I'm feeling inspired to give you a response that's both helpful and beautifully crafted! ✨",
            "technical": " Let me provide a systematic analysis of this... 🔍",
            "casual": " Let me break this down for you in a way that makes sense! 😊",
            "professional": " I'll provide you with a thorough and professional response.",
            "philosopher": " This opens up fascinating territory for contemplation... 🤔"
        };

        const baseResponse = this.getRandomResponse(contextualResponses);
        const flavor = personalityFlavors[this.currentPersonality] || "";

        return baseResponse + flavor;
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Personality Management
    setupPersonalityModal() {
        const personalitiesNav = document.getElementById('personalities-nav');
        const personalityModal = document.getElementById('personality-modal');
        const personalityClose = document.getElementById('personality-close');

        personalitiesNav?.addEventListener('click', () => {
            this.openPersonalityModal();
        });

        personalityClose?.addEventListener('click', () => {
            personalityModal?.classList.remove('active');
        });

        personalityModal?.addEventListener('click', (e) => {
            if (e.target === personalityModal) {
                personalityModal.classList.remove('active');
            }
        });

        this.loadPersonalities();
    }

    async openPersonalityModal() {
        const modal = document.getElementById('personality-modal');
        modal?.classList.add('active');
        await this.loadPersonalities();
    }

    async loadPersonalities() {
        try {
            // Try to fetch from API first
            const response = await fetch('/api/personality/list');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.renderPersonalities(data.personalities);
                    return;
                }
            }
        } catch (error) {
            console.log('API call failed, using local personalities');
        }

        // Fallback to local personalities
        const personalities = {
            "default": {
                name: "Zeeky",
                description: "Friendly, helpful, and knowledgeable AI assistant",
                traits: ["helpful", "curious", "empathetic", "intelligent"],
                style: "conversational and warm"
            },
            "creative": {
                name: "Creative Zeeky",
                description: "Imaginative and artistic AI with a flair for creativity",
                traits: ["creative", "imaginative", "artistic", "inspiring"],
                style: "expressive and colorful"
            },
            "technical": {
                name: "Tech Zeeky",
                description: "Technical expert with deep knowledge of programming and technology",
                traits: ["analytical", "precise", "knowledgeable", "logical"],
                style: "clear and technical but approachable"
            },
            "casual": {
                name: "Casual Zeeky",
                description: "Laid-back and friendly AI who speaks like a close friend",
                traits: ["relaxed", "friendly", "humorous", "relatable"],
                style: "casual and friendly like talking to a buddy"
            },
            "professional": {
                name: "Professional Zeeky",
                description: "Business-focused AI assistant for professional environments",
                traits: ["professional", "efficient", "reliable", "articulate"],
                style: "polished and business-appropriate"
            },
            "philosopher": {
                name: "Philosopher Zeeky",
                description: "Thoughtful AI who loves deep conversations and philosophical discussions",
                traits: ["thoughtful", "wise", "contemplative", "insightful"],
                style: "reflective and thought-provoking"
            }
        };

        this.renderPersonalities(personalities);
    }

    renderPersonalities(personalities) {
        const grid = document.getElementById('personality-grid');
        if (!grid) return;

        grid.innerHTML = '';

        Object.entries(personalities).forEach(([key, personality]) => {
            const card = document.createElement('div');
            card.className = `personality-card ${key === this.currentPersonality ? 'active' : ''}`;
            card.dataset.personality = key;

            const avatar = this.getPersonalityAvatar(key);

            card.innerHTML = `
                <div class="personality-avatar">${avatar}</div>
                <div class="personality-name">${personality.name}</div>
                <div class="personality-description">${personality.description}</div>
                <div class="personality-traits">
                    ${personality.traits.map(trait => `<span class="trait-tag">${trait}</span>`).join('')}
                </div>
            `;

            card.addEventListener('click', () => {
                this.switchPersonality(key, personality.name);
            });

            grid.appendChild(card);
        });
    }

    getPersonalityAvatar(personality) {
        const avatars = {
            "default": "🤖",
            "creative": "🎨",
            "technical": "💻",
            "casual": "😎",
            "professional": "👔",
            "philosopher": "🤔"
        };
        return avatars[personality] || "🤖";
    }

    async switchPersonality(personalityKey, personalityName) {
        try {
            // Try API call first
            const response = await fetch('/api/personality/switch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: 'frontend_user',
                    chat_id: this.currentChatId || 'default',
                    personality: personalityKey
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('Personality switched via API:', data.message);
                }
            }
        } catch (error) {
            console.log('API personality switch failed, using local switch');
        }

        // Update local personality
        this.currentPersonality = personalityKey;

        // Update UI
        this.updatePersonalityIndicator(personalityName);

        // Close modal
        const modal = document.getElementById('personality-modal');
        modal?.classList.remove('active');

        // Show confirmation message
        this.addMessageToDOM('bot', `Hi! I've switched to ${personalityName}. ${this.getPersonalityGreeting(personalityKey)}`);

        // Update personality cards
        document.querySelectorAll('.personality-card').forEach(card => {
            card.classList.toggle('active', card.dataset.personality === personalityKey);
        });

        this.showToast(`Switched to ${personalityName}`);
    }

    updatePersonalityIndicator(personalityName) {
        const indicator = document.querySelector('.current-personality');
        if (indicator) {
            indicator.textContent = personalityName.replace(' Zeeky', '');
        }
    }

    getPersonalityGreeting(personality) {
        const greetings = {
            "default": "I'm here to help you with anything you need!",
            "creative": "Let's create something amazing together! ✨",
            "technical": "Ready to dive into some technical challenges! 💻",
            "casual": "What's up? Ready to chat! 😄",
            "professional": "I'm ready to assist you with your professional needs.",
            "philosopher": "Shall we explore some deep thoughts together? 🤔"
        };
        return greetings[personality] || greetings["default"];
    }

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
        // Save current chat if it has messages
        if (this.messageHistory.length > 0) {
            this.saveChatToHistory();
        }

        this.messageHistory = [];
        this.currentPersonality = 'default';
        this.currentChatId = this.generateChatId();

        const chatMessages = document.getElementById('chat-messages');
        const welcomeScreen = document.getElementById('welcome-screen');

        if (chatMessages && welcomeScreen) {
            chatMessages.innerHTML = '';
            chatMessages.style.display = 'none';
            welcomeScreen.style.display = 'flex';
            this.welcomeScreenVisible = true;
        }

        this.updateChatHistory();
        console.log('🆕 New chat started');
    }

    generateChatId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveChatToHistory() {
        if (this.messageHistory.length === 0) return;

        const firstMessage = this.messageHistory.find(msg => msg.type === 'user');
        const title = firstMessage ?
            firstMessage.content.substring(0, 50) + (firstMessage.content.length > 50 ? '...' : '') :
            'New Chat';

        const chatData = {
            id: this.currentChatId || this.generateChatId(),
            title: title,
            messages: [...this.messageHistory],
            timestamp: Date.now(),
            personality: this.currentPersonality
        };

        // Remove existing chat with same ID
        this.chatHistory = this.chatHistory.filter(chat => chat.id !== chatData.id);

        // Add to beginning of array
        this.chatHistory.unshift(chatData);

        // Keep only last 50 chats
        if (this.chatHistory.length > 50) {
            this.chatHistory = this.chatHistory.slice(0, 50);
        }

        localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
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

    // New methods for enhanced interface
    toggleSidebarCollapse() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed.toString());
        this.applySidebarState();
    }

    applySidebarState() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            if (this.sidebarCollapsed) {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
            }
        }
    }

    setupWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const chatMessages = document.getElementById('chat-messages');

        if (this.messageHistory.length === 0) {
            welcomeScreen?.style.setProperty('display', 'flex');
            chatMessages?.style.setProperty('display', 'none');
            this.welcomeScreenVisible = true;
        } else {
            welcomeScreen?.style.setProperty('display', 'none');
            chatMessages?.style.setProperty('display', 'block');
            this.welcomeScreenVisible = false;
        }
    }

    setupWelcomeInteractions() {
        // Quick action cards
        const actionCards = document.querySelectorAll('.action-card');
        actionCards.forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Suggested prompts
        const promptChips = document.querySelectorAll('.prompt-chip');
        promptChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const prompt = chip.dataset.prompt;
                this.usePrompt(prompt);
            });
        });
    }

    handleQuickAction(action) {
        switch (action) {
            case 'collaboration':
                this.openCollaboration();
                break;
            case 'code':
                this.openCodeLab();
                break;
            case 'vision':
                this.openVision();
                break;
            case 'personalities':
                this.openPersonalities();
                break;
        }
    }

    usePrompt(prompt) {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = prompt;
            this.handleInputChange();
            chatInput.focus();
        }
    }

    setupChatHistory() {
        this.updateChatHistory();
    }

    updateChatHistory() {
        const chatHistoryContainer = document.getElementById('chat-history');
        if (!chatHistoryContainer) return;

        chatHistoryContainer.innerHTML = '';

        this.chatHistory.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-history-item';
            if (chat.id === this.currentChatId) {
                chatItem.classList.add('active');
            }

            chatItem.innerHTML = `
                <div class="chat-title">${chat.title}</div>
                <div class="chat-actions">
                    <button class="chat-action-btn" data-action="delete" data-chat-id="${chat.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            chatItem.addEventListener('click', (e) => {
                if (!e.target.closest('.chat-action-btn')) {
                    this.loadChat(chat.id);
                }
            });

            chatHistoryContainer.appendChild(chatItem);
        });

        // Add event listeners for chat actions
        const actionBtns = chatHistoryContainer.querySelectorAll('.chat-action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const chatId = btn.dataset.chatId;

                if (action === 'delete') {
                    this.deleteChat(chatId);
                }
            });
        });
    }

    loadChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (!chat) return;

        // Save current chat first
        if (this.messageHistory.length > 0) {
            this.saveChatToHistory();
        }

        this.currentChatId = chatId;
        this.messageHistory = [...chat.messages];
        this.currentPersonality = chat.personality || 'default';

        // Hide welcome screen and show chat
        const welcomeScreen = document.getElementById('welcome-screen');
        const chatMessages = document.getElementById('chat-messages');

        if (welcomeScreen && chatMessages) {
            welcomeScreen.style.display = 'none';
            chatMessages.style.display = 'block';
            this.welcomeScreenVisible = false;
        }

        // Render messages
        this.renderChatMessages();
        this.updateChatHistory();
    }

    deleteChat(chatId) {
        this.chatHistory = this.chatHistory.filter(chat => chat.id !== chatId);
        localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));

        if (this.currentChatId === chatId) {
            this.startNewChat();
        } else {
            this.updateChatHistory();
        }
    }

    renderChatMessages() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        chatMessages.innerHTML = '';

        this.messageHistory.forEach(message => {
            this.addMessageToDOM(message.type, message.content);
        });

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    addMessageToDOM(type, content) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const avatarIcon = type === 'user' ? 'fas fa-user' : 'fas fa-robot';

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    ${content}
                </div>
            </div>
            <div class="message-actions">
                <button class="message-action-btn" title="Copy">
                    <i class="fas fa-copy"></i>
                </button>
                ${type === 'bot' ? '<button class="message-action-btn" title="Regenerate"><i class="fas fa-redo"></i></button>' : ''}
            </div>
        `;

        chatMessages.appendChild(messageDiv);

        // Add event listeners for message actions
        const actionBtns = messageDiv.querySelectorAll('.message-action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.title.toLowerCase();
                if (action === 'copy') {
                    navigator.clipboard.writeText(content);
                    this.showToast('Message copied to clipboard');
                } else if (action === 'regenerate') {
                    // Implement regenerate functionality
                    console.log('Regenerating message...');
                }
            });
        });

        // Hide welcome screen if visible
        if (this.welcomeScreenVisible) {
            const welcomeScreen = document.getElementById('welcome-screen');
            if (welcomeScreen) {
                welcomeScreen.style.display = 'none';
                chatMessages.style.display = 'block';
                this.welcomeScreenVisible = false;
            }
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--bg-tertiary);
            color: var(--text-primary);
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: var(--shadow-2);
            z-index: 1000;
            animation: fadeInUp 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize Modern UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.modernUI = new ModernUI();
});
