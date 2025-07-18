// Website Components Checker - Ensures all essential components are present
class WebsiteComponentsChecker {
    constructor() {
        this.requiredComponents = this.getRequiredComponents();
        this.currentPage = this.detectCurrentPage();
        this.init();
    }

    init() {
        this.checkAllComponents();
        this.addMissingComponents();
        this.setupComponentMonitoring();
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        if (filename.includes('smart-home')) return 'smart-home';
        if (filename.includes('car-mode')) return 'car-mode';
        if (filename.includes('code-lab')) return 'code-lab';
        if (filename.includes('testing-dashboard')) return 'testing';
        if (filename.includes('advanced-dashboard')) return 'dashboard';
        if (filename.includes('index')) return 'home';
        
        return 'home';
    }

    getRequiredComponents() {
        return {
            // Essential HTML elements
            html: {
                selector: 'html',
                required: true,
                attributes: ['lang'],
                description: 'HTML root element with language attribute'
            },
            head: {
                selector: 'head',
                required: true,
                description: 'Document head section'
            },
            title: {
                selector: 'title',
                required: true,
                description: 'Page title'
            },
            metaCharset: {
                selector: 'meta[charset]',
                required: true,
                description: 'Character encoding meta tag'
            },
            metaViewport: {
                selector: 'meta[name="viewport"]',
                required: true,
                description: 'Viewport meta tag for responsive design'
            },
            metaDescription: {
                selector: 'meta[name="description"]',
                required: true,
                description: 'Page description meta tag'
            },
            favicon: {
                selector: 'link[rel="icon"], link[rel="shortcut icon"]',
                required: true,
                description: 'Favicon link'
            },
            
            // Navigation components
            navigation: {
                selector: 'nav, .nav, .navigation, .sidebar-nav',
                required: true,
                description: 'Main navigation element'
            },
            logo: {
                selector: '.logo, .logo-container, [alt*="logo"], [src*="logo"]',
                required: true,
                description: 'Website logo'
            },
            
            // Interactive elements
            buttons: {
                selector: 'button, .btn, input[type="button"], input[type="submit"]',
                required: true,
                description: 'Interactive buttons'
            },
            links: {
                selector: 'a[href]',
                required: true,
                description: 'Navigation links'
            },
            
            // Form elements (if applicable)
            inputs: {
                selector: 'input, textarea, select',
                required: false,
                description: 'Form input elements'
            },
            
            // Accessibility components
            skipLinks: {
                selector: '.skip-link, .skip-links a',
                required: true,
                description: 'Skip navigation links for accessibility'
            },
            headings: {
                selector: 'h1, h2, h3, h4, h5, h6',
                required: true,
                description: 'Heading elements for content structure'
            },
            
            // Essential scripts
            errorHandler: {
                selector: 'script[src*="error-handler"]',
                required: true,
                description: 'Error handling script'
            },
            universalNavigation: {
                selector: 'script[src*="universal-navigation"]',
                required: true,
                description: 'Universal navigation script'
            },
            universalSettings: {
                selector: 'script[src*="universal-settings"]',
                required: true,
                description: 'Universal settings script'
            },
            
            // Page-specific components
            chatInterface: {
                selector: '#chat-input, #message-input, textarea[placeholder*="message"], textarea[placeholder*="chat"]',
                required: this.currentPage === 'home',
                description: 'Chat interface input'
            },
            sendButton: {
                selector: '#send-btn, #send-button, button[onclick*="send"], .send-btn',
                required: this.currentPage === 'home',
                description: 'Send message button'
            },
            
            // Settings and controls
            settingsButton: {
                selector: '.settings-btn, #settings-btn, [title*="settings"], [aria-label*="settings"]',
                required: true,
                description: 'Settings access button'
            },
            
            // Footer (recommended)
            footer: {
                selector: 'footer, .footer',
                required: false,
                description: 'Page footer'
            }
        };
    }

    checkAllComponents() {
        this.componentStatus = {};
        
        Object.entries(this.requiredComponents).forEach(([key, component]) => {
            const elements = document.querySelectorAll(component.selector);
            const exists = elements.length > 0;
            
            this.componentStatus[key] = {
                exists: exists,
                count: elements.length,
                required: component.required,
                description: component.description,
                elements: Array.from(elements),
                component: component
            };
            
            // Check attributes if specified
            if (component.attributes && exists) {
                this.componentStatus[key].attributeStatus = {};
                component.attributes.forEach(attr => {
                    const hasAttribute = Array.from(elements).some(el => el.hasAttribute(attr));
                    this.componentStatus[key].attributeStatus[attr] = hasAttribute;
                });
            }
        });
    }

    addMissingComponents() {
        Object.entries(this.componentStatus).forEach(([key, status]) => {
            if (status.required && !status.exists) {
                this.createMissingComponent(key, status.component);
            }
        });
    }

    createMissingComponent(key, component) {
        console.warn(`Missing required component: ${key} - ${component.description}`);
        
        switch (key) {
            case 'skipLinks':
                this.createSkipLinks();
                break;
            case 'settingsButton':
                this.createSettingsButton();
                break;
            case 'metaDescription':
                this.createMetaDescription();
                break;
            case 'favicon':
                this.createFavicon();
                break;
            case 'chatInterface':
                if (this.currentPage === 'home') {
                    this.createChatInterface();
                }
                break;
            case 'sendButton':
                if (this.currentPage === 'home') {
                    this.createSendButton();
                }
                break;
            default:
                console.warn(`No auto-creation method for component: ${key}`);
        }
    }

    createSkipLinks() {
        if (document.getElementById('skip-links')) return;
        
        const skipLinks = document.createElement('div');
        skipLinks.id = 'skip-links';
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    createSettingsButton() {
        if (document.querySelector('.settings-btn, #settings-btn')) return;
        
        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'auto-created-settings-btn';
        settingsBtn.className = 'settings-btn';
        settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
        settingsBtn.title = 'Settings';
        settingsBtn.setAttribute('aria-label', 'Open settings');
        
        settingsBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 50%;
            color: #a1a1aa;
            cursor: pointer;
            z-index: 1000;
            backdrop-filter: blur(20px);
            transition: all 0.3s ease;
        `;
        
        settingsBtn.addEventListener('click', () => {
            if (window.universalSettings) {
                window.universalSettings.openSettings();
            } else {
                alert('Settings functionality not available');
            }
        });
        
        document.body.appendChild(settingsBtn);
    }

    createMetaDescription() {
        if (document.querySelector('meta[name="description"]')) return;
        
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = `Zeeky AI - ${this.getPageTitle()} - Advanced AI assistant with intelligent features`;
        
        document.head.appendChild(meta);
    }

    createFavicon() {
        if (document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')) return;
        
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/x-icon';
        favicon.href = 'assets/favicon.ico';
        
        document.head.appendChild(favicon);
    }

    createChatInterface() {
        if (document.querySelector('#chat-input, #message-input')) return;
        
        const chatContainer = document.createElement('div');
        chatContainer.className = 'auto-created-chat-interface';
        chatContainer.innerHTML = `
            <div class="chat-input-container">
                <textarea id="auto-created-chat-input" placeholder="Type your message here..." rows="3"></textarea>
                <button id="auto-created-send-btn" class="send-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        
        chatContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 600px;
            background: rgba(15, 15, 25, 0.9);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 12px;
            padding: 1rem;
            backdrop-filter: blur(20px);
            z-index: 1000;
        `;
        
        document.body.appendChild(chatContainer);
    }

    createSendButton() {
        const chatInput = document.querySelector('#chat-input, #message-input, textarea');
        if (!chatInput || document.querySelector('#send-btn, #send-button')) return;
        
        const sendBtn = document.createElement('button');
        sendBtn.id = 'auto-created-send-btn';
        sendBtn.className = 'send-btn';
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        sendBtn.title = 'Send message';
        sendBtn.setAttribute('aria-label', 'Send message');
        
        sendBtn.style.cssText = `
            margin-left: 10px;
            padding: 10px 15px;
            background: linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%);
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        chatInput.parentElement.appendChild(sendBtn);
    }

    getPageTitle() {
        const titles = {
            'home': 'Home',
            'dashboard': 'Dashboard',
            'smart-home': 'Smart Home',
            'car-mode': 'Car Mode',
            'code-lab': 'Code Lab',
            'testing': 'Testing'
        };
        return titles[this.currentPage] || 'Page';
    }

    setupComponentMonitoring() {
        // Monitor for dynamically added/removed components
        const observer = new MutationObserver((mutations) => {
            let shouldRecheck = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            shouldRecheck = true;
                        }
                    });
                }
            });
            
            if (shouldRecheck) {
                setTimeout(() => this.recheckComponents(), 1000);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    recheckComponents() {
        this.checkAllComponents();
        this.addMissingComponents();
    }

    // Public API
    getComponentStatus() {
        return this.componentStatus;
    }

    getMissingRequiredComponents() {
        return Object.entries(this.componentStatus)
            .filter(([key, status]) => status.required && !status.exists)
            .map(([key, status]) => ({
                key,
                description: status.description
            }));
    }

    generateReport() {
        const missing = this.getMissingRequiredComponents();
        const optional = Object.entries(this.componentStatus)
            .filter(([key, status]) => !status.required && !status.exists);
        
        return {
            page: this.currentPage,
            totalComponents: Object.keys(this.requiredComponents).length,
            presentComponents: Object.values(this.componentStatus).filter(s => s.exists).length,
            missingRequired: missing,
            missingOptional: optional.map(([key, status]) => ({
                key,
                description: status.description
            })),
            score: this.calculateScore()
        };
    }

    calculateScore() {
        const required = Object.values(this.componentStatus).filter(s => s.required);
        const present = required.filter(s => s.exists);
        return Math.round((present.length / required.length) * 100);
    }

    logReport() {
        const report = this.generateReport();
        console.group(`🔍 Website Components Report - ${report.page.toUpperCase()}`);
        console.log(`📊 Score: ${report.score}% (${report.presentComponents}/${report.totalComponents} components)`);
        
        if (report.missingRequired.length > 0) {
            console.group('❌ Missing Required Components:');
            report.missingRequired.forEach(comp => {
                console.warn(`• ${comp.key}: ${comp.description}`);
            });
            console.groupEnd();
        }
        
        if (report.missingOptional.length > 0) {
            console.group('⚠️ Missing Optional Components:');
            report.missingOptional.forEach(comp => {
                console.info(`• ${comp.key}: ${comp.description}`);
            });
            console.groupEnd();
        }
        
        console.groupEnd();
        return report;
    }
}

// Initialize Website Components Checker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.websiteComponentsChecker = new WebsiteComponentsChecker();
    
    // Log report after a short delay to allow other scripts to load
    setTimeout(() => {
        window.websiteComponentsChecker.logReport();
    }, 2000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebsiteComponentsChecker;
}
