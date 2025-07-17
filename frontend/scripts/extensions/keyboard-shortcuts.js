// Keyboard Shortcuts Extension for Zeeky AI
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.commandPalette = null;
        this.commands = [];
        this.selectedCommandIndex = 0;
        
        this.init();
    }

    init() {
        this.registerShortcuts();
        this.setupCommandPalette();
        this.setupEventListeners();
        this.loadCommands();
    }

    registerShortcuts() {
        // Navigation shortcuts
        this.addShortcut('ctrl+k', () => this.focusChatInput(), 'Focus chat input');
        this.addShortcut('ctrl+p', () => this.toggleCommandPalette(), 'Open command palette');
        this.addShortcut('ctrl+n', () => this.startNewConversation(), 'New conversation');
        this.addShortcut('ctrl+b', () => this.toggleSidebar(), 'Toggle sidebar');
        
        // Action shortcuts
        this.addShortcut('ctrl+m', () => this.toggleVoiceInput(), 'Toggle voice input');
        this.addShortcut('ctrl+u', () => this.openFileUpload(), 'Upload file');
        this.addShortcut('ctrl+shift+t', () => this.toggleTheme(), 'Toggle theme');
        this.addShortcut('ctrl+,', () => this.openSettings(), 'Open settings');
        this.addShortcut('ctrl+/', () => this.showShortcutsHelp(), 'Show shortcuts');
        
        // Modal shortcuts
        this.addShortcut('escape', () => this.closeModals(), 'Close modals');
        
        // Advanced shortcuts
        this.addShortcut('ctrl+shift+a', () => this.openAnalytics(), 'Open analytics');
        this.addShortcut('ctrl+shift+f', () => this.openFiles(), 'Open file manager');
        this.addShortcut('ctrl+shift+v', () => this.openVoiceSettings(), 'Voice settings');
        this.addShortcut('ctrl+shift+e', () => this.exportChat(), 'Export chat');
        this.addShortcut('ctrl+shift+c', () => this.clearChat(), 'Clear chat');
    }

    addShortcut(keys, callback, description) {
        this.shortcuts.set(keys, { callback, description });
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        // Command palette specific events
        document.addEventListener('keydown', (e) => {
            if (this.isCommandPaletteOpen()) {
                this.handleCommandPaletteKeys(e);
            }
        });
    }

    handleKeyDown(e) {
        // Don't trigger shortcuts when typing in inputs (except for specific cases)
        if (this.isTypingInInput(e.target) && !this.isSpecialShortcut(e)) {
            return;
        }

        const shortcut = this.getShortcutString(e);
        const shortcutData = this.shortcuts.get(shortcut);
        
        if (shortcutData) {
            e.preventDefault();
            shortcutData.callback();
            this.trackShortcutUsage(shortcut);
        }
    }

    isTypingInInput(target) {
        const inputTypes = ['INPUT', 'TEXTAREA', 'SELECT'];
        return inputTypes.includes(target.tagName) || target.contentEditable === 'true';
    }

    isSpecialShortcut(e) {
        // These shortcuts work even when typing in inputs
        const specialShortcuts = ['ctrl+k', 'ctrl+p', 'escape'];
        const shortcut = this.getShortcutString(e);
        return specialShortcuts.includes(shortcut);
    }

    getShortcutString(e) {
        const parts = [];
        
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');
        
        const key = e.key.toLowerCase();
        if (key !== 'control' && key !== 'shift' && key !== 'alt' && key !== 'meta') {
            parts.push(key);
        }
        
        return parts.join('+');
    }

    // Shortcut actions
    focusChatInput() {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.focus();
            chatInput.setSelectionRange(chatInput.value.length, chatInput.value.length);
        }
    }

    startNewConversation() {
        if (window.zeekyAI) {
            window.zeekyAI.startNewChat();
        }
    }

    toggleSidebar() {
        if (window.zeekyAI) {
            window.zeekyAI.toggleSidebar();
        }
    }

    toggleVoiceInput() {
        if (window.voiceHandler) {
            window.voiceHandler.toggleListening();
        }
    }

    openFileUpload() {
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.click();
        }
    }

    toggleTheme() {
        if (window.zeekyAI) {
            window.zeekyAI.toggleTheme();
        }
    }

    openSettings() {
        if (window.zeekyAI) {
            window.zeekyAI.openModal('settings-modal');
        }
    }

    showShortcutsHelp() {
        if (window.zeekyAI) {
            window.zeekyAI.openModal('shortcuts-modal');
        }
    }

    closeModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        
        if (this.isCommandPaletteOpen()) {
            this.hideCommandPalette();
        }
    }

    openAnalytics() {
        if (window.analyticsManager) {
            window.analyticsManager.openAnalyticsModal();
        }
    }

    openFiles() {
        if (window.fileHandler) {
            window.fileHandler.openFilesModal();
        }
    }

    openVoiceSettings() {
        if (window.zeekyAI) {
            window.zeekyAI.openModal('voice-modal');
        }
    }

    exportChat() {
        if (window.zeekyAI) {
            window.zeekyAI.exportChat();
        }
    }

    clearChat() {
        if (window.zeekyAI) {
            window.zeekyAI.clearChat();
        }
    }

    // Command Palette
    setupCommandPalette() {
        this.commandPalette = document.getElementById('command-palette');
        const commandInput = document.getElementById('command-input');
        
        if (commandInput) {
            commandInput.addEventListener('input', (e) => {
                this.filterCommands(e.target.value);
            });
        }
    }

    loadCommands() {
        this.commands = [
            { title: 'New Conversation', description: 'Start a new chat', action: () => this.startNewConversation(), icon: 'fas fa-plus' },
            { title: 'Focus Input', description: 'Focus the chat input', action: () => this.focusChatInput(), icon: 'fas fa-keyboard' },
            { title: 'Toggle Voice', description: 'Start/stop voice input', action: () => this.toggleVoiceInput(), icon: 'fas fa-microphone' },
            { title: 'Upload File', description: 'Upload a file', action: () => this.openFileUpload(), icon: 'fas fa-paperclip' },
            { title: 'Toggle Theme', description: 'Switch between light/dark theme', action: () => this.toggleTheme(), icon: 'fas fa-palette' },
            { title: 'Settings', description: 'Open settings', action: () => this.openSettings(), icon: 'fas fa-cog' },
            { title: 'Analytics', description: 'View analytics dashboard', action: () => this.openAnalytics(), icon: 'fas fa-chart-line' },
            { title: 'File Manager', description: 'Manage uploaded files', action: () => this.openFiles(), icon: 'fas fa-folder' },
            { title: 'Voice Settings', description: 'Configure voice options', action: () => this.openVoiceSettings(), icon: 'fas fa-volume-up' },
            { title: 'Export Chat', description: 'Export current conversation', action: () => this.exportChat(), icon: 'fas fa-download' },
            { title: 'Clear Chat', description: 'Clear current conversation', action: () => this.clearChat(), icon: 'fas fa-trash' },
            { title: 'Toggle Sidebar', description: 'Show/hide sidebar', action: () => this.toggleSidebar(), icon: 'fas fa-bars' },
            { title: 'Keyboard Shortcuts', description: 'Show all shortcuts', action: () => this.showShortcutsHelp(), icon: 'fas fa-keyboard' }
        ];
    }

    toggleCommandPalette() {
        if (this.isCommandPaletteOpen()) {
            this.hideCommandPalette();
        } else {
            this.showCommandPalette();
        }
    }

    showCommandPalette() {
        if (!this.commandPalette) return;
        
        this.commandPalette.style.display = 'block';
        this.selectedCommandIndex = 0;
        this.filterCommands('');
        
        const commandInput = document.getElementById('command-input');
        if (commandInput) {
            commandInput.focus();
            commandInput.value = '';
        }
    }

    hideCommandPalette() {
        if (this.commandPalette) {
            this.commandPalette.style.display = 'none';
        }
    }

    isCommandPaletteOpen() {
        return this.commandPalette && this.commandPalette.style.display === 'block';
    }

    filterCommands(query) {
        const filteredCommands = this.commands.filter(cmd => 
            cmd.title.toLowerCase().includes(query.toLowerCase()) ||
            cmd.description.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderCommands(filteredCommands);
        this.selectedCommandIndex = 0;
        this.updateCommandSelection();
    }

    renderCommands(commands) {
        const resultsContainer = document.getElementById('command-results');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = '';
        
        if (commands.length === 0) {
            resultsContainer.innerHTML = '<div class="no-commands">No commands found</div>';
            return;
        }
        
        commands.forEach((cmd, index) => {
            const item = document.createElement('div');
            item.className = 'command-item';
            item.dataset.index = index;
            
            const shortcut = this.getShortcutForCommand(cmd);
            
            item.innerHTML = `
                <div class="command-icon">
                    <i class="${cmd.icon}"></i>
                </div>
                <div class="command-text">
                    <div class="command-title">${cmd.title}</div>
                    <div class="command-description">${cmd.description}</div>
                </div>
                ${shortcut ? `<div class="command-shortcut">${shortcut}</div>` : ''}
            `;
            
            item.addEventListener('click', () => {
                this.executeCommand(cmd);
            });
            
            resultsContainer.appendChild(item);
        });
    }

    getShortcutForCommand(command) {
        // Map commands to their shortcuts
        const shortcutMap = {
            'New Conversation': 'Ctrl+N',
            'Focus Input': 'Ctrl+K',
            'Toggle Voice': 'Ctrl+M',
            'Upload File': 'Ctrl+U',
            'Toggle Theme': 'Ctrl+Shift+T',
            'Settings': 'Ctrl+,',
            'Analytics': 'Ctrl+Shift+A',
            'File Manager': 'Ctrl+Shift+F',
            'Voice Settings': 'Ctrl+Shift+V',
            'Export Chat': 'Ctrl+Shift+E',
            'Clear Chat': 'Ctrl+Shift+C',
            'Toggle Sidebar': 'Ctrl+B',
            'Keyboard Shortcuts': 'Ctrl+/'
        };
        
        return shortcutMap[command.title] || '';
    }

    handleCommandPaletteKeys(e) {
        const resultsContainer = document.getElementById('command-results');
        const commandItems = resultsContainer?.querySelectorAll('.command-item');
        
        if (!commandItems || commandItems.length === 0) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedCommandIndex = Math.min(this.selectedCommandIndex + 1, commandItems.length - 1);
                this.updateCommandSelection();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.selectedCommandIndex = Math.max(this.selectedCommandIndex - 1, 0);
                this.updateCommandSelection();
                break;
                
            case 'Enter':
                e.preventDefault();
                const selectedCommand = this.getFilteredCommands()[this.selectedCommandIndex];
                if (selectedCommand) {
                    this.executeCommand(selectedCommand);
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                this.hideCommandPalette();
                break;
        }
    }

    updateCommandSelection() {
        const commandItems = document.querySelectorAll('.command-item');
        commandItems.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedCommandIndex);
        });
        
        // Scroll selected item into view
        const selectedItem = commandItems[this.selectedCommandIndex];
        if (selectedItem) {
            selectedItem.scrollIntoView({ block: 'nearest' });
        }
    }

    getFilteredCommands() {
        const query = document.getElementById('command-input')?.value || '';
        return this.commands.filter(cmd => 
            cmd.title.toLowerCase().includes(query.toLowerCase()) ||
            cmd.description.toLowerCase().includes(query.toLowerCase())
        );
    }

    executeCommand(command) {
        this.hideCommandPalette();
        command.action();
        this.trackShortcutUsage('command_palette_' + command.title.toLowerCase().replace(/\s+/g, '_'));
    }

    trackShortcutUsage(shortcut) {
        if (window.analyticsManager) {
            window.analyticsManager.trackUserAction('shortcut_used', shortcut);
        }
    }

    // Public API
    getShortcuts() {
        return Array.from(this.shortcuts.entries()).map(([key, data]) => ({
            key,
            description: data.description
        }));
    }

    addCustomShortcut(keys, callback, description) {
        this.addShortcut(keys, callback, description);
    }

    removeShortcut(keys) {
        this.shortcuts.delete(keys);
    }
}

// Initialize keyboard shortcuts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.keyboardShortcuts = new KeyboardShortcuts();
});
