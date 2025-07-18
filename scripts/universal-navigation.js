// Universal Navigation System for Zeeky AI
class UniversalNavigation {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.navigationData = this.getNavigationData();
        this.init();
    }

    init() {
        this.createBreadcrumbs();
        this.setupKeyboardNavigation();
        this.setupAccessibility();
        this.highlightCurrentPage();
        this.setupMobileNavigation();
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

    getNavigationData() {
        return {
            home: {
                title: 'Zeeky AI Home',
                path: 'index.html',
                icon: 'fas fa-home',
                description: 'Main AI assistant interface'
            },
            dashboard: {
                title: 'Advanced Dashboard',
                path: 'advanced-dashboard.html',
                icon: 'fas fa-tachometer-alt',
                description: 'Comprehensive system overview'
            },
            'smart-home': {
                title: 'Smart Home Control',
                path: 'smart-home.html',
                icon: 'fas fa-house-user',
                description: 'IoT device management'
            },
            'car-mode': {
                title: 'Car Mode',
                path: 'car-mode.html',
                icon: 'fas fa-car',
                description: 'Automotive AI assistant'
            },
            'code-lab': {
                title: 'Code Laboratory',
                path: 'features/code-lab.html',
                icon: 'fas fa-code',
                description: 'Development environment'
            },
            testing: {
                title: 'Testing Dashboard',
                path: 'testing-dashboard.html',
                icon: 'fas fa-vial',
                description: 'System testing and diagnostics'
            }
        };
    }

    createBreadcrumbs() {
        // Remove existing breadcrumbs
        const existing = document.getElementById('universal-breadcrumbs');
        if (existing) existing.remove();

        const breadcrumbs = document.createElement('nav');
        breadcrumbs.id = 'universal-breadcrumbs';
        breadcrumbs.className = 'universal-breadcrumbs';
        breadcrumbs.setAttribute('aria-label', 'Breadcrumb navigation');

        const currentPageData = this.navigationData[this.currentPage];
        
        breadcrumbs.innerHTML = `
            <div class="breadcrumb-container">
                <div class="breadcrumb-item">
                    <a href="index.html" class="breadcrumb-link">
                        <i class="fas fa-home"></i>
                        <span>Home</span>
                    </a>
                </div>
                ${this.currentPage !== 'home' ? `
                    <div class="breadcrumb-separator">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                    <div class="breadcrumb-item current">
                        <i class="${currentPageData.icon}"></i>
                        <span>${currentPageData.title}</span>
                    </div>
                ` : ''}
            </div>
        `;

        // Insert breadcrumbs at the top of the page
        const header = document.querySelector('header, .dashboard-header, .modern-header');
        if (header) {
            header.insertAdjacentElement('afterend', breadcrumbs);
        } else {
            document.body.insertBefore(breadcrumbs, document.body.firstChild);
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Alt + H = Home
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.navigateTo('home');
            }
            // Alt + D = Dashboard
            if (e.altKey && e.key === 'd') {
                e.preventDefault();
                this.navigateTo('dashboard');
            }
            // Alt + S = Smart Home
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                this.navigateTo('smart-home');
            }
            // Alt + C = Car Mode
            if (e.altKey && e.key === 'c') {
                e.preventDefault();
                this.navigateTo('car-mode');
            }
            // Alt + L = Code Lab
            if (e.altKey && e.key === 'l') {
                e.preventDefault();
                this.navigateTo('code-lab');
            }
            // Alt + T = Testing
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.navigateTo('testing');
            }
        });
    }

    setupAccessibility() {
        // Add skip links
        this.createSkipLinks();
        
        // Ensure all interactive elements have proper ARIA labels
        this.enhanceAccessibility();
        
        // Add focus indicators
        this.addFocusIndicators();
    }

    createSkipLinks() {
        const existing = document.getElementById('skip-links');
        if (existing) existing.remove();

        const skipLinks = document.createElement('div');
        skipLinks.id = 'skip-links';
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
            <a href="#footer" class="skip-link">Skip to footer</a>
        `;

        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    enhanceAccessibility() {
        // Add ARIA labels to navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            if (!item.getAttribute('aria-label')) {
                const text = item.textContent.trim();
                item.setAttribute('aria-label', `Navigate to ${text}`);
            }
        });

        // Add role attributes
        const nav = document.querySelector('nav, .sidebar-nav');
        if (nav && !nav.getAttribute('role')) {
            nav.setAttribute('role', 'navigation');
        }

        // Add main content landmark
        const main = document.querySelector('main, .main-content');
        if (main) {
            main.id = 'main-content';
            if (!main.getAttribute('role')) {
                main.setAttribute('role', 'main');
            }
        }
    }

    addFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            .focus-visible {
                outline: 2px solid var(--accent-cyan, #06b6d4) !important;
                outline-offset: 2px !important;
            }
            
            .skip-links {
                position: absolute;
                top: -100px;
                left: 0;
                z-index: 9999;
            }
            
            .skip-link {
                position: absolute;
                top: -100px;
                left: 0;
                background: var(--card-bg, #1a1a1a);
                color: var(--text-primary, white);
                padding: 0.5rem 1rem;
                text-decoration: none;
                border-radius: 4px;
                transition: top 0.3s ease;
            }
            
            .skip-link:focus {
                top: 10px;
            }
            
            .universal-breadcrumbs {
                background: var(--glass-bg, rgba(255, 255, 255, 0.05));
                backdrop-filter: blur(10px);
                border-bottom: 1px solid var(--border-glow, rgba(99, 102, 241, 0.3));
                padding: 0.75rem 2rem;
                position: sticky;
                top: 0;
                z-index: 99;
            }
            
            .breadcrumb-container {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .breadcrumb-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .breadcrumb-link {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: var(--text-secondary, #a1a1aa);
                text-decoration: none;
                padding: 0.25rem 0.5rem;
                border-radius: 6px;
                transition: all 0.3s ease;
            }
            
            .breadcrumb-link:hover {
                color: var(--text-primary, white);
                background: var(--glass-bg, rgba(255, 255, 255, 0.1));
            }
            
            .breadcrumb-item.current {
                color: var(--text-primary, white);
                font-weight: 600;
            }
            
            .breadcrumb-separator {
                color: var(--text-secondary, #a1a1aa);
                font-size: 0.75rem;
            }
            
            @media (max-width: 768px) {
                .universal-breadcrumbs {
                    padding: 0.5rem 1rem;
                }
                
                .breadcrumb-item span {
                    display: none;
                }
                
                .breadcrumb-item i {
                    font-size: 1.1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    highlightCurrentPage() {
        // Highlight current page in navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href') || item.getAttribute('onclick');
            if (href && href.includes(this.navigationData[this.currentPage].path)) {
                item.classList.add('active', 'current-page');
                item.setAttribute('aria-current', 'page');
            }
        });
    }

    setupMobileNavigation() {
        // Create mobile navigation menu if it doesn't exist
        this.createMobileMenu();
        
        // Setup mobile menu toggle
        this.setupMobileMenuToggle();
    }

    createMobileMenu() {
        const existing = document.getElementById('mobile-nav-menu');
        if (existing) return;

        const mobileMenu = document.createElement('div');
        mobileMenu.id = 'mobile-nav-menu';
        mobileMenu.className = 'mobile-nav-menu';
        mobileMenu.innerHTML = `
            <div class="mobile-nav-header">
                <img src="assets/zeeky-logo.svg" alt="Zeeky AI" class="mobile-nav-logo">
                <button class="mobile-nav-close" id="mobile-nav-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <nav class="mobile-nav-items">
                ${Object.entries(this.navigationData).map(([key, data]) => `
                    <a href="${data.path}" class="mobile-nav-item ${key === this.currentPage ? 'active' : ''}">
                        <i class="${data.icon}"></i>
                        <span>${data.title}</span>
                        <small>${data.description}</small>
                    </a>
                `).join('')}
            </nav>
        `;

        document.body.appendChild(mobileMenu);
    }

    setupMobileMenuToggle() {
        // Mobile menu toggle button
        const toggleBtn = document.querySelector('#mobile-menu-toggle, .mobile-menu-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Close button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'mobile-nav-close') {
                this.closeMobileMenu();
            }
        });

        // Close on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.id === 'mobile-nav-menu') {
                this.closeMobileMenu();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        const menu = document.getElementById('mobile-nav-menu');
        menu.classList.toggle('active');
        document.body.classList.toggle('mobile-menu-open');
    }

    closeMobileMenu() {
        const menu = document.getElementById('mobile-nav-menu');
        menu.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
    }

    navigateTo(pageKey) {
        const pageData = this.navigationData[pageKey];
        if (pageData) {
            window.location.href = pageData.path;
        }
    }

    // Public API
    getCurrentPage() {
        return this.currentPage;
    }

    getNavigationData() {
        return this.navigationData;
    }

    addNavigationItem(key, data) {
        this.navigationData[key] = data;
        this.createBreadcrumbs(); // Refresh breadcrumbs
    }

    removeNavigationItem(key) {
        delete this.navigationData[key];
        this.createBreadcrumbs(); // Refresh breadcrumbs
    }
}

// Initialize Universal Navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.universalNavigation = new UniversalNavigation();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalNavigation;
}
