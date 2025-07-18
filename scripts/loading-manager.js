// Zeeky AI Loading Manager - Enhanced UI Feedback
class LoadingManager {
    constructor() {
        this.activeLoaders = new Map();
        this.loadingQueue = [];
        this.globalLoadingState = false;
        
        this.setupLoadingStyles();
        this.createLoadingElements();
    }

    setupLoadingStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(2px);
            }

            .loading-spinner {
                width: 60px;
                height: 60px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid var(--accent-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            .loading-content {
                text-align: center;
                color: white;
            }

            .loading-text {
                margin-top: 16px;
                font-size: 16px;
                font-weight: 500;
            }

            .loading-progress {
                margin-top: 12px;
                width: 200px;
                height: 4px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
                overflow: hidden;
            }

            .loading-progress-bar {
                height: 100%;
                background: var(--accent-color);
                border-radius: 2px;
                transition: width 0.3s ease;
                width: 0%;
            }

            .inline-loader {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                color: var(--text-secondary);
                font-size: 14px;
            }

            .inline-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid rgba(0, 0, 0, 0.1);
                border-top: 2px solid var(--accent-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            .skeleton-loader {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
                border-radius: 4px;
            }

            .skeleton-text {
                height: 16px;
                margin-bottom: 8px;
            }

            .skeleton-text.large {
                height: 24px;
            }

            .skeleton-text.small {
                height: 12px;
                width: 60%;
            }

            .skeleton-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
            }

            .skeleton-button {
                height: 36px;
                width: 100px;
                border-radius: 6px;
            }

            .pulse-loader {
                animation: pulse 2s infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .loading-dots {
                display: inline-flex;
                gap: 4px;
            }

            .loading-dot {
                width: 8px;
                height: 8px;
                background: var(--accent-color);
                border-radius: 50%;
                animation: loading-dots 1.4s infinite ease-in-out;
            }

            .loading-dot:nth-child(1) { animation-delay: -0.32s; }
            .loading-dot:nth-child(2) { animation-delay: -0.16s; }

            @keyframes loading-dots {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }

            .button-loading {
                position: relative;
                pointer-events: none;
                opacity: 0.7;
            }

            .button-loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 16px;
                height: 16px;
                margin: -8px 0 0 -8px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            .button-loading .btn-text {
                opacity: 0;
            }
        `;
        document.head.appendChild(style);
    }

    createLoadingElements() {
        // Create global loading overlay
        this.globalOverlay = document.createElement('div');
        this.globalOverlay.className = 'loading-overlay';
        this.globalOverlay.style.display = 'none';
        this.globalOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading...</div>
                <div class="loading-progress">
                    <div class="loading-progress-bar"></div>
                </div>
            </div>
        `;
        document.body.appendChild(this.globalOverlay);
    }

    // Global loading methods
    showGlobalLoading(text = 'Loading...', showProgress = false) {
        this.globalLoadingState = true;
        this.globalOverlay.querySelector('.loading-text').textContent = text;
        this.globalOverlay.querySelector('.loading-progress').style.display = showProgress ? 'block' : 'none';
        this.globalOverlay.style.display = 'flex';
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    hideGlobalLoading() {
        this.globalLoadingState = false;
        this.globalOverlay.style.display = 'none';
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    updateGlobalProgress(percentage) {
        const progressBar = this.globalOverlay.querySelector('.loading-progress-bar');
        progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    }

    // Component-specific loading
    showComponentLoading(elementId, type = 'spinner', text = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const loaderId = `loader_${elementId}`;
        
        // Remove existing loader
        this.hideComponentLoading(elementId);
        
        let loader;
        switch (type) {
            case 'spinner':
                loader = this.createSpinnerLoader(text);
                break;
            case 'skeleton':
                loader = this.createSkeletonLoader(element);
                break;
            case 'dots':
                loader = this.createDotsLoader(text);
                break;
            case 'pulse':
                loader = this.createPulseLoader(element);
                break;
            default:
                loader = this.createSpinnerLoader(text);
        }
        
        loader.id = loaderId;
        loader.className += ' component-loader';
        
        // Store original content
        this.activeLoaders.set(loaderId, {
            element: element,
            originalContent: element.innerHTML,
            originalClasses: element.className
        });
        
        // Replace content with loader
        element.innerHTML = '';
        element.appendChild(loader);
        element.classList.add('loading-state');
    }

    hideComponentLoading(elementId) {
        const loaderId = `loader_${elementId}`;
        const loaderData = this.activeLoaders.get(loaderId);
        
        if (loaderData) {
            // Restore original content
            loaderData.element.innerHTML = loaderData.originalContent;
            loaderData.element.className = loaderData.originalClasses;
            
            this.activeLoaders.delete(loaderId);
        }
    }

    createSpinnerLoader(text) {
        const loader = document.createElement('div');
        loader.className = 'inline-loader';
        loader.innerHTML = `
            <div class="inline-spinner"></div>
            ${text ? `<span>${text}</span>` : ''}
        `;
        return loader;
    }

    createSkeletonLoader(element) {
        const loader = document.createElement('div');
        loader.className = 'skeleton-container';
        
        // Generate skeleton based on element type
        const elementType = element.tagName.toLowerCase();
        let skeletonHTML = '';
        
        switch (elementType) {
            case 'button':
                skeletonHTML = '<div class="skeleton-loader skeleton-button"></div>';
                break;
            case 'img':
                const width = element.offsetWidth || 200;
                const height = element.offsetHeight || 150;
                skeletonHTML = `<div class="skeleton-loader" style="width: ${width}px; height: ${height}px;"></div>`;
                break;
            default:
                // Generate text skeletons
                skeletonHTML = `
                    <div class="skeleton-loader skeleton-text large"></div>
                    <div class="skeleton-loader skeleton-text"></div>
                    <div class="skeleton-loader skeleton-text"></div>
                    <div class="skeleton-loader skeleton-text small"></div>
                `;
        }
        
        loader.innerHTML = skeletonHTML;
        return loader;
    }

    createDotsLoader(text) {
        const loader = document.createElement('div');
        loader.className = 'inline-loader';
        loader.innerHTML = `
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            ${text ? `<span>${text}</span>` : ''}
        `;
        return loader;
    }

    createPulseLoader(element) {
        const loader = document.createElement('div');
        loader.className = 'pulse-loader';
        loader.style.width = '100%';
        loader.style.height = element.offsetHeight + 'px';
        loader.style.background = 'var(--bg-secondary)';
        loader.style.borderRadius = '4px';
        return loader;
    }

    // Button loading states
    setButtonLoading(buttonId, loadingText = '') {
        const button = document.getElementById(buttonId);
        if (!button) return;

        button.classList.add('button-loading');
        button.disabled = true;
        
        if (loadingText) {
            const textSpan = button.querySelector('.btn-text') || button;
            textSpan.dataset.originalText = textSpan.textContent;
            textSpan.textContent = loadingText;
        }
    }

    removeButtonLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        button.classList.remove('button-loading');
        button.disabled = false;
        
        const textSpan = button.querySelector('.btn-text') || button;
        if (textSpan.dataset.originalText) {
            textSpan.textContent = textSpan.dataset.originalText;
            delete textSpan.dataset.originalText;
        }
    }

    // Form loading states
    setFormLoading(formId, disable = true) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.classList.add('form-loading');
        
        if (disable) {
            const inputs = form.querySelectorAll('input, textarea, select, button');
            inputs.forEach(input => {
                input.disabled = true;
            });
        }
    }

    removeFormLoading(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.classList.remove('form-loading');
        
        const inputs = form.querySelectorAll('input, textarea, select, button');
        inputs.forEach(input => {
            input.disabled = false;
        });
    }

    // Progress tracking
    createProgressTracker(id, total, text = 'Processing...') {
        const tracker = {
            id: id,
            current: 0,
            total: total,
            text: text,
            element: null
        };
        
        // Create progress element
        const progressElement = document.createElement('div');
        progressElement.className = 'progress-tracker';
        progressElement.innerHTML = `
            <div class="progress-text">${text}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div class="progress-stats">0 / ${total}</div>
        `;
        
        tracker.element = progressElement;
        return tracker;
    }

    updateProgress(tracker, current, text = null) {
        tracker.current = current;
        const percentage = (current / tracker.total) * 100;
        
        const fillElement = tracker.element.querySelector('.progress-fill');
        const statsElement = tracker.element.querySelector('.progress-stats');
        const textElement = tracker.element.querySelector('.progress-text');
        
        fillElement.style.width = `${percentage}%`;
        statsElement.textContent = `${current} / ${tracker.total}`;
        
        if (text) {
            textElement.textContent = text;
        }
    }

    // Utility methods
    showLoadingToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'loading-toast';
        toast.innerHTML = `
            <div class="inline-spinner"></div>
            <span>${message}</span>
        `;
        
        // Style the toast
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: '1000',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        });
        
        document.body.appendChild(toast);
        
        if (duration > 0) {
            setTimeout(() => {
                toast.remove();
            }, duration);
        }
        
        return toast;
    }

    // Async operation wrapper
    async withLoading(operation, options = {}) {
        const {
            global = false,
            elementId = null,
            buttonId = null,
            text = 'Loading...',
            type = 'spinner'
        } = options;

        try {
            // Show loading
            if (global) {
                this.showGlobalLoading(text);
            } else if (elementId) {
                this.showComponentLoading(elementId, type, text);
            } else if (buttonId) {
                this.setButtonLoading(buttonId, text);
            }

            // Execute operation
            const result = await operation();
            
            return result;
        } finally {
            // Hide loading
            if (global) {
                this.hideGlobalLoading();
            } else if (elementId) {
                this.hideComponentLoading(elementId);
            } else if (buttonId) {
                this.removeButtonLoading(buttonId);
            }
        }
    }

    // Cleanup
    clearAllLoaders() {
        this.hideGlobalLoading();
        
        this.activeLoaders.forEach((loaderData, loaderId) => {
            const elementId = loaderId.replace('loader_', '');
            this.hideComponentLoading(elementId);
        });
    }

    // Public API
    isLoading() {
        return this.globalLoadingState || this.activeLoaders.size > 0;
    }

    getActiveLoaders() {
        return Array.from(this.activeLoaders.keys());
    }
}

// Global loading manager instance
window.loadingManager = new LoadingManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}
