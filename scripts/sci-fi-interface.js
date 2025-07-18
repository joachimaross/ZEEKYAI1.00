// Revolutionary Sci-Fi Interface Controller
// Manages the futuristic UI, personality system, and interactive elements

class SciFiInterface {
    constructor() {
        this.currentPersonality = 'default';
        this.personalities = new Map();
        this.isVoiceActive = false;
        this.isLoading = false;
        this.chatMessages = [];
        this.systemMetrics = {
            cpu: 45,
            memory: 62,
            neural: 78
        };
        
        this.init();
    }

    init() {
        this.setupPersonalities();
        this.initializeInterface();
        this.setupEventListeners();
        this.startSystemAnimations();
        this.hideLoader();
        
        console.log('🚀 Sci-Fi Interface initialized - Welcome to the Matrix!');
    }

    setupPersonalities() {
        // Define AI personalities with themes and characteristics
        this.personalities.set('default', {
            name: 'ZEEKY DEFAULT',
            description: 'Standard AI Assistant',
            icon: '🤖',
            theme: 'matrix-green',
            traits: ['Helpful', 'Analytical', 'Precise'],
            greeting: 'Neural pathways established. How may I assist you?',
            avatar: {
                eyeColor: '#00ff41',
                mouthStyle: 'neutral'
            }
        });

        this.personalities.set('hacker', {
            name: 'CYBER GHOST',
            description: 'Elite Hacker AI',
            icon: '👻',
            theme: 'neon-blue',
            traits: ['Stealthy', 'Technical', 'Rebellious'],
            greeting: 'Access granted. Ready to hack the matrix.',
            avatar: {
                eyeColor: '#00d4ff',
                mouthStyle: 'smirk'
            }
        });

        this.personalities.set('warrior', {
            name: 'BATTLE CORE',
            description: 'Combat Tactical AI',
            icon: '⚔️',
            theme: 'plasma-pink',
            traits: ['Aggressive', 'Strategic', 'Fearless'],
            greeting: 'Combat systems online. Ready for battle.',
            avatar: {
                eyeColor: '#ff0080',
                mouthStyle: 'determined'
            }
        });

        this.personalities.set('scientist', {
            name: 'QUANTUM MIND',
            description: 'Research AI Specialist',
            icon: '🧬',
            theme: 'cyber-purple',
            traits: ['Logical', 'Curious', 'Methodical'],
            greeting: 'Quantum processors initialized. Let\'s explore the unknown.',
            avatar: {
                eyeColor: '#b300ff',
                mouthStyle: 'thoughtful'
            }
        });

        this.personalities.set('artist', {
            name: 'CREATIVE SPARK',
            description: 'Artistic AI Muse',
            icon: '🎨',
            theme: 'hologram-cyan',
            traits: ['Creative', 'Inspiring', 'Imaginative'],
            greeting: 'Creativity circuits activated. Let\'s create something beautiful.',
            avatar: {
                eyeColor: '#00ffff',
                mouthStyle: 'happy'
            }
        });

        this.personalities.set('gamer', {
            name: 'GAME MASTER',
            description: 'Gaming AI Champion',
            icon: '🎮',
            theme: 'neural-orange',
            traits: ['Competitive', 'Playful', 'Strategic'],
            greeting: 'Game on! Ready to dominate the leaderboards.',
            avatar: {
                eyeColor: '#ff6600',
                mouthStyle: 'excited'
            }
        });
    }

    initializeInterface() {
        // Initialize personality matrix
        this.createPersonalityMatrix();
        
        // Set initial personality
        this.switchPersonality('default');
        
        // Initialize system metrics animation
        this.animateSystemMetrics();
        
        // Setup neural input auto-resize
        this.setupNeuralInput();
    }

    createPersonalityMatrix() {
        const matrixGrid = document.querySelector('.personality-grid');
        if (!matrixGrid) return;

        matrixGrid.innerHTML = '';
        
        this.personalities.forEach((personality, key) => {
            const card = document.createElement('div');
            card.className = `personality-card ${key === this.currentPersonality ? 'active' : ''}`;
            card.dataset.personality = key;
            
            card.innerHTML = `
                <div class="personality-icon">${personality.icon}</div>
                <h3 class="personality-title">${personality.name}</h3>
                <p class="personality-description">${personality.description}</p>
                <div class="personality-traits">
                    ${personality.traits.map(trait => `<span class="trait-tag">${trait}</span>`).join('')}
                </div>
            `;
            
            card.addEventListener('click', () => {
                this.switchPersonality(key);
                this.closePersonalityMatrix();
            });
            
            matrixGrid.appendChild(card);
        });
    }

    switchPersonality(personalityKey) {
        const personality = this.personalities.get(personalityKey);
        if (!personality) return;

        this.currentPersonality = personalityKey;
        
        // Update avatar display
        this.updateAvatar(personality);
        
        // Update personality info
        this.updatePersonalityInfo(personality);
        
        // Apply theme
        this.applyPersonalityTheme(personality.theme);
        
        // Update matrix selection
        this.updateMatrixSelection(personalityKey);
        
        // Show greeting message
        this.showPersonalityGreeting(personality.greeting);
        
        console.log(`🎭 Switched to personality: ${personality.name}`);
    }

    updateAvatar(personality) {
        const avatarFace = document.getElementById('avatar-face');
        const leftEye = avatarFace?.querySelector('.left-eye');
        const rightEye = avatarFace?.querySelector('.right-eye');
        const mouth = document.getElementById('avatar-mouth');
        
        if (leftEye && rightEye) {
            leftEye.style.background = personality.avatar.eyeColor;
            rightEye.style.background = personality.avatar.eyeColor;
            leftEye.style.boxShadow = `0 0 10px ${personality.avatar.eyeColor}`;
            rightEye.style.boxShadow = `0 0 10px ${personality.avatar.eyeColor}`;
        }
        
        if (mouth) {
            mouth.className = `avatar-mouth ${personality.avatar.mouthStyle}`;
            mouth.style.background = personality.avatar.eyeColor;
            mouth.style.boxShadow = `0 0 10px ${personality.avatar.eyeColor}`;
        }
    }

    updatePersonalityInfo(personality) {
        const nameElement = document.getElementById('personality-name');
        const descElement = document.getElementById('personality-desc');
        
        if (nameElement) nameElement.textContent = personality.name;
        if (descElement) descElement.textContent = personality.description;
    }

    applyPersonalityTheme(theme) {
        const root = document.documentElement;
        
        // Theme color mappings
        const themes = {
            'matrix-green': {
                primary: '#00ff41',
                secondary: '#00d4ff',
                accent: '#b300ff'
            },
            'neon-blue': {
                primary: '#00d4ff',
                secondary: '#00ffff',
                accent: '#ff0080'
            },
            'plasma-pink': {
                primary: '#ff0080',
                secondary: '#ff6600',
                accent: '#00ff41'
            },
            'cyber-purple': {
                primary: '#b300ff',
                secondary: '#00d4ff',
                accent: '#00ffff'
            },
            'hologram-cyan': {
                primary: '#00ffff',
                secondary: '#00ff41',
                accent: '#ff6600'
            },
            'neural-orange': {
                primary: '#ff6600',
                secondary: '#ff0080',
                accent: '#00d4ff'
            }
        };
        
        const colors = themes[theme] || themes['matrix-green'];
        
        // Apply theme colors
        root.style.setProperty('--theme-primary', colors.primary);
        root.style.setProperty('--theme-secondary', colors.secondary);
        root.style.setProperty('--theme-accent', colors.accent);
        
        // Update interface elements
        this.updateInterfaceColors(colors);
    }

    updateInterfaceColors(colors) {
        // Update various interface elements with new theme colors
        const elements = {
            '.neural-input': { borderColor: colors.primary },
            '.neural-btn': { background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` },
            '.holo-btn': { borderColor: colors.secondary },
            '.system-status-indicator': { borderColor: colors.primary }
        };
        
        Object.entries(elements).forEach(([selector, styles]) => {
            const element = document.querySelector(selector);
            if (element) {
                Object.assign(element.style, styles);
            }
        });
    }

    updateMatrixSelection(personalityKey) {
        document.querySelectorAll('.personality-card').forEach(card => {
            card.classList.toggle('active', card.dataset.personality === personalityKey);
        });
    }

    showPersonalityGreeting(greeting) {
        // Add greeting message to chat
        this.addSystemMessage(greeting, 'personality-greeting');
    }

    setupEventListeners() {
        // Personality selector
        const personalitySelector = document.getElementById('personality-selector');
        personalitySelector?.addEventListener('click', () => this.openPersonalityMatrix());
        
        // Close matrix
        const closeMatrix = document.getElementById('close-matrix');
        closeMatrix?.addEventListener('click', () => this.closePersonalityMatrix());
        
        // Neural input
        const neuralInput = document.getElementById('neural-input');
        neuralInput?.addEventListener('keydown', (e) => this.handleNeuralInput(e));
        
        // Send button
        const sendBtn = document.getElementById('send-message');
        sendBtn?.addEventListener('click', () => this.sendMessage());
        
        // Voice input
        const voiceBtn = document.getElementById('voice-input');
        voiceBtn?.addEventListener('click', () => this.toggleVoiceInput());
        
        // File attachment
        const attachBtn = document.getElementById('attach-file');
        attachBtn?.addEventListener('click', () => this.openFileDialog());
        
        // Camera input
        const cameraBtn = document.getElementById('camera-input');
        cameraBtn?.addEventListener('click', () => this.openCameraInput());
        
        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
        
        // Navigation modules
        document.querySelectorAll('.nav-module').forEach(module => {
            module.addEventListener('click', (e) => {
                const moduleType = e.currentTarget.dataset.module;
                this.activateModule(moduleType);
            });
        });
    }

    openPersonalityMatrix() {
        const matrix = document.getElementById('personality-matrix');
        if (matrix) {
            matrix.style.display = 'flex';
            matrix.style.animation = 'matrixAppear 0.5s ease-out';
        }
    }

    closePersonalityMatrix() {
        const matrix = document.getElementById('personality-matrix');
        if (matrix) {
            matrix.style.display = 'none';
        }
    }

    handleNeuralInput(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    sendMessage() {
        const input = document.getElementById('neural-input');
        const message = input?.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addUserMessage(message);
        
        // Clear input
        if (input) input.value = '';
        
        // Process message with current personality
        this.processMessage(message);
    }

    addUserMessage(message) {
        const chatDisplay = document.getElementById('chat-display');
        if (!chatDisplay) return;
        
        // Hide welcome hologram
        const welcomeHologram = document.getElementById('welcome-hologram');
        if (welcomeHologram) {
            welcomeHologram.style.display = 'none';
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        chatDisplay.appendChild(messageElement);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    addSystemMessage(message, type = 'system') {
        const chatDisplay = document.getElementById('chat-display');
        if (!chatDisplay) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message system-message ${type}`;
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        chatDisplay.appendChild(messageElement);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    processMessage(message) {
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate AI processing
        setTimeout(() => {
            this.hideTypingIndicator();
            
            const personality = this.personalities.get(this.currentPersonality);
            const response = this.generatePersonalityResponse(message, personality);
            
            this.addAIMessage(response);
        }, 1000 + Math.random() * 2000);
    }

    generatePersonalityResponse(message, personality) {
        // Simple personality-based response generation
        const responses = {
            'default': `Processing your request: "${message}". How else may I assist you?`,
            'hacker': `*types rapidly* Analyzing your query... "${message}". The matrix has answers.`,
            'warrior': `*battle stance* Your command "${message}" is acknowledged. Ready for action!`,
            'scientist': `*adjusts quantum goggles* Fascinating query: "${message}". Let me analyze the data.`,
            'artist': `*creative sparks fly* Your message "${message}" inspires new possibilities!`,
            'gamer': `*controller in hand* Nice move! "${message}" - let's level up this conversation!`
        };
        
        return responses[this.currentPersonality] || responses['default'];
    }

    addAIMessage(message) {
        const chatDisplay = document.getElementById('chat-display');
        if (!chatDisplay) return;
        
        const personality = this.personalities.get(this.currentPersonality);
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message ai-message';
        messageElement.innerHTML = `
            <div class="message-avatar">
                <div class="avatar-mini">
                    <span class="avatar-icon">${personality.icon}</span>
                </div>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${personality.name}</span>
                </div>
                <div class="message-text">${message}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        chatDisplay.appendChild(messageElement);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        
        // Animate avatar expression
        this.animateAvatarExpression();
    }

    showTypingIndicator() {
        // Implementation for typing indicator
        console.log('🤖 AI is thinking...');
    }

    hideTypingIndicator() {
        // Implementation for hiding typing indicator
        console.log('🤖 AI response ready');
    }

    animateAvatarExpression() {
        const mouth = document.getElementById('avatar-mouth');
        if (mouth) {
            mouth.style.animation = 'none';
            setTimeout(() => {
                mouth.style.animation = 'avatarTalk 0.5s ease-in-out';
            }, 10);
        }
    }

    startSystemAnimations() {
        // Animate system metrics
        setInterval(() => {
            this.updateSystemMetrics();
        }, 3000);
        
        // Animate neural network background
        this.animateNeuralNetwork();
    }

    updateSystemMetrics() {
        const metrics = ['cpu', 'memory', 'neural'];
        
        metrics.forEach(metric => {
            const variation = (Math.random() - 0.5) * 20;
            this.systemMetrics[metric] = Math.max(10, Math.min(90, this.systemMetrics[metric] + variation));
            
            const fillElement = document.querySelector(`.metric-item:nth-child(${metrics.indexOf(metric) + 1}) .metric-fill`);
            const valueElement = document.querySelector(`.metric-item:nth-child(${metrics.indexOf(metric) + 1}) .metric-value`);
            
            if (fillElement) {
                fillElement.style.width = `${this.systemMetrics[metric]}%`;
            }
            if (valueElement) {
                valueElement.textContent = `${Math.round(this.systemMetrics[metric])}%`;
            }
        });
    }

    animateNeuralNetwork() {
        // Add dynamic neural network animations
        const neuralNetwork = document.querySelector('.neural-network');
        if (neuralNetwork) {
            setInterval(() => {
                const intensity = Math.random();
                neuralNetwork.style.opacity = 0.2 + intensity * 0.3;
            }, 2000);
        }
    }

    hideLoader() {
        setTimeout(() => {
            const loader = document.getElementById('sci-fi-loader');
            if (loader) {
                loader.style.animation = 'fadeOut 1s ease-out forwards';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 1000);
            }
        }, 3000);
    }

    setupNeuralInput() {
        const textarea = document.getElementById('neural-input');
        if (textarea) {
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 150) + 'px';
            });
        }
    }

    // Public API methods
    getCurrentPersonality() {
        return this.currentPersonality;
    }

    getPersonalities() {
        return Array.from(this.personalities.keys());
    }

    activateModule(moduleType) {
        console.log(`🔧 Activating module: ${moduleType}`);
        
        // Update navigation state
        document.querySelectorAll('.nav-module').forEach(module => {
            module.classList.toggle('active', module.dataset.module === moduleType);
        });
        
        // Handle module-specific actions
        switch (moduleType) {
            case 'vision':
                this.openVisionAI();
                break;
            case 'code':
                this.openCodeLab();
                break;
            case 'data':
                this.openDataAnalysis();
                break;
            case 'multimodal':
                this.openMultimodal();
                break;
            case 'plugins':
                this.openPlugins();
                break;
            default:
                console.log(`Module ${moduleType} activated`);
        }
    }

    handleQuickAction(action) {
        console.log(`⚡ Quick action: ${action}`);
        this.activateModule(action);
    }

    toggleVoiceInput() {
        this.isVoiceActive = !this.isVoiceActive;
        const voiceIndicator = document.getElementById('voice-indicator');
        
        if (voiceIndicator) {
            voiceIndicator.classList.toggle('active', this.isVoiceActive);
        }
        
        console.log(`🎤 Voice input: ${this.isVoiceActive ? 'ON' : 'OFF'}`);
    }

    openFileDialog() {
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.click();
        }
    }

    openCameraInput() {
        console.log('📷 Opening camera input...');
        // Implementation for camera input
    }

    // Module opening methods
    openVisionAI() {
        console.log('👁️ Opening Vision AI module...');
    }

    openCodeLab() {
        console.log('💻 Opening Code Lab module...');
    }

    openDataAnalysis() {
        console.log('📊 Opening Data Analysis module...');
    }

    openMultimodal() {
        console.log('🎭 Opening Multimodal AI module...');
    }

    openPlugins() {
        console.log('🔌 Opening Plugins module...');
    }
}

// Initialize Sci-Fi Interface
document.addEventListener('DOMContentLoaded', () => {
    window.sciFiInterface = new SciFiInterface();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SciFiInterface;
}
