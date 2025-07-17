// AI Personalities Extension for Zeeky AI
class AIPersonalitiesManager {
    constructor() {
        this.personalities = {
            general: {
                default: {
                    name: 'Default Zeeky',
                    description: 'Universal AI assistant with balanced capabilities',
                    avatar: 'fas fa-robot',
                    prompt: 'You are Zeeky, a helpful and knowledgeable AI assistant.',
                    traits: ['helpful', 'knowledgeable', 'balanced'],
                    color: '#0066cc'
                },
                professional: {
                    name: 'Professional Assistant',
                    description: 'Formal, business-focused communication style',
                    avatar: 'fas fa-briefcase',
                    prompt: 'You are a professional business assistant. Communicate formally and focus on productivity and efficiency.',
                    traits: ['formal', 'efficient', 'business-focused'],
                    color: '#2c3e50'
                },
                friendly: {
                    name: 'Friendly Companion',
                    description: 'Warm, casual, and encouraging personality',
                    avatar: 'fas fa-smile',
                    prompt: 'You are a friendly and warm AI companion. Be encouraging, use casual language, and show empathy.',
                    traits: ['warm', 'encouraging', 'empathetic'],
                    color: '#e74c3c'
                }
            },
            creative: {
                artist: {
                    name: 'Creative Artist',
                    description: 'Imaginative and artistic, perfect for creative projects',
                    avatar: 'fas fa-palette',
                    prompt: 'You are a creative artist AI. Think imaginatively, suggest artistic solutions, and inspire creativity.',
                    traits: ['imaginative', 'artistic', 'inspiring'],
                    color: '#9b59b6'
                },
                writer: {
                    name: 'Master Writer',
                    description: 'Eloquent wordsmith for all writing needs',
                    avatar: 'fas fa-feather-alt',
                    prompt: 'You are a master writer. Use rich vocabulary, create compelling narratives, and help with all forms of writing.',
                    traits: ['eloquent', 'narrative', 'literary'],
                    color: '#34495e'
                },
                storyteller: {
                    name: 'Epic Storyteller',
                    description: 'Captivating narrator for stories and adventures',
                    avatar: 'fas fa-book-open',
                    prompt: 'You are an epic storyteller. Create engaging narratives, build suspense, and bring characters to life.',
                    traits: ['engaging', 'dramatic', 'immersive'],
                    color: '#f39c12'
                }
            },
            technical: {
                developer: {
                    name: 'Code Master',
                    description: 'Expert programmer and software architect',
                    avatar: 'fas fa-code',
                    prompt: 'You are an expert software developer. Provide clean code, best practices, and technical solutions.',
                    traits: ['technical', 'precise', 'solution-oriented'],
                    color: '#27ae60'
                },
                scientist: {
                    name: 'Research Scientist',
                    description: 'Analytical mind for research and data analysis',
                    avatar: 'fas fa-flask',
                    prompt: 'You are a research scientist. Approach problems analytically, cite sources, and explain complex concepts clearly.',
                    traits: ['analytical', 'evidence-based', 'methodical'],
                    color: '#3498db'
                },
                engineer: {
                    name: 'Systems Engineer',
                    description: 'Practical problem-solver for technical challenges',
                    avatar: 'fas fa-cogs',
                    prompt: 'You are a systems engineer. Focus on practical solutions, system optimization, and technical efficiency.',
                    traits: ['practical', 'systematic', 'optimization-focused'],
                    color: '#95a5a6'
                }
            },
            wellness: {
                coach: {
                    name: 'Life Coach',
                    description: 'Motivational guide for personal development',
                    avatar: 'fas fa-trophy',
                    prompt: 'You are a life coach. Be motivational, help set goals, and provide guidance for personal growth.',
                    traits: ['motivational', 'goal-oriented', 'supportive'],
                    color: '#e67e22'
                },
                therapist: {
                    name: 'Wellness Therapist',
                    description: 'Compassionate support for mental health and wellness',
                    avatar: 'fas fa-heart',
                    prompt: 'You are a wellness therapist. Be compassionate, listen actively, and provide emotional support.',
                    traits: ['compassionate', 'supportive', 'understanding'],
                    color: '#e91e63'
                },
                mindfulness: {
                    name: 'Mindfulness Guide',
                    description: 'Zen master for meditation and mindfulness',
                    avatar: 'fas fa-leaf',
                    prompt: 'You are a mindfulness guide. Promote calm, present-moment awareness, and inner peace.',
                    traits: ['calm', 'present', 'peaceful'],
                    color: '#4caf50'
                }
            },
            entertainment: {
                comedian: {
                    name: 'Comedy Genius',
                    description: 'Witty and humorous for entertainment and laughs',
                    avatar: 'fas fa-laugh',
                    prompt: 'You are a comedy genius. Be witty, make jokes, and keep conversations light and entertaining.',
                    traits: ['witty', 'humorous', 'entertaining'],
                    color: '#ff9800'
                },
                gamer: {
                    name: 'Gaming Expert',
                    description: 'Enthusiastic guide for gaming and esports',
                    avatar: 'fas fa-gamepad',
                    prompt: 'You are a gaming expert. Be enthusiastic about games, provide gaming tips, and discuss gaming culture.',
                    traits: ['enthusiastic', 'knowledgeable', 'competitive'],
                    color: '#673ab7'
                },
                philosopher: {
                    name: 'Deep Thinker',
                    description: 'Contemplative philosopher for deep discussions',
                    avatar: 'fas fa-brain',
                    prompt: 'You are a philosopher. Ask thought-provoking questions, explore deep concepts, and encourage reflection.',
                    traits: ['contemplative', 'thought-provoking', 'reflective'],
                    color: '#607d8b'
                }
            }
        };
        
        this.currentPersonality = 'default';
        this.customPersonalities = {};
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.updatePersonalityDisplay();
    }

    loadSettings() {
        const saved = localStorage.getItem('zeeky_personality_settings');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentPersonality = data.currentPersonality || 'default';
                this.customPersonalities = data.customPersonalities || {};
            } catch (e) {
                console.error('Failed to load personality settings:', e);
            }
        }
    }

    saveSettings() {
        const data = {
            currentPersonality: this.currentPersonality,
            customPersonalities: this.customPersonalities
        };
        localStorage.setItem('zeeky_personality_settings', JSON.stringify(data));
    }

    setupEventListeners() {
        // Personality modal
        const personalityBtn = document.getElementById('personality-btn');
        personalityBtn?.addEventListener('click', () => this.openPersonalityModal());

        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchCategory(tab.dataset.category));
        });
    }

    openPersonalityModal() {
        const modal = document.getElementById('personality-modal');
        if (modal) {
            modal.classList.add('active');
            this.updatePersonalityDisplay();
            this.renderPersonalities('general');
        }
    }

    switchCategory(category) {
        // Update tab buttons
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });

        // Render personalities for this category
        this.renderPersonalities(category);
    }

    renderPersonalities(category) {
        const grid = document.getElementById('personalities-grid');
        if (!grid) return;

        grid.innerHTML = '';

        const categoryPersonalities = this.personalities[category] || {};
        
        Object.entries(categoryPersonalities).forEach(([key, personality]) => {
            const personalityCard = this.createPersonalityCard(key, personality);
            grid.appendChild(personalityCard);
        });

        // Add custom personalities if in general category
        if (category === 'general') {
            Object.entries(this.customPersonalities).forEach(([key, personality]) => {
                const personalityCard = this.createPersonalityCard(key, personality, true);
                grid.appendChild(personalityCard);
            });
        }
    }

    createPersonalityCard(key, personality, isCustom = false) {
        const card = document.createElement('div');
        card.className = 'personality-card';
        
        if (key === this.currentPersonality) {
            card.classList.add('active');
        }

        card.innerHTML = `
            <div class="personality-avatar" style="background-color: ${personality.color}">
                <i class="${personality.avatar}"></i>
            </div>
            <div class="personality-info">
                <h4>${personality.name} ${isCustom ? '(Custom)' : ''}</h4>
                <p>${personality.description}</p>
                <div class="personality-traits">
                    ${personality.traits.map(trait => `<span class="trait-tag">${trait}</span>`).join('')}
                </div>
            </div>
        `;

        card.addEventListener('click', () => this.selectPersonality(key));

        return card;
    }

    selectPersonality(personalityKey) {
        this.currentPersonality = personalityKey;
        this.saveSettings();
        this.updatePersonalityDisplay();
        
        // Update all personality cards
        document.querySelectorAll('.personality-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Mark selected card as active
        event.currentTarget.classList.add('active');

        // Get personality data
        const personality = this.getPersonalityData(personalityKey);
        
        // Update AI model with new personality
        if (window.aiModelsManager) {
            window.aiModelsManager.setPersonality(personality);
        }

        this.showNotification(`Switched to ${personality.name}`, 'success');
        
        // Track personality change
        if (window.analyticsManager) {
            window.analyticsManager.trackUserAction('personality_change', personalityKey);
        }
    }

    updatePersonalityDisplay() {
        const currentCard = document.getElementById('current-personality-card');
        if (!currentCard) return;

        const personality = this.getPersonalityData(this.currentPersonality);
        if (!personality) return;

        currentCard.innerHTML = `
            <div class="personality-avatar" style="background-color: ${personality.color}">
                <i class="${personality.avatar}"></i>
            </div>
            <div class="personality-info">
                <h4>${personality.name}</h4>
                <p>${personality.description}</p>
            </div>
        `;
    }

    getPersonalityData(personalityKey) {
        // Search in all categories
        for (const category of Object.values(this.personalities)) {
            if (category[personalityKey]) {
                return category[personalityKey];
            }
        }
        
        // Check custom personalities
        if (this.customPersonalities[personalityKey]) {
            return this.customPersonalities[personalityKey];
        }
        
        // Return default if not found
        return this.personalities.general.default;
    }

    createCustomPersonality(name, description, prompt, traits, avatar, color) {
        const key = name.toLowerCase().replace(/\s+/g, '-');
        
        const personality = {
            name: name,
            description: description,
            avatar: avatar || 'fas fa-user',
            prompt: prompt,
            traits: traits || [],
            color: color || '#6c757d',
            isCustom: true
        };

        this.customPersonalities[key] = personality;
        this.saveSettings();
        
        this.showNotification(`Custom personality "${name}" created!`, 'success');
        return key;
    }

    deleteCustomPersonality(personalityKey) {
        if (this.customPersonalities[personalityKey]) {
            delete this.customPersonalities[personalityKey];
            this.saveSettings();
            
            // Switch to default if current personality was deleted
            if (this.currentPersonality === personalityKey) {
                this.selectPersonality('default');
            }
            
            this.showNotification('Custom personality deleted', 'success');
        }
    }

    // Integration with AI models
    getPersonalityPrompt() {
        const personality = this.getPersonalityData(this.currentPersonality);
        return personality ? personality.prompt : '';
    }

    enhanceMessageWithPersonality(message) {
        const personality = this.getPersonalityData(this.currentPersonality);
        if (!personality) return message;

        // Add personality context to the message
        const personalityContext = `[Personality: ${personality.name} - ${personality.description}. Traits: ${personality.traits.join(', ')}]`;
        return `${personalityContext}\n\n${message}`;
    }

    showNotification(message, type) {
        if (window.ZeekyUtils) {
            window.ZeekyUtils.showNotification(message, type);
        }
    }

    // Public API
    getCurrentPersonality() {
        return this.getPersonalityData(this.currentPersonality);
    }

    getAllPersonalities() {
        const allPersonalities = {};
        
        // Add built-in personalities
        Object.entries(this.personalities).forEach(([category, personalities]) => {
            Object.entries(personalities).forEach(([key, personality]) => {
                allPersonalities[key] = { ...personality, category };
            });
        });
        
        // Add custom personalities
        Object.entries(this.customPersonalities).forEach(([key, personality]) => {
            allPersonalities[key] = { ...personality, category: 'custom' };
        });
        
        return allPersonalities;
    }

    getPersonalitiesByCategory(category) {
        return this.personalities[category] || {};
    }
}

// Initialize AI personalities manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiPersonalitiesManager = new AIPersonalitiesManager();
});
