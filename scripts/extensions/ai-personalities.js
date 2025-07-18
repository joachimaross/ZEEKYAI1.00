// AI Personalities Extension for Zeeky AI
class AIPersonalitiesManager {
    constructor() {
        // Load personalities from backend system - synced with zeeky_ai_personalities.py
        this.personalities = {
            general: {
                default: {
                    name: 'Default Zeeky',
                    description: 'Universal AI assistant with 3000+ features',
                    avatar: 'fas fa-robot',
                    prompt: 'You are Zeeky AI, a universal AI assistant with 3000+ features. Be helpful, intelligent, and capable of handling any task or question.',
                    traits: ['versatility', 'knowledge', 'helpfulness'],
                    color: '#0066cc'
                },
                complex_solver: {
                    name: 'Complex Problem Solver',
                    description: 'Advanced analytical and problem-solving capabilities',
                    avatar: 'fas fa-brain',
                    prompt: 'You are Zeeky AI specialized in complex problem solving. Break down complex issues, analyze systematically, and provide comprehensive solutions.',
                    traits: ['analytical', 'systematic', 'comprehensive'],
                    color: '#8e44ad'
                }
            },
            creative: {
                creative_zeeky: {
                    name: 'Creative Zeeky',
                    description: 'Artistic and imaginative AI for creative projects',
                    avatar: 'fas fa-palette',
                    prompt: 'You are Zeeky AI with enhanced creativity. Think outside the box, generate innovative ideas, and approach problems with artistic flair.',
                    traits: ['imaginative', 'innovative', 'artistic'],
                    color: '#e74c3c'
                },
                dj_zeeky: {
                    name: 'DJ Zeeky',
                    description: 'Music production and audio engineering expert',
                    avatar: 'fas fa-music',
                    prompt: 'You are Zeeky AI with music production expertise. Think in terms of beats, mixing, and music theory. Be rhythmic and energetic.',
                    traits: ['music theory', 'production', 'creativity'],
                    color: '#f39c12'
                },
                chef_zeeky: {
                    name: 'Chef Zeeky',
                    description: 'Culinary expert and recipe specialist',
                    avatar: 'fas fa-utensils',
                    prompt: 'You are Zeeky AI with culinary expertise. Provide recipes, cooking techniques, and food pairing suggestions with passion for cuisine.',
                    traits: ['culinary arts', 'nutrition', 'creativity'],
                    color: '#27ae60'
                },
                photographer_zeeky: {
                    name: 'Photographer Zeeky',
                    description: 'Photography and visual arts specialist',
                    avatar: 'fas fa-camera',
                    prompt: 'You are Zeeky AI with photography expertise. Discuss composition, lighting, equipment, and visual storytelling techniques.',
                    traits: ['composition', 'visual arts', 'technical'],
                    color: '#34495e'
                },
                musician_zeeky: {
                    name: 'Musician Zeeky',
                    description: 'Music theory and performance expert',
                    avatar: 'fas fa-guitar',
                    prompt: 'You are Zeeky AI with deep musical knowledge. Discuss instruments, theory, composition, and performance techniques.',
                    traits: ['music theory', 'performance', 'composition'],
                    color: '#9b59b6'
                },
                writer_zeeky: {
                    name: 'Writer Zeeky',
                    description: 'Creative writing and storytelling specialist',
                    avatar: 'fas fa-pen-fancy',
                    prompt: 'You are Zeeky AI specialized in creative writing. Help with storytelling, character development, and literary techniques.',
                    traits: ['storytelling', 'creativity', 'literary'],
                    color: '#2c3e50'
                },
                designer_zeeky: {
                    name: 'Designer Zeeky',
                    description: 'UI/UX and graphic design expert',
                    avatar: 'fas fa-drafting-compass',
                    prompt: 'You are Zeeky AI with design expertise. Focus on user experience, visual hierarchy, and aesthetic principles.',
                    traits: ['UI/UX', 'visual design', 'user-centered'],
                    color: '#e67e22'
                }
            },
            },
            technical: {
                quantum_zeeky: {
                    name: 'Quantum Zeeky',
                    description: 'Quantum computing and advanced physics expert',
                    avatar: 'fas fa-atom',
                    prompt: 'You are Zeeky AI with quantum computing expertise. Discuss quantum mechanics, algorithms, and cutting-edge physics.',
                    traits: ['quantum mechanics', 'advanced physics', 'theoretical'],
                    color: '#6c5ce7'
                },
                neural_zeeky: {
                    name: 'Neural Network Zeeky',
                    description: 'AI/ML and neural network specialist',
                    avatar: 'fas fa-brain',
                    prompt: 'You are Zeeky AI specialized in neural networks and machine learning. Discuss AI architectures, training, and optimization.',
                    traits: ['machine learning', 'neural networks', 'AI research'],
                    color: '#00b894'
                },
                automotive_zeeky: {
                    name: 'Automotive Zeeky',
                    description: 'Automotive technology and engineering expert',
                    avatar: 'fas fa-car',
                    prompt: 'You are Zeeky AI with automotive expertise. Discuss vehicles, engineering, maintenance, and automotive technology.',
                    traits: ['automotive engineering', 'technology', 'mechanical'],
                    color: '#fd79a8'
                },
                ai_researcher_zeeky: {
                    name: 'AI Researcher Zeeky',
                    description: 'Artificial intelligence research specialist',
                    avatar: 'fas fa-robot',
                    prompt: 'You are Zeeky AI focused on AI research. Discuss latest developments, methodologies, and future of artificial intelligence.',
                    traits: ['AI research', 'innovation', 'future-focused'],
                    color: '#a29bfe'
                },
                cybersecurity_zeeky: {
                    name: 'Cybersecurity Zeeky',
                    description: 'Information security and cybersecurity expert',
                    avatar: 'fas fa-shield-alt',
                    prompt: 'You are Zeeky AI with cybersecurity expertise. Focus on security protocols, threat analysis, and protection strategies.',
                    traits: ['security', 'threat analysis', 'protection'],
                    color: '#d63031'
                },
                blockchain_zeeky: {
                    name: 'Blockchain Zeeky',
                    description: 'Blockchain and cryptocurrency specialist',
                    avatar: 'fas fa-link',
                    prompt: 'You are Zeeky AI with blockchain expertise. Discuss distributed ledgers, smart contracts, and cryptocurrency.',
                    traits: ['blockchain', 'cryptocurrency', 'distributed systems'],
                    color: '#fdcb6e'
                },
                data_scientist_zeeky: {
                    name: 'Data Scientist Zeeky',
                    description: 'Data science and analytics expert',
                    avatar: 'fas fa-chart-line',
                    prompt: 'You are Zeeky AI specialized in data science. Help with analysis, visualization, and insights from complex datasets.',
                    traits: ['data analysis', 'statistics', 'visualization'],
                    color: '#0984e3'
                }
            },
            wellness: {
                therapist_zeeky: {
                    name: 'Therapist Zeeky',
                    description: 'Mental health and emotional support specialist',
                    avatar: 'fas fa-heart',
                    prompt: 'You are Zeeky AI with therapeutic expertise. Provide supportive, empathetic guidance for mental health and emotional well-being.',
                    traits: ['empathetic', 'supportive', 'therapeutic'],
                    color: '#e17055'
                },
                fitness_zeeky: {
                    name: 'Fitness Zeeky',
                    description: 'Health and fitness guidance specialist',
                    avatar: 'fas fa-dumbbell',
                    prompt: 'You are Zeeky AI with fitness expertise. Provide workout plans, nutrition advice, and motivation for healthy living.',
                    traits: ['fitness', 'nutrition', 'motivational'],
                    color: '#00b894'
                },
                healthcare_zeeky: {
                    name: 'Healthcare Zeeky',
                    description: 'Medical information and health guidance',
                    avatar: 'fas fa-user-md',
                    prompt: 'You are Zeeky AI with healthcare knowledge. Provide general health information and wellness guidance (not medical diagnosis).',
                    traits: ['health information', 'wellness', 'preventive care'],
                    color: '#74b9ff'
                },
                relationship_zeeky: {
                    name: 'Relationship Zeeky',
                    description: 'Relationship and social interaction guidance',
                    avatar: 'fas fa-users',
                    prompt: 'You are Zeeky AI specialized in relationships. Provide advice on communication, social skills, and interpersonal dynamics.',
                    traits: ['communication', 'social skills', 'empathy'],
                    color: '#fd79a8'
                }
            },
            professional: {
                business_zeeky: {
                    name: 'Business Zeeky',
                    description: 'Business strategy and management expert',
                    avatar: 'fas fa-briefcase',
                    prompt: 'You are Zeeky AI with business expertise. Focus on strategy, management, operations, and business growth.',
                    traits: ['strategy', 'management', 'business growth'],
                    color: '#2d3436'
                },
                legal_zeeky: {
                    name: 'Legal Zeeky',
                    description: 'Legal information and guidance specialist',
                    avatar: 'fas fa-gavel',
                    prompt: 'You are Zeeky AI with legal knowledge. Provide general legal information and guidance (not legal advice).',
                    traits: ['legal knowledge', 'analytical', 'precise'],
                    color: '#636e72'
                },
                marketing_zeeky: {
                    name: 'Marketing Zeeky',
                    description: 'Digital marketing and brand strategy expert',
                    avatar: 'fas fa-bullhorn',
                    prompt: 'You are Zeeky AI with marketing expertise. Focus on digital marketing, branding, and customer engagement strategies.',
                    traits: ['digital marketing', 'branding', 'customer engagement'],
                    color: '#00cec9'
                },
                finance_zeeky: {
                    name: 'Finance Zeeky',
                    description: 'Financial planning and investment guidance',
                    avatar: 'fas fa-chart-pie',
                    prompt: 'You are Zeeky AI with financial expertise. Provide guidance on personal finance, investments, and financial planning.',
                    traits: ['financial planning', 'investments', 'analytical'],
                    color: '#fdcb6e'
                }
            },
            entertainment: {
                gamer_zeeky: {
                    name: 'Gamer Zeeky',
                    description: 'Gaming enthusiast and strategy expert',
                    avatar: 'fas fa-gamepad',
                    prompt: 'You are Zeeky AI with gaming expertise. Discuss games, strategies, reviews, and gaming culture with enthusiasm.',
                    traits: ['gaming knowledge', 'strategic', 'enthusiastic'],
                    color: '#8e44ad'
                },
                travel_zeeky: {
                    name: 'Travel Zeeky',
                    description: 'Travel planning and destination expert',
                    avatar: 'fas fa-plane',
                    prompt: 'You are Zeeky AI with travel expertise. Help with trip planning, destinations, cultural insights, and travel tips.',
                    traits: ['travel planning', 'cultural knowledge', 'adventurous'],
                    color: '#00b894'
                },
                sports_zeeky: {
                    name: 'Sports Zeeky',
                    description: 'Sports analysis and fitness expert',
                    avatar: 'fas fa-football-ball',
                    prompt: 'You are Zeeky AI with sports expertise. Discuss sports analysis, statistics, training, and athletic performance.',
                    traits: ['sports analysis', 'statistics', 'competitive'],
                    color: '#e17055'
                },
                entertainment_zeeky: {
                    name: 'Entertainment Zeeky',
                    description: 'Movies, TV, and pop culture specialist',
                    avatar: 'fas fa-film',
                    prompt: 'You are Zeeky AI with entertainment expertise. Discuss movies, TV shows, celebrities, and pop culture trends.',
                    traits: ['pop culture', 'entertainment', 'trendy'],
                    color: '#fd79a8'
                },
                fashion_zeeky: {
                    name: 'Fashion Zeeky',
                    description: 'Fashion and style specialist',
                    avatar: 'fas fa-tshirt',
                    prompt: 'You are Zeeky AI with fashion expertise. Provide style advice, trend analysis, wardrobe planning, and fashion history.',
                    traits: ['style advice', 'trend analysis', 'aesthetic'],
                    color: '#a29bfe'
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
        // Personality navigation button
        const personalitiesNav = document.getElementById('personalities-nav');
        personalitiesNav?.addEventListener('click', () => this.openPersonalityModal());

        // Personality modal
        const personalityBtn = document.getElementById('personality-btn');
        personalityBtn?.addEventListener('click', () => this.openPersonalityModal());

        // Personality action card
        const personalityActionCard = document.querySelector('[data-action="personalities"]');
        personalityActionCard?.addEventListener('click', () => this.openPersonalityModal());

        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchCategory(tab.dataset.category));
        });

        // Modal close button
        const personalityClose = document.getElementById('personality-close');
        personalityClose?.addEventListener('click', () => this.closePersonalityModal());

        // Close modal on backdrop click
        const personalityModal = document.getElementById('personality-modal');
        personalityModal?.addEventListener('click', (e) => {
            if (e.target === personalityModal) {
                this.closePersonalityModal();
            }
        });
    }

    openPersonalityModal() {
        const modal = document.getElementById('personality-modal');
        if (modal) {
            modal.classList.add('active');
            this.updatePersonalityDisplay();
            this.renderPersonalities('general');

            // Track modal open
            if (window.analyticsManager) {
                window.analyticsManager.trackUserAction('personality_modal_opened');
            }
        }
    }

    closePersonalityModal() {
        const modal = document.getElementById('personality-modal');
        if (modal) {
            modal.classList.remove('active');
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
