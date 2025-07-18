// Universal Settings Manager for All Pages
class UniversalSettings {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.createSettingsButton();
        this.createSettingsModal();
        this.setupEventListeners();
        this.applySettings();
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        if (filename.includes('smart-home')) return 'smart-home';
        if (filename.includes('car-mode')) return 'car-mode';
        if (filename.includes('code-lab')) return 'code-lab';
        if (filename.includes('testing-dashboard')) return 'testing';
        if (filename.includes('index')) return 'main';
        
        return 'main';
    }

    loadSettings() {
        const defaultSettings = {
            theme: 'dark',
            animations: true,
            notifications: true,
            autoSave: true,
            soundEffects: false,
            compactMode: false,
            highContrast: false,
            reducedMotion: false,
            // Page-specific settings
            'smart-home': {
                autoDiscovery: true,
                groupDevices: true,
                showStatus: true,
                energyMonitoring: true
            },
            'car-mode': {
                voiceCommands: true,
                handsFreeMode: true,
                emergencyMode: false,
                navigationAlerts: true
            },
            'code-lab': {
                syntaxHighlighting: true,
                autoComplete: true,
                lineNumbers: true,
                wordWrap: false,
                fontSize: 14
            },
            'testing': {
                autoRun: false,
                detailedLogs: true,
                parallelExecution: false,
                coverage: true
            },
            'main': {
                welcomeMessage: true,
                quickActions: true,
                recentActivity: true,
                aiSuggestions: true
            }
        };

        const saved = localStorage.getItem('zeeky-universal-settings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('zeeky-universal-settings', JSON.stringify(this.settings));
    }

    createSettingsButton() {
        // Remove existing button if present
        const existing = document.getElementById('universal-settings-btn');
        if (existing) existing.remove();

        const button = document.createElement('button');
        button.id = 'universal-settings-btn';
        button.className = 'settings-btn';
        button.innerHTML = '<i class="fas fa-cog"></i>';
        button.title = 'Page Settings';
        
        document.body.appendChild(button);
    }

    createSettingsModal() {
        // Remove existing modal if present
        const existing = document.getElementById('universal-settings-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'universal-settings-modal';
        modal.className = 'settings-modal';
        modal.innerHTML = this.generateModalContent();
        
        document.body.appendChild(modal);
    }

    generateModalContent() {
        const pageSettings = this.getPageSpecificSettings();
        
        return `
            <div class="settings-content">
                <div class="settings-header">
                    <div class="settings-title">
                        <img src="assets/zeeky-logo.svg" alt="Zeeky AI" class="logo-icon" style="width: 32px; height: 32px; margin-right: 10px;">
                        ${this.getPageTitle()} Settings
                    </div>
                    <button class="settings-close" id="settings-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- General Settings -->
                <div class="settings-section">
                    <div class="settings-section-title">
                        <i class="fas fa-sliders-h"></i>
                        General Settings
                    </div>
                    
                    <div class="settings-option">
                        <div>
                            <div class="option-label">Animations</div>
                            <div class="option-description">Enable smooth transitions and animations</div>
                        </div>
                        <div class="toggle-switch ${this.settings.animations ? 'active' : ''}" data-setting="animations">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>

                    <div class="settings-option">
                        <div>
                            <div class="option-label">Notifications</div>
                            <div class="option-description">Show system notifications and alerts</div>
                        </div>
                        <div class="toggle-switch ${this.settings.notifications ? 'active' : ''}" data-setting="notifications">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>

                    <div class="settings-option">
                        <div>
                            <div class="option-label">Auto Save</div>
                            <div class="option-description">Automatically save changes and preferences</div>
                        </div>
                        <div class="toggle-switch ${this.settings.autoSave ? 'active' : ''}" data-setting="autoSave">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>

                    <div class="settings-option">
                        <div>
                            <div class="option-label">Sound Effects</div>
                            <div class="option-description">Play audio feedback for interactions</div>
                        </div>
                        <div class="toggle-switch ${this.settings.soundEffects ? 'active' : ''}" data-setting="soundEffects">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>

                <!-- Accessibility Settings -->
                <div class="settings-section">
                    <div class="settings-section-title">
                        <i class="fas fa-universal-access"></i>
                        Accessibility
                    </div>
                    
                    <div class="settings-option">
                        <div>
                            <div class="option-label">High Contrast</div>
                            <div class="option-description">Increase contrast for better visibility</div>
                        </div>
                        <div class="toggle-switch ${this.settings.highContrast ? 'active' : ''}" data-setting="highContrast">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>

                    <div class="settings-option">
                        <div>
                            <div class="option-label">Reduced Motion</div>
                            <div class="option-description">Minimize animations for motion sensitivity</div>
                        </div>
                        <div class="toggle-switch ${this.settings.reducedMotion ? 'active' : ''}" data-setting="reducedMotion">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>

                    <div class="settings-option">
                        <div>
                            <div class="option-label">Compact Mode</div>
                            <div class="option-description">Use smaller interface elements</div>
                        </div>
                        <div class="toggle-switch ${this.settings.compactMode ? 'active' : ''}" data-setting="compactMode">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>

                ${pageSettings}

                <!-- Action Buttons -->
                <div class="settings-section">
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="btn-futuristic" id="reset-settings">
                            <i class="fas fa-undo"></i>
                            Reset to Default
                        </button>
                        <button class="btn-futuristic btn-primary" id="save-settings">
                            <i class="fas fa-save"></i>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getPageTitle() {
        const titles = {
            'main': 'Zeeky AI',
            'smart-home': 'Smart Home',
            'car-mode': 'Car Mode',
            'code-lab': 'Code Lab',
            'testing': 'Testing Dashboard'
        };
        return titles[this.currentPage] || 'Zeeky AI';
    }

    getPageSpecificSettings() {
        const pageSettings = this.settings[this.currentPage] || {};
        
        switch (this.currentPage) {
            case 'smart-home':
                return this.generateSmartHomeSettings(pageSettings);
            case 'car-mode':
                return this.generateCarModeSettings(pageSettings);
            case 'code-lab':
                return this.generateCodeLabSettings(pageSettings);
            case 'testing':
                return this.generateTestingSettings(pageSettings);
            case 'main':
                return this.generateMainSettings(pageSettings);
            default:
                return '';
        }
    }

    generateSmartHomeSettings(settings) {
        return `
            <div class="settings-section">
                <div class="settings-section-title">
                    <i class="fas fa-home"></i>
                    Smart Home Settings
                </div>
                
                <div class="settings-option">
                    <div>
                        <div class="option-label">Auto Discovery</div>
                        <div class="option-description">Automatically detect new smart devices</div>
                    </div>
                    <div class="toggle-switch ${settings.autoDiscovery ? 'active' : ''}" data-setting="smart-home.autoDiscovery">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">Group Devices</div>
                        <div class="option-description">Organize devices by room or type</div>
                    </div>
                    <div class="toggle-switch ${settings.groupDevices ? 'active' : ''}" data-setting="smart-home.groupDevices">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">Show Status</div>
                        <div class="option-description">Display real-time device status</div>
                    </div>
                    <div class="toggle-switch ${settings.showStatus ? 'active' : ''}" data-setting="smart-home.showStatus">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">Energy Monitoring</div>
                        <div class="option-description">Track power consumption and efficiency</div>
                    </div>
                    <div class="toggle-switch ${settings.energyMonitoring ? 'active' : ''}" data-setting="smart-home.energyMonitoring">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
            </div>
        `;
    }

    generateCarModeSettings(settings) {
        return `
            <div class="settings-section">
                <div class="settings-section-title">
                    <i class="fas fa-car"></i>
                    Car Mode Settings
                </div>
                
                <div class="settings-option">
                    <div>
                        <div class="option-label">Voice Commands</div>
                        <div class="option-description">Enable hands-free voice control</div>
                    </div>
                    <div class="toggle-switch ${settings.voiceCommands ? 'active' : ''}" data-setting="car-mode.voiceCommands">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">Hands-Free Mode</div>
                        <div class="option-description">Optimize interface for driving</div>
                    </div>
                    <div class="toggle-switch ${settings.handsFreeMode ? 'active' : ''}" data-setting="car-mode.handsFreeMode">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">Emergency Mode</div>
                        <div class="option-description">Quick access to emergency features</div>
                    </div>
                    <div class="toggle-switch ${settings.emergencyMode ? 'active' : ''}" data-setting="car-mode.emergencyMode">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">Navigation Alerts</div>
                        <div class="option-description">Audio and visual navigation prompts</div>
                    </div>
                    <div class="toggle-switch ${settings.navigationAlerts ? 'active' : ''}" data-setting="car-mode.navigationAlerts">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
            </div>
        `;
    }

    generateCodeLabSettings(settings) {
        return `
            <div class="settings-section">
                <div class="settings-section-title">
                    <i class="fas fa-code"></i>
                    Code Lab Settings
                </div>
                
                <div class="settings-option">
                    <div>
                        <div class="option-label">Syntax Highlighting</div>
                        <div class="option-description">Color-code different language elements</div>
                    </div>
                    <div class="toggle-switch ${settings.syntaxHighlighting ? 'active' : ''}" data-setting="code-lab.syntaxHighlighting">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">Auto Complete</div>
                        <div class="option-description">Suggest code completions while typing</div>
                    </div>
                    <div class="toggle-switch ${settings.autoComplete ? 'active' : ''}" data-setting="code-lab.autoComplete">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">Line Numbers</div>
                        <div class="option-description">Show line numbers in code editor</div>
                    </div>
                    <div class="toggle-switch ${settings.lineNumbers ? 'active' : ''}" data-setting="code-lab.lineNumbers">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">Word Wrap</div>
                        <div class="option-description">Wrap long lines to fit editor width</div>
                    </div>
                    <div class="toggle-switch ${settings.wordWrap ? 'active' : ''}" data-setting="code-lab.wordWrap">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
            </div>
        `;
    }

    generateTestingSettings(settings) {
        return `
            <div class="settings-section">
                <div class="settings-section-title">
                    <i class="fas fa-vial"></i>
                    Testing Settings
                </div>
                
                <div class="settings-option">
                    <div>
                        <div class="option-label">Auto Run</div>
                        <div class="option-description">Automatically run tests on code changes</div>
                    </div>
                    <div class="toggle-switch ${settings.autoRun ? 'active' : ''}" data-setting="testing.autoRun">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">Detailed Logs</div>
                        <div class="option-description">Show comprehensive test execution logs</div>
                    </div>
                    <div class="toggle-switch ${settings.detailedLogs ? 'active' : ''}" data-setting="testing.detailedLogs">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">Parallel Execution</div>
                        <div class="option-description">Run multiple tests simultaneously</div>
                    </div>
                    <div class="toggle-switch ${settings.parallelExecution ? 'active' : ''}" data-setting="testing.parallelExecution">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">Coverage Reports</div>
                        <div class="option-description">Generate code coverage analysis</div>
                    </div>
                    <div class="toggle-switch ${settings.coverage ? 'active' : ''}" data-setting="testing.coverage">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
            </div>
        `;
    }

    generateMainSettings(settings) {
        return `
            <div class="settings-section">
                <div class="settings-section-title">
                    <i class="fas fa-home"></i>
                    Dashboard Settings
                </div>
                
                <div class="settings-option">
                    <div>
                        <div class="option-label">Welcome Message</div>
                        <div class="option-description">Show personalized welcome message</div>
                    </div>
                    <div class="toggle-switch ${settings.welcomeMessage ? 'active' : ''}" data-setting="main.welcomeMessage">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">Quick Actions</div>
                        <div class="option-description">Display frequently used action buttons</div>
                    </div>
                    <div class="toggle-switch ${settings.quickActions ? 'active' : ''}" data-setting="main.quickActions">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">Recent Activity</div>
                        <div class="option-description">Show recent interactions and history</div>
                    </div>
                    <div class="toggle-switch ${settings.recentActivity ? 'active' : ''}" data-setting="main.recentActivity">
                        <div class="toggle-slider"></div>
                    </div>
                </div>

                <div class="settings-option">
                    <div>
                        <div class="option-label">AI Suggestions</div>
                        <div class="option-description">Enable intelligent recommendations</div>
                    </div>
                    <div class="toggle-switch ${settings.aiSuggestions ? 'active' : ''}" data-setting="main.aiSuggestions">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Settings button click
        document.getElementById('universal-settings-btn').addEventListener('click', () => {
            this.openSettings();
        });

        // Close button click
        document.addEventListener('click', (e) => {
            if (e.target.id === 'settings-close') {
                this.closeSettings();
            }
        });

        // Modal background click
        document.addEventListener('click', (e) => {
            if (e.target.id === 'universal-settings-modal') {
                this.closeSettings();
            }
        });

        // Toggle switches
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('toggle-switch') || e.target.parentElement.classList.contains('toggle-switch')) {
                const toggle = e.target.classList.contains('toggle-switch') ? e.target : e.target.parentElement;
                const setting = toggle.dataset.setting;
                this.toggleSetting(setting, toggle);
            }
        });

        // Reset button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'reset-settings') {
                this.resetSettings();
            }
        });

        // Save button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'save-settings') {
                this.saveSettings();
                this.showNotification('Settings saved successfully!', 'success');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSettings();
            }
            if (e.ctrlKey && e.key === ',') {
                e.preventDefault();
                this.openSettings();
            }
        });
    }

    openSettings() {
        const modal = document.getElementById('universal-settings-modal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeSettings() {
        const modal = document.getElementById('universal-settings-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggleSetting(settingPath, toggleElement) {
        const keys = settingPath.split('.');
        let current = this.settings;
        
        // Navigate to the setting
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        
        // Toggle the value
        const finalKey = keys[keys.length - 1];
        current[finalKey] = !current[finalKey];
        
        // Update UI
        toggleElement.classList.toggle('active', current[finalKey]);
        
        // Apply setting immediately
        this.applySetting(settingPath, current[finalKey]);
        
        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.saveSettings();
        }
    }

    applySetting(settingPath, value) {
        switch (settingPath) {
            case 'animations':
                document.documentElement.style.setProperty('--animation-duration', value ? '0.3s' : '0s');
                break;
            case 'highContrast':
                document.body.classList.toggle('high-contrast', value);
                break;
            case 'reducedMotion':
                document.body.classList.toggle('reduced-motion', value);
                break;
            case 'compactMode':
                document.body.classList.toggle('compact-mode', value);
                break;
            case 'soundEffects':
                // Enable/disable sound effects
                if (window.audioManager) {
                    window.audioManager.enabled = value;
                }
                break;
            // Add more setting applications as needed
        }
    }

    applySettings() {
        // Apply all current settings
        Object.keys(this.settings).forEach(key => {
            if (typeof this.settings[key] === 'boolean') {
                this.applySetting(key, this.settings[key]);
            }
        });
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
            localStorage.removeItem('zeeky-universal-settings');
            location.reload();
        }
    }

    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--card-bg);
                color: var(--text-primary);
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid var(--border-glow);
                z-index: 3000;
                backdrop-filter: blur(20px);
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }
    }

    // Public API
    getSetting(path) {
        const keys = path.split('.');
        let current = this.settings;
        for (const key of keys) {
            if (current[key] === undefined) return null;
            current = current[key];
        }
        return current;
    }

    setSetting(path, value) {
        const keys = path.split('.');
        let current = this.settings;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        this.applySetting(path, value);
        if (this.settings.autoSave) {
            this.saveSettings();
        }
    }
}

// Initialize Universal Settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.universalSettings = new UniversalSettings();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalSettings;
}
