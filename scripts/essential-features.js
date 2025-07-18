// Essential Features System for Zeeky AI
// Implements must-have modern app features

class EssentialFeaturesManager {
    constructor() {
        this.features = {
            notifications: null,
            search: null,
            shortcuts: null,
            offline: null,
            sharing: null,
            export: null,
            import: null,
            backup: null,
            sync: null,
            accessibility: null
        };
        this.init();
    }

    init() {
        this.initNotifications();
        this.initSearch();
        this.initKeyboardShortcuts();
        this.initOfflineSupport();
        this.initSharingFeatures();
        this.initDataFeatures();
        this.initAccessibilityFeatures();
        this.createFeaturesUI();
        console.log('✨ Essential Features loaded - Modern app experience ready!');
    }

    // Push Notifications
    initNotifications() {
        this.features.notifications = {
            permission: 'default',
            enabled: false,
            queue: []
        };

        if ('Notification' in window) {
            this.features.notifications.permission = Notification.permission;
            
            if (Notification.permission === 'granted') {
                this.features.notifications.enabled = true;
            }
        }

        // Service Worker for notifications
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('Service Worker registered:', registration);
            }).catch(error => {
                console.log('Service Worker registration failed:', error);
            });
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.features.notifications.permission = permission;
            this.features.notifications.enabled = permission === 'granted';
            
            if (permission === 'granted') {
                this.showNotification('Notifications enabled!', 'You\'ll now receive updates from Zeeky AI');
            }
            
            return permission;
        }
        return 'denied';
    }

    showNotification(title, body, options = {}) {
        if (!this.features.notifications.enabled) {
            console.log('Notification:', title, body);
            return;
        }

        const notification = new Notification(title, {
            body,
            icon: '/assets/zeeky-logo.svg',
            badge: '/assets/zeeky-logo.svg',
            tag: 'zeeky-notification',
            requireInteraction: false,
            ...options
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    }

    // Global Search
    initSearch() {
        this.features.search = {
            index: new Map(),
            results: [],
            isOpen: false
        };

        // Build search index
        this.buildSearchIndex();
        
        // Create search UI
        this.createSearchUI();
    }

    buildSearchIndex() {
        const searchableContent = [
            // AI Personalities
            ...Object.entries(window.aiPersonalitiesManager?.personalities || {}).flatMap(([category, personalities]) =>
                Object.entries(personalities).map(([key, personality]) => ({
                    type: 'personality',
                    title: personality.name,
                    description: personality.description,
                    category: category,
                    keywords: [personality.name, category, ...personality.traits],
                    action: () => window.aiPersonalitiesManager?.switchPersonality(key)
                }))
            ),
            
            // Features
            { type: 'feature', title: 'Games', description: 'Play games with Zeeky', keywords: ['games', 'play', 'fun'], action: () => window.zeekyGames?.showGames() },
            { type: 'feature', title: 'Profile', description: 'View your profile', keywords: ['profile', 'user', 'stats'], action: () => window.userProfile?.showProfile() },
            { type: 'feature', title: 'Settings', description: 'App settings', keywords: ['settings', 'preferences'], action: () => window.universalSettings?.showSettings() },
            { type: 'feature', title: 'Code Lab', description: 'Code execution environment', keywords: ['code', 'programming', 'lab'], action: () => window.codeLaboratory?.show() },
            { type: 'feature', title: 'Vision AI', description: 'Image analysis and generation', keywords: ['vision', 'image', 'ai'], action: () => window.visionAI?.show() },
            
            // Pages
            { type: 'page', title: 'Smart Home', description: 'Control smart home devices', keywords: ['smart', 'home', 'iot'], action: () => window.location.href = 'smart-home.html' },
            { type: 'page', title: 'Car Mode', description: 'Voice-optimized car interface', keywords: ['car', 'driving', 'voice'], action: () => window.location.href = 'car-mode.html' },
            { type: 'page', title: 'Testing Dashboard', description: 'System testing and diagnostics', keywords: ['test', 'debug', 'diagnostics'], action: () => window.location.href = 'testing-dashboard.html' }
        ];

        searchableContent.forEach((item, index) => {
            this.features.search.index.set(index, item);
        });
    }

    createSearchUI() {
        const searchContainer = document.createElement('div');
        searchContainer.id = 'global-search';
        searchContainer.className = 'global-search';
        searchContainer.innerHTML = `
            <div class="search-backdrop" onclick="window.essentialFeatures.closeSearch()"></div>
            <div class="search-modal">
                <div class="search-input-container">
                    <i class="fas fa-search"></i>
                    <input type="text" id="search-input" placeholder="Search Zeeky AI..." autocomplete="off">
                    <button class="search-close" onclick="window.essentialFeatures.closeSearch()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="search-results" id="search-results"></div>
                <div class="search-footer">
                    <div class="search-shortcuts">
                        <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                        <span><kbd>Enter</kbd> Select</span>
                        <span><kbd>Esc</kbd> Close</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(searchContainer);

        // Search input event listeners
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => this.performSearch(e.target.value));
        searchInput.addEventListener('keydown', (e) => this.handleSearchKeydown(e));
    }

    openSearch() {
        const searchContainer = document.getElementById('global-search');
        const searchInput = document.getElementById('search-input');
        
        searchContainer.style.display = 'flex';
        this.features.search.isOpen = true;
        
        setTimeout(() => {
            searchInput.focus();
        }, 100);
    }

    closeSearch() {
        const searchContainer = document.getElementById('global-search');
        searchContainer.style.display = 'none';
        this.features.search.isOpen = false;
        this.features.search.results = [];
    }

    performSearch(query) {
        if (!query.trim()) {
            this.displaySearchResults([]);
            return;
        }

        const results = [];
        const queryLower = query.toLowerCase();

        this.features.search.index.forEach((item, index) => {
            let score = 0;
            
            // Title match (highest priority)
            if (item.title.toLowerCase().includes(queryLower)) {
                score += 10;
            }
            
            // Description match
            if (item.description.toLowerCase().includes(queryLower)) {
                score += 5;
            }
            
            // Keywords match
            item.keywords.forEach(keyword => {
                if (keyword.toLowerCase().includes(queryLower)) {
                    score += 3;
                }
            });

            if (score > 0) {
                results.push({ ...item, score, index });
            }
        });

        // Sort by score
        results.sort((a, b) => b.score - a.score);
        
        this.features.search.results = results.slice(0, 10);
        this.displaySearchResults(this.features.search.results);
    }

    displaySearchResults(results) {
        const resultsContainer = document.getElementById('search-results');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }

        resultsContainer.innerHTML = results.map((result, index) => `
            <div class="search-result ${index === 0 ? 'selected' : ''}" data-index="${index}">
                <div class="result-icon">
                    <i class="fas fa-${this.getResultIcon(result.type)}"></i>
                </div>
                <div class="result-content">
                    <div class="result-title">${result.title}</div>
                    <div class="result-description">${result.description}</div>
                </div>
                <div class="result-type">${result.type}</div>
            </div>
        `).join('');

        // Add click listeners
        resultsContainer.querySelectorAll('.search-result').forEach((element, index) => {
            element.addEventListener('click', () => this.selectSearchResult(index));
        });
    }

    getResultIcon(type) {
        const icons = {
            personality: 'user',
            feature: 'star',
            page: 'file',
            setting: 'cog'
        };
        return icons[type] || 'search';
    }

    handleSearchKeydown(e) {
        const results = this.features.search.results;
        if (results.length === 0) return;

        const selected = document.querySelector('.search-result.selected');
        let selectedIndex = selected ? parseInt(selected.dataset.index) : 0;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
                this.updateSearchSelection(selectedIndex);
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                this.updateSearchSelection(selectedIndex);
                break;
            case 'Enter':
                e.preventDefault();
                this.selectSearchResult(selectedIndex);
                break;
            case 'Escape':
                e.preventDefault();
                this.closeSearch();
                break;
        }
    }

    updateSearchSelection(index) {
        document.querySelectorAll('.search-result').forEach((el, i) => {
            el.classList.toggle('selected', i === index);
        });
    }

    selectSearchResult(index) {
        const result = this.features.search.results[index];
        if (result && result.action) {
            result.action();
            this.closeSearch();
        }
    }

    // Keyboard Shortcuts
    initKeyboardShortcuts() {
        this.features.shortcuts = {
            'ctrl+k': () => this.openSearch(),
            'cmd+k': () => this.openSearch(),
            'ctrl+/': () => this.showShortcutsHelp(),
            'cmd+/': () => this.showShortcutsHelp(),
            'ctrl+shift+p': () => window.userProfile?.showProfile(),
            'cmd+shift+p': () => window.userProfile?.showProfile(),
            'ctrl+shift+g': () => window.zeekyGames?.showGames(),
            'cmd+shift+g': () => window.zeekyGames?.showGames(),
            'ctrl+,': () => window.universalSettings?.showSettings(),
            'cmd+,': () => window.universalSettings?.showSettings(),
            'f1': () => this.showHelp(),
            'escape': () => this.handleEscape()
        };

        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
    }

    handleGlobalKeydown(e) {
        const key = this.getKeyString(e);
        const shortcut = this.features.shortcuts[key];
        
        if (shortcut) {
            e.preventDefault();
            shortcut();
        }
    }

    getKeyString(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('ctrl');
        if (e.metaKey) parts.push('cmd');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');
        
        const key = e.key.toLowerCase();
        if (key !== 'control' && key !== 'meta' && key !== 'shift' && key !== 'alt') {
            parts.push(key);
        }
        
        return parts.join('+');
    }

    handleEscape() {
        // Close any open modals
        if (this.features.search.isOpen) {
            this.closeSearch();
        } else {
            const modals = document.querySelectorAll('.modal, .auth-modal, .profile-modal, .achievements-modal, .zeeky-games-container');
            modals.forEach(modal => {
                if (modal.style.display !== 'none') {
                    modal.style.display = 'none';
                }
            });
        }
    }

    showShortcutsHelp() {
        const modal = document.createElement('div');
        modal.className = 'shortcuts-modal';
        modal.innerHTML = `
            <div class="shortcuts-modal-content">
                <div class="shortcuts-header">
                    <h2>⌨️ Keyboard Shortcuts</h2>
                    <button class="close-btn" onclick="this.closest('.shortcuts-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="shortcuts-body">
                    <div class="shortcuts-section">
                        <h3>General</h3>
                        <div class="shortcut-item">
                            <div class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>K</kbd></div>
                            <div class="shortcut-desc">Open search</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>/</kbd></div>
                            <div class="shortcut-desc">Show shortcuts</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys"><kbd>Esc</kbd></div>
                            <div class="shortcut-desc">Close modals</div>
                        </div>
                    </div>
                    <div class="shortcuts-section">
                        <h3>Features</h3>
                        <div class="shortcut-item">
                            <div class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd></div>
                            <div class="shortcut-desc">Open profile</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>G</kbd></div>
                            <div class="shortcut-desc">Open games</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>,</kbd></div>
                            <div class="shortcut-desc">Open settings</div>
                        </div>
                        <div class="shortcut-item">
                            <div class="shortcut-keys"><kbd>F1</kbd></div>
                            <div class="shortcut-desc">Show help</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Offline Support
    initOfflineSupport() {
        this.features.offline = {
            isOnline: navigator.onLine,
            cache: new Map(),
            syncQueue: []
        };

        window.addEventListener('online', () => {
            this.features.offline.isOnline = true;
            this.showNotification('Back online!', 'Connection restored');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.features.offline.isOnline = false;
            this.showNotification('Offline mode', 'Some features may be limited');
        });
    }

    syncOfflineData() {
        // Sync any queued data when back online
        while (this.features.offline.syncQueue.length > 0) {
            const item = this.features.offline.syncQueue.shift();
            // Process sync item
            console.log('Syncing offline data:', item);
        }
    }

    // Sharing Features
    initSharingFeatures() {
        this.features.sharing = {
            supported: 'share' in navigator,
            fallback: true
        };
    }

    async shareContent(title, text, url) {
        if (this.features.sharing.supported) {
            try {
                await navigator.share({ title, text, url });
                return true;
            } catch (error) {
                console.log('Share failed:', error);
            }
        }

        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(url || text);
            this.showNotification('Copied to clipboard!', 'Link copied successfully');
            return true;
        } catch (error) {
            console.log('Clipboard failed:', error);
            return false;
        }
    }

    // Data Features (Export/Import/Backup)
    initDataFeatures() {
        this.features.export = true;
        this.features.import = true;
        this.features.backup = true;
        this.features.sync = false; // Would require backend
    }

    exportUserData() {
        const userData = {
            profile: window.userProfile?.getCurrentUser(),
            stats: window.userProfile?.getUserStats(),
            preferences: window.userProfile?.getUserPreferences(),
            achievements: window.userProfile?.getAchievements(),
            gameStats: window.zeekyGames?.getStats(),
            settings: window.universalSettings?.getAllSettings(),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `zeeky-ai-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Data exported!', 'Your data has been downloaded');
    }

    importUserData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.processImportedData(data);
                        this.showNotification('Data imported!', 'Your data has been restored');
                    } catch (error) {
                        this.showNotification('Import failed', 'Invalid file format', { requireInteraction: true });
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    processImportedData(data) {
        // Process imported data
        if (data.profile) {
            localStorage.setItem('zeeky_user_profile', JSON.stringify(data.profile));
        }
        if (data.stats) {
            localStorage.setItem('zeeky_user_stats', JSON.stringify(data.stats));
        }
        if (data.preferences) {
            localStorage.setItem('zeeky_user_preferences', JSON.stringify(data.preferences));
        }
        if (data.achievements) {
            localStorage.setItem('zeeky_user_achievements', JSON.stringify(data.achievements));
        }
        if (data.gameStats) {
            localStorage.setItem('zeeky_game_stats', JSON.stringify(data.gameStats));
        }
        if (data.settings) {
            localStorage.setItem('zeeky_universal_settings', JSON.stringify(data.settings));
        }

        // Reload page to apply changes
        setTimeout(() => window.location.reload(), 1000);
    }

    // Accessibility Features
    initAccessibilityFeatures() {
        this.features.accessibility = {
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            screenReader: false
        };

        // Detect user preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.features.accessibility.reducedMotion = true;
            document.body.classList.add('reduced-motion');
        }

        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.features.accessibility.highContrast = true;
            document.body.classList.add('high-contrast');
        }

        // Add accessibility toolbar
        this.createAccessibilityToolbar();
    }

    createAccessibilityToolbar() {
        const toolbar = document.createElement('div');
        toolbar.id = 'accessibility-toolbar';
        toolbar.className = 'accessibility-toolbar';
        toolbar.innerHTML = `
            <button class="a11y-btn" onclick="window.essentialFeatures.toggleHighContrast()" title="Toggle High Contrast">
                <i class="fas fa-adjust"></i>
            </button>
            <button class="a11y-btn" onclick="window.essentialFeatures.toggleLargeText()" title="Toggle Large Text">
                <i class="fas fa-font"></i>
            </button>
            <button class="a11y-btn" onclick="window.essentialFeatures.toggleReducedMotion()" title="Toggle Reduced Motion">
                <i class="fas fa-pause"></i>
            </button>
        `;

        document.body.appendChild(toolbar);
    }

    toggleHighContrast() {
        this.features.accessibility.highContrast = !this.features.accessibility.highContrast;
        document.body.classList.toggle('high-contrast', this.features.accessibility.highContrast);
        localStorage.setItem('zeeky_high_contrast', this.features.accessibility.highContrast);
    }

    toggleLargeText() {
        this.features.accessibility.largeText = !this.features.accessibility.largeText;
        document.body.classList.toggle('large-text', this.features.accessibility.largeText);
        localStorage.setItem('zeeky_large_text', this.features.accessibility.largeText);
    }

    toggleReducedMotion() {
        this.features.accessibility.reducedMotion = !this.features.accessibility.reducedMotion;
        document.body.classList.toggle('reduced-motion', this.features.accessibility.reducedMotion);
        localStorage.setItem('zeeky_reduced_motion', this.features.accessibility.reducedMotion);
    }

    createFeaturesUI() {
        // Add features menu to the interface
        const featuresMenu = document.createElement('div');
        featuresMenu.id = 'features-menu';
        featuresMenu.className = 'features-menu';
        featuresMenu.innerHTML = `
            <button class="features-toggle" onclick="window.essentialFeatures.toggleFeaturesMenu()">
                <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="features-dropdown">
                <button onclick="window.essentialFeatures.openSearch()">
                    <i class="fas fa-search"></i> Search
                </button>
                <button onclick="window.essentialFeatures.requestNotificationPermission()">
                    <i class="fas fa-bell"></i> Enable Notifications
                </button>
                <button onclick="window.essentialFeatures.exportUserData()">
                    <i class="fas fa-download"></i> Export Data
                </button>
                <button onclick="window.essentialFeatures.importUserData()">
                    <i class="fas fa-upload"></i> Import Data
                </button>
                <button onclick="window.essentialFeatures.shareContent('Zeeky AI', 'Check out this amazing AI assistant!', window.location.href)">
                    <i class="fas fa-share"></i> Share
                </button>
                <button onclick="window.essentialFeatures.showShortcutsHelp()">
                    <i class="fas fa-keyboard"></i> Shortcuts
                </button>
            </div>
        `;

        // Add to header or create floating menu
        const header = document.querySelector('.dashboard-header, header');
        if (header) {
            header.appendChild(featuresMenu);
        } else {
            featuresMenu.style.position = 'fixed';
            featuresMenu.style.top = '20px';
            featuresMenu.style.right = '20px';
            featuresMenu.style.zIndex = '1000';
            document.body.appendChild(featuresMenu);
        }
    }

    toggleFeaturesMenu() {
        const dropdown = document.querySelector('.features-dropdown');
        dropdown.classList.toggle('show');
    }

    showHelp() {
        window.open('https://github.com/joachimaross/ZEEKYAI1.00/wiki', '_blank');
    }

    // Public API
    getFeatureStatus() {
        return {
            notifications: this.features.notifications.enabled,
            search: true,
            shortcuts: true,
            offline: this.features.offline.isOnline,
            sharing: this.features.sharing.supported,
            export: this.features.export,
            import: this.features.import,
            accessibility: this.features.accessibility
        };
    }
}

// Initialize Essential Features
document.addEventListener('DOMContentLoaded', () => {
    window.essentialFeatures = new EssentialFeaturesManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EssentialFeaturesManager;
}
