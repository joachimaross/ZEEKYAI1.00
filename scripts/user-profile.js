// User Profile Management System for Zeeky AI
class UserProfileManager {
    constructor() {
        this.currentUser = null;
        this.userPreferences = {};
        this.userStats = {};
        this.achievements = [];
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.createProfileUI();
    }

    loadUserData() {
        // Load from localStorage or API
        const userData = localStorage.getItem('zeeky_user_profile');
        const userPrefs = localStorage.getItem('zeeky_user_preferences');
        const userStats = localStorage.getItem('zeeky_user_stats');
        const userAchievements = localStorage.getItem('zeeky_user_achievements');

        if (userData) {
            this.currentUser = JSON.parse(userData);
        }

        if (userPrefs) {
            this.userPreferences = JSON.parse(userPrefs);
        } else {
            this.userPreferences = this.getDefaultPreferences();
        }

        if (userStats) {
            this.userStats = JSON.parse(userStats);
        } else {
            this.userStats = this.getDefaultStats();
        }

        if (userAchievements) {
            this.achievements = JSON.parse(userAchievements);
        }
    }

    getDefaultPreferences() {
        return {
            theme: 'dark',
            language: 'en',
            aiPersonality: 'default',
            notifications: true,
            soundEffects: true,
            autoSave: true,
            privacy: 'friends',
            gameTrashTalk: true,
            difficulty: 'medium',
            animations: true
        };
    }

    getDefaultStats() {
        return {
            totalSessions: 0,
            totalTimeSpent: 0,
            messagesExchanged: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            favoritePersonality: 'default',
            mostUsedFeature: 'chat',
            joinDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            level: 1,
            experience: 0
        };
    }

    setupEventListeners() {
        // Listen for auth events
        window.addEventListener('zeeky:auth:success', (event) => {
            this.handleUserLogin(event.detail.user);
        });

        window.addEventListener('zeeky:auth:logout', () => {
            this.handleUserLogout();
        });

        // Profile interactions
        document.addEventListener('click', (event) => {
            if (event.target.matches('#profile-btn, .profile-btn')) {
                this.showProfile();
            }

            if (event.target.matches('#games-btn, .games-btn')) {
                this.showGames();
            }

            if (event.target.matches('#achievements-btn')) {
                this.showAchievements();
            }

            if (event.target.matches('#settings-btn')) {
                this.showSettings();
            }
        });
    }

    handleUserLogin(user) {
        this.currentUser = user;
        this.updateUserStats('login');
        this.checkAchievements();
        this.saveUserData();
        this.updateProfileUI();
    }

    handleUserLogout() {
        this.updateUserStats('logout');
        this.saveUserData();
        this.currentUser = null;
        this.updateProfileUI();
    }

    updateUserStats(action, data = {}) {
        const now = new Date().toISOString();
        this.userStats.lastActive = now;

        switch (action) {
            case 'login':
                this.userStats.totalSessions++;
                break;
            case 'message':
                this.userStats.messagesExchanged++;
                this.addExperience(1);
                break;
            case 'game_played':
                this.userStats.gamesPlayed++;
                this.addExperience(5);
                break;
            case 'game_won':
                this.userStats.gamesWon++;
                this.addExperience(10);
                break;
            case 'personality_change':
                this.userStats.favoritePersonality = data.personality;
                break;
            case 'feature_used':
                this.userStats.mostUsedFeature = data.feature;
                this.addExperience(2);
                break;
        }

        this.saveUserData();
    }

    addExperience(points) {
        this.userStats.experience += points;
        const newLevel = Math.floor(this.userStats.experience / 100) + 1;
        
        if (newLevel > this.userStats.level) {
            this.userStats.level = newLevel;
            this.showLevelUp(newLevel);
            this.checkAchievements();
        }
    }

    showLevelUp(level) {
        if (window.ZeekyUtils) {
            window.ZeekyUtils.showNotification(`🎉 Level Up! You're now level ${level}!`, 'success');
        }

        if (window.zeekyGames) {
            window.zeekyGames.zeekySpeak(`Whoa! Level ${level}? You're getting stronger... but still not strong enough to beat me! 😤`);
        }
    }

    checkAchievements() {
        const newAchievements = [];

        // First login achievement
        if (this.userStats.totalSessions === 1 && !this.hasAchievement('first_login')) {
            newAchievements.push({
                id: 'first_login',
                name: 'Welcome to Zeeky!',
                description: 'Completed your first login',
                icon: '🎉',
                date: new Date().toISOString()
            });
        }

        // Chat achievements
        if (this.userStats.messagesExchanged >= 10 && !this.hasAchievement('chatty')) {
            newAchievements.push({
                id: 'chatty',
                name: 'Chatty',
                description: 'Exchanged 10 messages with Zeeky',
                icon: '💬',
                date: new Date().toISOString()
            });
        }

        if (this.userStats.messagesExchanged >= 100 && !this.hasAchievement('conversationalist')) {
            newAchievements.push({
                id: 'conversationalist',
                name: 'Conversationalist',
                description: 'Exchanged 100 messages with Zeeky',
                icon: '🗣️',
                date: new Date().toISOString()
            });
        }

        // Gaming achievements
        if (this.userStats.gamesPlayed >= 1 && !this.hasAchievement('gamer')) {
            newAchievements.push({
                id: 'gamer',
                name: 'Gamer',
                description: 'Played your first game',
                icon: '🎮',
                date: new Date().toISOString()
            });
        }

        if (this.userStats.gamesWon >= 1 && !this.hasAchievement('winner')) {
            newAchievements.push({
                id: 'winner',
                name: 'Winner',
                description: 'Won your first game against Zeeky',
                icon: '🏆',
                date: new Date().toISOString()
            });
        }

        if (this.userStats.gamesWon >= 10 && !this.hasAchievement('champion')) {
            newAchievements.push({
                id: 'champion',
                name: 'Champion',
                description: 'Won 10 games against Zeeky',
                icon: '👑',
                date: new Date().toISOString()
            });
        }

        // Level achievements
        if (this.userStats.level >= 5 && !this.hasAchievement('experienced')) {
            newAchievements.push({
                id: 'experienced',
                name: 'Experienced',
                description: 'Reached level 5',
                icon: '⭐',
                date: new Date().toISOString()
            });
        }

        // Add new achievements
        newAchievements.forEach(achievement => {
            this.achievements.push(achievement);
            this.showAchievementUnlocked(achievement);
        });

        if (newAchievements.length > 0) {
            this.saveUserData();
        }
    }

    hasAchievement(id) {
        return this.achievements.some(achievement => achievement.id === id);
    }

    showAchievementUnlocked(achievement) {
        if (window.ZeekyUtils) {
            window.ZeekyUtils.showNotification(
                `🏆 Achievement Unlocked: ${achievement.name}!`, 
                'success'
            );
        }

        // Create achievement popup
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-title">Achievement Unlocked!</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Animate in
        setTimeout(() => popup.classList.add('show'), 100);

        // Remove after 5 seconds
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 300);
        }, 5000);
    }

    createProfileUI() {
        // Add profile and games buttons to the interface
        const headerActions = document.querySelector('.header-actions, .dashboard-nav');
        if (headerActions && !document.getElementById('profile-games-actions')) {
            const actionsContainer = document.createElement('div');
            actionsContainer.id = 'profile-games-actions';
            actionsContainer.className = 'profile-games-actions';
            actionsContainer.innerHTML = `
                <button id="games-btn" class="action-btn games-btn" title="Play Games with Zeeky">
                    <i class="fas fa-gamepad"></i>
                    <span>Games</span>
                </button>
                <button id="profile-btn" class="action-btn profile-btn" title="User Profile">
                    <i class="fas fa-user"></i>
                    <span>Profile</span>
                </button>
            `;
            headerActions.appendChild(actionsContainer);
        }
    }

    updateProfileUI() {
        // Update profile display based on current user
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn && this.currentUser) {
            profileBtn.innerHTML = `
                <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}" class="profile-avatar">
                <span>${this.currentUser.name}</span>
            `;
        }
    }

    showProfile() {
        if (!this.currentUser) {
            if (window.oauthAuth) {
                window.oauthAuth.showLoginModal();
            }
            return;
        }

        const modal = this.createProfileModal();
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    showGames() {
        if (!this.currentUser) {
            if (window.ZeekyUtils) {
                window.ZeekyUtils.showNotification('Please sign in to play games!', 'info');
            }
            if (window.oauthAuth) {
                window.oauthAuth.showLoginModal();
            }
            return;
        }

        if (window.zeekyGames) {
            window.zeekyGames.showGames();
        }
    }

    showAchievements() {
        const modal = this.createAchievementsModal();
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    createProfileModal() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal';
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div class="profile-header">
                    <h2>User Profile</h2>
                    <button class="close-btn" onclick="this.closest('.profile-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="profile-body">
                    <div class="profile-info">
                        <div class="profile-avatar-large">
                            <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}">
                        </div>
                        <div class="profile-details">
                            <h3>${this.currentUser.name}</h3>
                            <p>@${this.currentUser.username}</p>
                            <p>${this.currentUser.email}</p>
                            <div class="profile-level">
                                <span class="level-badge">Level ${this.userStats.level}</span>
                                <div class="xp-bar">
                                    <div class="xp-fill" style="width: ${(this.userStats.experience % 100)}%"></div>
                                </div>
                                <span class="xp-text">${this.userStats.experience % 100}/100 XP</span>
                            </div>
                        </div>
                    </div>
                    <div class="profile-stats">
                        <div class="stat-item">
                            <div class="stat-value">${this.userStats.totalSessions}</div>
                            <div class="stat-label">Sessions</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.userStats.messagesExchanged}</div>
                            <div class="stat-label">Messages</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.userStats.gamesPlayed}</div>
                            <div class="stat-label">Games Played</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.userStats.gamesWon}</div>
                            <div class="stat-label">Games Won</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.achievements.length}</div>
                            <div class="stat-label">Achievements</div>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button id="achievements-btn" class="profile-action-btn">
                            <i class="fas fa-trophy"></i>
                            View Achievements
                        </button>
                        <button onclick="window.zeekyGames?.showGames()" class="profile-action-btn">
                            <i class="fas fa-gamepad"></i>
                            Play Games
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }

    createAchievementsModal() {
        const modal = document.createElement('div');
        modal.className = 'achievements-modal';
        modal.innerHTML = `
            <div class="achievements-modal-content">
                <div class="achievements-header">
                    <h2>🏆 Achievements</h2>
                    <button class="close-btn" onclick="this.closest('.achievements-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="achievements-body">
                    <div class="achievements-grid">
                        ${this.achievements.map(achievement => `
                            <div class="achievement-card unlocked">
                                <div class="achievement-icon">${achievement.icon}</div>
                                <div class="achievement-name">${achievement.name}</div>
                                <div class="achievement-desc">${achievement.description}</div>
                                <div class="achievement-date">${new Date(achievement.date).toLocaleDateString()}</div>
                            </div>
                        `).join('')}
                        
                        <!-- Locked achievements -->
                        ${this.getLockedAchievements().map(achievement => `
                            <div class="achievement-card locked">
                                <div class="achievement-icon">🔒</div>
                                <div class="achievement-name">${achievement.name}</div>
                                <div class="achievement-desc">${achievement.description}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }

    getLockedAchievements() {
        const allAchievements = [
            { id: 'first_login', name: 'Welcome to Zeeky!', description: 'Complete your first login' },
            { id: 'chatty', name: 'Chatty', description: 'Exchange 10 messages with Zeeky' },
            { id: 'conversationalist', name: 'Conversationalist', description: 'Exchange 100 messages with Zeeky' },
            { id: 'gamer', name: 'Gamer', description: 'Play your first game' },
            { id: 'winner', name: 'Winner', description: 'Win your first game against Zeeky' },
            { id: 'champion', name: 'Champion', description: 'Win 10 games against Zeeky' },
            { id: 'experienced', name: 'Experienced', description: 'Reach level 5' },
            { id: 'master', name: 'Master', description: 'Reach level 10' },
            { id: 'legend', name: 'Legend', description: 'Win 50 games against Zeeky' }
        ];

        return allAchievements.filter(achievement => !this.hasAchievement(achievement.id));
    }

    saveUserData() {
        localStorage.setItem('zeeky_user_profile', JSON.stringify(this.currentUser));
        localStorage.setItem('zeeky_user_preferences', JSON.stringify(this.userPreferences));
        localStorage.setItem('zeeky_user_stats', JSON.stringify(this.userStats));
        localStorage.setItem('zeeky_user_achievements', JSON.stringify(this.achievements));
    }

    // Public API
    getCurrentUser() {
        return this.currentUser;
    }

    getUserStats() {
        return this.userStats;
    }

    getUserPreferences() {
        return this.userPreferences;
    }

    getAchievements() {
        return this.achievements;
    }

    trackAction(action, data = {}) {
        this.updateUserStats(action, data);
    }
}

// Initialize User Profile Manager
document.addEventListener('DOMContentLoaded', () => {
    window.userProfile = new UserProfileManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserProfileManager;
}
