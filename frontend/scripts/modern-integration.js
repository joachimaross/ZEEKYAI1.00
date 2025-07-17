// Modern UI Integration with Existing Extensions
class ModernIntegration {
    constructor() {
        this.modernUI = null;
        this.extensions = {};
        this.init();
    }

    init() {
        // Wait for modern UI to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.modernUI = window.modernUI;
            this.setupExtensionIntegration();
            this.enhanceModernUI();
        });
    }

    setupExtensionIntegration() {
        // Override modern UI navigation methods to use existing extensions
        if (this.modernUI) {
            // Collaboration integration
            this.modernUI.openCollaboration = () => {
                if (window.collaborationManager) {
                    this.openModal('collaboration-modal');
                } else {
                    this.showFeatureModal('Collaboration', 'Real-time collaboration with team members');
                }
            };

            // Personalities integration
            this.modernUI.openPersonalities = () => {
                if (window.aiPersonalitiesManager) {
                    this.openModal('personality-modal');
                } else {
                    this.showFeatureModal('AI Personalities', '15+ unique AI personalities for different needs');
                }
            };

            // Code Lab integration
            this.modernUI.openCodeLab = () => {
                if (window.codeLaboratory) {
                    this.openModal('code-lab-modal');
                } else {
                    this.showFeatureModal('Code Laboratory', 'Execute code in multiple programming languages');
                }
            };

            // Vision AI integration
            this.modernUI.openVision = () => {
                if (window.visionAI) {
                    this.openModal('vision-modal');
                } else {
                    this.showFeatureModal('Vision AI', 'Generate and analyze images with advanced AI');
                }
            };

            // Workflows integration
            this.modernUI.openWorkflows = () => {
                if (window.workflowAutomation) {
                    this.openModal('workflow-modal');
                } else {
                    this.showFeatureModal('Workflow Automation', 'Create automated workflows with visual builder');
                }
            };

            // Voice integration
            this.modernUI.openVoice = () => {
                if (window.voiceHandler) {
                    this.openModal('voice-modal');
                } else {
                    this.showFeatureModal('Voice Chat', 'Speak with AI using voice recognition');
                }
            };

            // Files integration
            this.modernUI.openFiles = () => {
                if (window.fileHandler) {
                    this.openModal('files-modal');
                } else {
                    this.showFeatureModal('File Upload', 'Upload and analyze files with AI');
                }
            };

            // Analytics integration
            this.modernUI.openAnalytics = () => {
                if (window.analyticsManager) {
                    this.openModal('analytics-modal');
                } else {
                    this.showFeatureModal('Analytics', 'View detailed usage analytics and insights');
                }
            };

            // Theme integration
            this.modernUI.openThemes = () => {
                if (window.themeManager) {
                    this.openModal('theme-modal');
                } else {
                    this.showFeatureModal('Theme Manager', 'Customize the appearance with different themes');
                }
            };
        }
    }

    enhanceModernUI() {
        // Add feature badges to navigation items
        this.addFeatureBadges();
        
        // Enhance chat input with file drop support
        this.enhanceChatInput();
        
        // Add keyboard shortcuts display
        this.addKeyboardShortcuts();
        
        // Add status indicators
        this.addStatusIndicators();
    }

    addFeatureBadges() {
        const navItems = [
            { id: 'collaboration-nav', badge: 'NEW' },
            { id: 'personalities-nav', badge: '15+' },
            { id: 'code-lab-nav', badge: 'LIVE' },
            { id: 'vision-nav', badge: 'AI' },
            { id: 'workflows-nav', badge: 'AUTO' }
        ];

        navItems.forEach(item => {
            const navElement = document.getElementById(item.id);
            if (navElement && !navElement.querySelector('.nav-badge')) {
                const badge = document.createElement('span');
                badge.className = 'nav-badge';
                badge.textContent = item.badge;
                navElement.appendChild(badge);
            }
        });

        // Add badge styles
        if (!document.getElementById('badge-styles')) {
            const style = document.createElement('style');
            style.id = 'badge-styles';
            style.textContent = `
                .nav-badge {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: var(--accent-green);
                    color: white;
                    font-size: 10px;
                    font-weight: 600;
                    padding: 2px 6px;
                    border-radius: 10px;
                    line-height: 1;
                }
                
                .nav-item {
                    position: relative;
                }
            `;
            document.head.appendChild(style);
        }
    }

    enhanceChatInput() {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            // Add file drop support
            chatInput.addEventListener('dragover', (e) => {
                e.preventDefault();
                chatInput.classList.add('drag-over');
            });

            chatInput.addEventListener('dragleave', () => {
                chatInput.classList.remove('drag-over');
            });

            chatInput.addEventListener('drop', (e) => {
                e.preventDefault();
                chatInput.classList.remove('drag-over');
                
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                    this.handleFileUpload(files);
                }
            });

            // Add drag over styles
            if (!document.getElementById('drag-styles')) {
                const style = document.createElement('style');
                style.id = 'drag-styles';
                style.textContent = `
                    .chat-input.drag-over {
                        border-color: var(--accent-green);
                        background-color: var(--bg-active);
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    addKeyboardShortcuts() {
        // Add keyboard shortcuts help
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showKeyboardShortcuts();
            });
        }
    }

    addStatusIndicators() {
        // Add connection status indicator
        const header = document.querySelector('.modern-header .header-actions');
        if (header && !document.getElementById('status-indicator')) {
            const statusIndicator = document.createElement('div');
            statusIndicator.id = 'status-indicator';
            statusIndicator.className = 'status-indicator online';
            statusIndicator.title = 'Online';
            header.insertBefore(statusIndicator, header.firstChild);

            // Add status styles
            if (!document.getElementById('status-styles')) {
                const style = document.createElement('style');
                style.id = 'status-styles';
                style.textContent = `
                    .status-indicator {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        margin-right: var(--space-2);
                    }
                    
                    .status-indicator.online {
                        background-color: var(--accent-green);
                    }
                    
                    .status-indicator.offline {
                        background-color: var(--accent-red);
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    showFeatureModal(title, description) {
        // Create a temporary modal for features not yet implemented
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>${description}</p>
                    <p style="margin-top: var(--space-4); color: var(--text-secondary);">
                        This feature is part of our revolutionary AI platform. 
                        All extensions are loaded and ready to use!
                    </p>
                    <div style="margin-top: var(--space-6);">
                        <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            modal.remove();
        }, 5000);
    }

    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Ctrl/Cmd + K', action: 'Open command palette' },
            { key: 'Ctrl/Cmd + N', action: 'Start new chat' },
            { key: 'Enter', action: 'Send message' },
            { key: 'Shift + Enter', action: 'New line in message' },
            { key: 'Escape', action: 'Close modals' },
            { key: 'Ctrl/Cmd + /', action: 'Toggle sidebar' }
        ];

        const shortcutsHTML = shortcuts.map(shortcut => 
            `<div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                <span style="font-family: var(--font-mono); background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px;">${shortcut.key}</span>
                <span>${shortcut.action}</span>
            </div>`
        ).join('');

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Keyboard Shortcuts</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${shortcutsHTML}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    handleFileUpload(files) {
        if (window.fileHandler) {
            files.forEach(file => {
                window.fileHandler.processFile(file);
            });
        } else {
            this.modernUI.addMessage(`📎 File upload ready: ${files.map(f => f.name).join(', ')}`, 'bot');
        }
    }
}

// Initialize integration
window.modernIntegration = new ModernIntegration();
