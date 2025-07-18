// Polish and Optimization Script for Zeeky AI
class PolishAndOptimize {
    constructor() {
        this.optimizations = {};
        this.performanceMetrics = {};
        this.init();
    }

    init() {
        console.log('✨ Starting Polish and Optimization System...');
        this.runOptimizations();
    }

    async runOptimizations() {
        // Performance optimizations
        await this.optimizeImages();
        await this.optimizeScripts();
        await this.optimizeStyles();
        
        // UI polish
        await this.polishAnimations();
        await this.polishInteractions();
        await this.polishAccessibility();
        
        // Feature validation
        await this.validateAllFeatures();
        await this.validatePersonalities();
        
        // Performance monitoring
        await this.measurePerformance();
        
        // Generate optimization report
        this.generateOptimizationReport();
    }

    async optimizeImages() {
        console.log('🖼️ Optimizing images...');
        
        const images = document.querySelectorAll('img');
        let optimizedCount = 0;
        
        images.forEach(img => {
            // Add lazy loading if not present
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
                optimizedCount++;
            }
            
            // Add proper alt text if missing
            if (!img.hasAttribute('alt') || img.alt === '') {
                const src = img.src;
                if (src.includes('zeeky-logo')) {
                    img.alt = 'Zeeky AI Logo';
                } else {
                    img.alt = 'Image';
                }
                optimizedCount++;
            }
            
            // Add error handling
            if (!img.onerror) {
                img.onerror = function() {
                    this.style.display = 'none';
                    console.warn(`Failed to load image: ${this.src}`);
                };
                optimizedCount++;
            }
        });
        
        this.optimizations.images = {
            total: images.length,
            optimized: optimizedCount,
            status: 'COMPLETED'
        };
    }

    async optimizeScripts() {
        console.log('⚙️ Optimizing scripts...');
        
        const scripts = document.querySelectorAll('script[src]');
        let optimizedCount = 0;
        
        scripts.forEach(script => {
            // Add async loading for non-critical scripts
            if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
                if (!script.src.includes('main.js') && !script.src.includes('error-handler.js')) {
                    script.setAttribute('defer', '');
                    optimizedCount++;
                }
            }
        });
        
        this.optimizations.scripts = {
            total: scripts.length,
            optimized: optimizedCount,
            status: 'COMPLETED'
        };
    }

    async optimizeStyles() {
        console.log('🎨 Optimizing styles...');
        
        // Add critical CSS loading optimization
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        let optimizedCount = 0;
        
        stylesheets.forEach(link => {
            // Add preload for critical CSS
            if (link.href.includes('modern-ui.css') || link.href.includes('futuristic-dashboard.css')) {
                const preload = document.createElement('link');
                preload.rel = 'preload';
                preload.as = 'style';
                preload.href = link.href;
                preload.onload = function() { this.rel = 'stylesheet'; };
                document.head.insertBefore(preload, link);
                optimizedCount++;
            }
        });
        
        this.optimizations.styles = {
            total: stylesheets.length,
            optimized: optimizedCount,
            status: 'COMPLETED'
        };
    }

    async polishAnimations() {
        console.log('✨ Polishing animations...');
        
        // Add smooth transitions to interactive elements
        const interactiveElements = document.querySelectorAll('button, .card, .action-card, .dashboard-card, a');
        let polishedCount = 0;
        
        interactiveElements.forEach(element => {
            if (!element.style.transition) {
                element.style.transition = 'all 0.3s ease';
                polishedCount++;
            }
        });
        
        // Add hover effects to cards
        const cards = document.querySelectorAll('.card, .action-card, .dashboard-card');
        cards.forEach(card => {
            if (!card.classList.contains('hover-enhanced')) {
                card.classList.add('hover-enhanced');
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px)';
                    this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                });
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '';
                });
                polishedCount++;
            }
        });
        
        this.optimizations.animations = {
            elements: interactiveElements.length,
            polished: polishedCount,
            status: 'COMPLETED'
        };
    }

    async polishInteractions() {
        console.log('🖱️ Polishing interactions...');
        
        // Add ripple effect to buttons
        const buttons = document.querySelectorAll('button');
        let polishedCount = 0;
        
        buttons.forEach(button => {
            if (!button.classList.contains('ripple-enhanced')) {
                button.classList.add('ripple-enhanced');
                button.addEventListener('click', this.createRippleEffect);
                polishedCount++;
            }
        });
        
        // Add focus indicators
        const focusableElements = document.querySelectorAll('button, input, select, textarea, a');
        focusableElements.forEach(element => {
            if (!element.style.outline) {
                element.addEventListener('focus', function() {
                    this.style.outline = '2px solid #6366f1';
                    this.style.outlineOffset = '2px';
                });
                element.addEventListener('blur', function() {
                    this.style.outline = '';
                    this.style.outlineOffset = '';
                });
                polishedCount++;
            }
        });
        
        this.optimizations.interactions = {
            buttons: buttons.length,
            polished: polishedCount,
            status: 'COMPLETED'
        };
    }

    createRippleEffect(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    async polishAccessibility() {
        console.log('♿ Polishing accessibility...');
        
        let polishedCount = 0;
        
        // Add ARIA labels to interactive elements without text
        const interactiveElements = document.querySelectorAll('button, a, input');
        interactiveElements.forEach(element => {
            if (!element.textContent.trim() && !element.getAttribute('aria-label')) {
                if (element.querySelector('i[class*="fa-"]')) {
                    const iconClass = element.querySelector('i').className;
                    if (iconClass.includes('fa-search')) element.setAttribute('aria-label', 'Search');
                    else if (iconClass.includes('fa-menu')) element.setAttribute('aria-label', 'Menu');
                    else if (iconClass.includes('fa-close')) element.setAttribute('aria-label', 'Close');
                    else element.setAttribute('aria-label', 'Button');
                    polishedCount++;
                }
            }
        });
        
        // Add skip links for keyboard navigation
        if (!document.querySelector('.skip-link')) {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'skip-link';
            skipLink.textContent = 'Skip to main content';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                z-index: 10000;
            `;
            skipLink.addEventListener('focus', function() {
                this.style.top = '6px';
            });
            skipLink.addEventListener('blur', function() {
                this.style.top = '-40px';
            });
            document.body.insertBefore(skipLink, document.body.firstChild);
            polishedCount++;
        }
        
        this.optimizations.accessibility = {
            elements: interactiveElements.length,
            polished: polishedCount,
            status: 'COMPLETED'
        };
    }

    async validateAllFeatures() {
        console.log('🔍 Validating all features...');
        
        const features = {
            aiPersonalities: window.aiPersonalitiesManager,
            codeLaboratory: window.codeLaboratory,
            visionAI: window.visionAI,
            analytics: window.analyticsManager,
            themeManager: window.themeManager,
            errorHandler: window.errorHandler,
            loadingManager: window.loadingManager,
            universalSettings: window.universalSettings,
            universalNavigation: window.universalNavigation,
            edgeFunctionsClient: window.edgeFunctionsClient
        };
        
        const validFeatures = Object.entries(features).filter(([name, feature]) => feature).length;
        const totalFeatures = Object.keys(features).length;
        
        this.optimizations.features = {
            total: totalFeatures,
            valid: validFeatures,
            missing: totalFeatures - validFeatures,
            status: validFeatures === totalFeatures ? 'ALL_ACTIVE' : 'SOME_MISSING'
        };
    }

    async validatePersonalities() {
        console.log('🎭 Validating AI personalities...');
        
        if (!window.aiPersonalitiesManager) {
            this.optimizations.personalities = {
                status: 'MANAGER_MISSING',
                count: 0
            };
            return;
        }
        
        const allPersonalities = window.aiPersonalitiesManager.getAllPersonalities();
        const personalityCount = Object.keys(allPersonalities).length;
        
        // Check if all categories are present
        const expectedCategories = ['general', 'creative', 'technical', 'wellness', 'professional'];
        const availableCategories = Object.keys(window.aiPersonalitiesManager.personalities || {});
        const missingCategories = expectedCategories.filter(cat => !availableCategories.includes(cat));
        
        this.optimizations.personalities = {
            total: personalityCount,
            categories: availableCategories.length,
            missing: missingCategories,
            status: personalityCount >= 30 ? 'COMPLETE' : 'INCOMPLETE'
        };
    }

    async measurePerformance() {
        console.log('⚡ Measuring performance...');
        
        // Page load metrics
        const navigation = performance.getEntriesByType('navigation')[0];
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        
        // Memory usage (if available)
        let memoryUsage = 'N/A';
        if (performance.memory) {
            memoryUsage = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB';
        }
        
        // Resource count
        const resources = performance.getEntriesByType('resource');
        const scripts = resources.filter(r => r.name.endsWith('.js')).length;
        const styles = resources.filter(r => r.name.endsWith('.css')).length;
        const images = resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)).length;
        
        this.performanceMetrics = {
            loadTime: Math.round(loadTime),
            domContentLoaded: Math.round(domContentLoaded),
            memoryUsage,
            resources: {
                total: resources.length,
                scripts,
                styles,
                images
            }
        };
    }

    generateOptimizationReport() {
        const totalOptimizations = Object.values(this.optimizations).reduce((sum, opt) => {
            return sum + (opt.optimized || opt.polished || opt.valid || 0);
        }, 0);
        
        console.log('\n✨ POLISH & OPTIMIZATION REPORT');
        console.log('================================');
        console.log(`🔧 Total Optimizations Applied: ${totalOptimizations}`);
        console.log(`⚡ Page Load Time: ${this.performanceMetrics.loadTime}ms`);
        console.log(`🧠 Memory Usage: ${this.performanceMetrics.memoryUsage}`);
        console.log(`📁 Resources Loaded: ${this.performanceMetrics.resources.total}`);
        console.log('================================\n');
        
        // Detailed optimization results
        Object.entries(this.optimizations).forEach(([category, result]) => {
            const icon = result.status === 'COMPLETED' || result.status === 'ALL_ACTIVE' || result.status === 'COMPLETE' ? '✅' : '⚠️';
            console.log(`${icon} ${category.toUpperCase()}: ${result.status}`);
            
            if (result.total) console.log(`   Total: ${result.total}`);
            if (result.optimized) console.log(`   Optimized: ${result.optimized}`);
            if (result.polished) console.log(`   Polished: ${result.polished}`);
            if (result.valid) console.log(`   Valid: ${result.valid}`);
            if (result.missing && result.missing.length > 0) console.log(`   Missing: ${result.missing.join(', ')}`);
        });
        
        // Create visual report
        this.createVisualOptimizationReport(totalOptimizations);
    }

    createVisualOptimizationReport(totalOptimizations) {
        const reportContainer = document.createElement('div');
        reportContainer.id = 'optimization-report';
        reportContainer.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.9); color: white; padding: 20px; border-radius: 10px; z-index: 10000; max-width: 400px;">
                <h3>✨ Optimization Report</h3>
                <div style="margin: 10px 0;">
                    <div>🔧 Optimizations Applied: ${totalOptimizations}</div>
                    <div>⚡ Load Time: ${this.performanceMetrics.loadTime}ms</div>
                    <div>🧠 Memory: ${this.performanceMetrics.memoryUsage}</div>
                    <div>📁 Resources: ${this.performanceMetrics.resources.total}</div>
                </div>
                <div style="margin: 10px 0;">
                    <div style="color: #4ade80;">✅ Images: ${this.optimizations.images?.optimized || 0} optimized</div>
                    <div style="color: #4ade80;">✅ Scripts: ${this.optimizations.scripts?.optimized || 0} optimized</div>
                    <div style="color: #4ade80;">✅ Animations: ${this.optimizations.animations?.polished || 0} polished</div>
                    <div style="color: #4ade80;">✅ Features: ${this.optimizations.features?.valid || 0}/${this.optimizations.features?.total || 0} active</div>
                    <div style="color: #4ade80;">✅ Personalities: ${this.optimizations.personalities?.total || 0} available</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; background: #6366f1; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
        `;
        
        document.body.appendChild(reportContainer);
        
        // Auto-remove after 60 seconds
        setTimeout(() => {
            if (reportContainer.parentElement) {
                reportContainer.remove();
            }
        }, 60000);
    }
}

// Add ripple animation CSS
const rippleCSS = document.createElement('style');
rippleCSS.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleCSS);

// Auto-run optimization when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for all other systems to load
    setTimeout(() => {
        window.polishAndOptimize = new PolishAndOptimize();
    }, 4000);
});

// Export for manual testing
window.runOptimization = () => {
    new PolishAndOptimize();
};
