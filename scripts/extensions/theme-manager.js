// Theme Manager Extension for Zeeky AI
class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                name: 'Light',
                description: 'Clean and bright interface',
                variables: {
                    '--bg-primary': '#ffffff',
                    '--bg-secondary': '#f8f9fa',
                    '--bg-tertiary': '#e9ecef',
                    '--text-primary': '#212529',
                    '--text-secondary': '#6c757d',
                    '--text-muted': '#adb5bd',
                    '--border-color': '#dee2e6',
                    '--accent-color': '#0066cc',
                    '--accent-hover': '#0052a3',
                    '--success-color': '#28a745',
                    '--warning-color': '#ffc107',
                    '--danger-color': '#dc3545'
                }
            },
            dark: {
                name: 'Dark',
                description: 'Easy on the eyes for low-light environments',
                variables: {
                    '--bg-primary': '#1a1a1a',
                    '--bg-secondary': '#2d2d2d',
                    '--bg-tertiary': '#404040',
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#b3b3b3',
                    '--text-muted': '#808080',
                    '--border-color': '#404040',
                    '--accent-color': '#4a9eff',
                    '--accent-hover': '#357abd',
                    '--success-color': '#28a745',
                    '--warning-color': '#ffc107',
                    '--danger-color': '#dc3545'
                }
            },
            blue: {
                name: 'Ocean Blue',
                description: 'Calming blue tones',
                variables: {
                    '--bg-primary': '#f0f8ff',
                    '--bg-secondary': '#e6f3ff',
                    '--bg-tertiary': '#cce7ff',
                    '--text-primary': '#1e3a8a',
                    '--text-secondary': '#3b82f6',
                    '--text-muted': '#6b7280',
                    '--border-color': '#bfdbfe',
                    '--accent-color': '#2563eb',
                    '--accent-hover': '#1d4ed8',
                    '--success-color': '#059669',
                    '--warning-color': '#d97706',
                    '--danger-color': '#dc2626'
                }
            },
            purple: {
                name: 'Royal Purple',
                description: 'Elegant purple theme',
                variables: {
                    '--bg-primary': '#faf7ff',
                    '--bg-secondary': '#f3f0ff',
                    '--bg-tertiary': '#e9e5ff',
                    '--text-primary': '#581c87',
                    '--text-secondary': '#7c3aed',
                    '--text-muted': '#6b7280',
                    '--border-color': '#d8b4fe',
                    '--accent-color': '#8b5cf6',
                    '--accent-hover': '#7c3aed',
                    '--success-color': '#059669',
                    '--warning-color': '#d97706',
                    '--danger-color': '#dc2626'
                }
            },
            green: {
                name: 'Forest Green',
                description: 'Natural green theme',
                variables: {
                    '--bg-primary': '#f7fdf7',
                    '--bg-secondary': '#f0fdf0',
                    '--bg-tertiary': '#e6ffe6',
                    '--text-primary': '#14532d',
                    '--text-secondary': '#16a34a',
                    '--text-muted': '#6b7280',
                    '--border-color': '#bbf7d0',
                    '--accent-color': '#22c55e',
                    '--accent-hover': '#16a34a',
                    '--success-color': '#059669',
                    '--warning-color': '#d97706',
                    '--danger-color': '#dc2626'
                }
            },
            cyberpunk: {
                name: 'Cyberpunk',
                description: 'Futuristic neon theme',
                variables: {
                    '--bg-primary': '#0a0a0a',
                    '--bg-secondary': '#1a1a2e',
                    '--bg-tertiary': '#16213e',
                    '--text-primary': '#00ff9f',
                    '--text-secondary': '#00d4aa',
                    '--text-muted': '#7c7c7c',
                    '--border-color': '#0f3460',
                    '--accent-color': '#ff006e',
                    '--accent-hover': '#d90368',
                    '--success-color': '#00ff9f',
                    '--warning-color': '#ffbe0b',
                    '--danger-color': '#ff006e'
                }
            }
        };
        
        this.currentTheme = 'auto';
        this.customThemes = {};
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.applyTheme();
        this.setupSystemThemeDetection();
    }

    loadSettings() {
        const saved = localStorage.getItem('zeeky_theme_settings');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentTheme = data.currentTheme || 'auto';
                this.customThemes = data.customThemes || {};
            } catch (e) {
                console.error('Failed to load theme settings:', e);
            }
        }
    }

    saveSettings() {
        const data = {
            currentTheme: this.currentTheme,
            customThemes: this.customThemes
        };
        localStorage.setItem('zeeky_theme_settings', JSON.stringify(data));
    }

    setupEventListeners() {
        // Theme selector in settings
        const themeSelect = document.getElementById('theme-select');
        themeSelect?.addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        // Theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle?.addEventListener('click', () => {
            this.cycleTheme();
        });

        // Add theme options to select
        this.populateThemeSelect();
    }

    populateThemeSelect() {
        const themeSelect = document.getElementById('theme-select');
        if (!themeSelect) return;

        // Clear existing options
        themeSelect.innerHTML = '';

        // Add auto option
        const autoOption = document.createElement('option');
        autoOption.value = 'auto';
        autoOption.textContent = 'Auto (System)';
        themeSelect.appendChild(autoOption);

        // Add built-in themes
        Object.entries(this.themes).forEach(([key, theme]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = theme.name;
            themeSelect.appendChild(option);
        });

        // Add custom themes
        Object.entries(this.customThemes).forEach(([key, theme]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${theme.name} (Custom)`;
            themeSelect.appendChild(option);
        });

        // Set current selection
        themeSelect.value = this.currentTheme;
    }

    setupSystemThemeDetection() {
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (this.currentTheme === 'auto') {
                this.applyTheme();
            }
        });
    }

    setTheme(themeName) {
        this.currentTheme = themeName;
        this.applyTheme();
        this.saveSettings();
        this.updateThemeToggleIcon();
        
        // Track theme change
        if (window.analyticsManager) {
            window.analyticsManager.trackUserAction('theme_change', themeName);
        }
        
        this.showNotification(`Theme changed to ${this.getThemeDisplayName(themeName)}`, 'success');
    }

    applyTheme() {
        let themeToApply;
        
        if (this.currentTheme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            themeToApply = prefersDark ? 'dark' : 'light';
        } else {
            themeToApply = this.currentTheme;
        }

        // Get theme data
        const themeData = this.themes[themeToApply] || this.customThemes[themeToApply];
        if (!themeData) {
            console.error('Theme not found:', themeToApply);
            return;
        }

        // Apply CSS variables
        const root = document.documentElement;
        Object.entries(themeData.variables).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Set data attribute for theme-specific styles
        document.documentElement.setAttribute('data-theme', themeToApply);
        
        // Update theme toggle icon
        this.updateThemeToggleIcon();
    }

    cycleTheme() {
        const themeKeys = ['auto', 'light', 'dark', ...Object.keys(this.themes).filter(k => k !== 'light' && k !== 'dark')];
        const currentIndex = themeKeys.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        
        this.setTheme(themeKeys[nextIndex]);
    }

    updateThemeToggleIcon() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const icon = themeToggle.querySelector('i');
        if (!icon) return;

        // Determine which icon to show
        let iconClass;
        if (this.currentTheme === 'auto') {
            iconClass = 'fas fa-adjust';
        } else if (this.currentTheme === 'dark' || this.isCurrentlyDark()) {
            iconClass = 'fas fa-sun';
        } else {
            iconClass = 'fas fa-moon';
        }

        icon.className = iconClass;
    }

    isCurrentlyDark() {
        if (this.currentTheme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        
        const themeData = this.themes[this.currentTheme] || this.customThemes[this.currentTheme];
        if (!themeData) return false;
        
        // Check if background is dark
        const bgColor = themeData.variables['--bg-primary'];
        return this.isColorDark(bgColor);
    }

    isColorDark(color) {
        // Simple check for dark colors
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness < 128;
        }
        return false;
    }

    getThemeDisplayName(themeName) {
        if (themeName === 'auto') return 'Auto (System)';
        
        const themeData = this.themes[themeName] || this.customThemes[themeName];
        return themeData ? themeData.name : themeName;
    }

    createCustomTheme(name, baseTheme, customizations) {
        const base = this.themes[baseTheme];
        if (!base) {
            throw new Error('Base theme not found');
        }

        const customTheme = {
            name: name,
            description: `Custom theme based on ${base.name}`,
            variables: { ...base.variables, ...customizations },
            isCustom: true
        };

        const themeKey = name.toLowerCase().replace(/\s+/g, '-');
        this.customThemes[themeKey] = customTheme;
        this.saveSettings();
        this.populateThemeSelect();
        
        return themeKey;
    }

    deleteCustomTheme(themeKey) {
        if (this.customThemes[themeKey]) {
            delete this.customThemes[themeKey];
            this.saveSettings();
            this.populateThemeSelect();
            
            // Switch to auto if current theme was deleted
            if (this.currentTheme === themeKey) {
                this.setTheme('auto');
            }
            
            this.showNotification('Custom theme deleted', 'success');
        }
    }

    exportTheme(themeKey) {
        const themeData = this.themes[themeKey] || this.customThemes[themeKey];
        if (!themeData) {
            this.showNotification('Theme not found', 'error');
            return;
        }

        const exportData = {
            name: themeData.name,
            description: themeData.description,
            variables: themeData.variables,
            version: '1.0',
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zeeky-theme-${themeKey}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Theme exported successfully', 'success');
    }

    async importTheme(file) {
        try {
            const text = await file.text();
            const themeData = JSON.parse(text);
            
            // Validate theme data
            if (!themeData.name || !themeData.variables) {
                throw new Error('Invalid theme file format');
            }

            // Create unique key
            let themeKey = themeData.name.toLowerCase().replace(/\s+/g, '-');
            let counter = 1;
            while (this.themes[themeKey] || this.customThemes[themeKey]) {
                themeKey = `${themeData.name.toLowerCase().replace(/\s+/g, '-')}-${counter}`;
                counter++;
            }

            // Add to custom themes
            this.customThemes[themeKey] = {
                name: themeData.name,
                description: themeData.description || 'Imported theme',
                variables: themeData.variables,
                isCustom: true
            };

            this.saveSettings();
            this.populateThemeSelect();
            
            this.showNotification(`Theme "${themeData.name}" imported successfully`, 'success');
            return themeKey;
            
        } catch (error) {
            this.showNotification('Failed to import theme: ' + error.message, 'error');
            throw error;
        }
    }

    getThemePreview(themeKey) {
        const themeData = this.themes[themeKey] || this.customThemes[themeKey];
        if (!themeData) return null;

        return {
            name: themeData.name,
            description: themeData.description,
            colors: {
                primary: themeData.variables['--bg-primary'],
                secondary: themeData.variables['--bg-secondary'],
                accent: themeData.variables['--accent-color'],
                text: themeData.variables['--text-primary']
            }
        };
    }

    showNotification(message, type) {
        if (window.ZeekyUtils) {
            window.ZeekyUtils.showNotification(message, type);
        }
    }

    // Public API
    getCurrentTheme() {
        return this.currentTheme;
    }

    getAvailableThemes() {
        return {
            builtin: Object.keys(this.themes),
            custom: Object.keys(this.customThemes)
        };
    }

    getThemeData(themeKey) {
        return this.themes[themeKey] || this.customThemes[themeKey];
    }

    // Theme builder helper
    generateThemeFromColors(name, primaryColor, accentColor, isDark = false) {
        // This would generate a complete theme from base colors
        // Implementation would include color manipulation functions
        const baseTheme = isDark ? this.themes.dark : this.themes.light;
        
        const customizations = {
            '--accent-color': accentColor,
            '--accent-hover': this.darkenColor(accentColor, 10)
            // Add more color calculations here
        };

        return this.createCustomTheme(name, isDark ? 'dark' : 'light', customizations);
    }

    darkenColor(color, percent) {
        // Simple color darkening function
        // In a real implementation, you'd use a proper color manipulation library
        return color;
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});
