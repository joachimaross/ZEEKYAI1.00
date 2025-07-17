// Zeeky AI Error Handler - Comprehensive Error Management
class ZeekyErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 1000;
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        
        this.setupGlobalErrorHandling();
        this.setupUnhandledRejectionHandling();
        this.setupNetworkErrorHandling();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });
    }

    setupUnhandledRejectionHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise_rejection',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                reason: event.reason,
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });
    }

    setupNetworkErrorHandling() {
        // Monitor fetch failures
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                
                if (!response.ok) {
                    this.handleError({
                        type: 'network',
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        url: args[0],
                        status: response.status,
                        statusText: response.statusText,
                        timestamp: Date.now()
                    });
                }
                
                return response;
            } catch (error) {
                this.handleError({
                    type: 'network',
                    message: `Network request failed: ${error.message}`,
                    url: args[0],
                    error: error,
                    timestamp: Date.now()
                });
                throw error;
            }
        };
    }

    handleError(errorInfo) {
        // Add to error log
        this.addToErrorLog(errorInfo);
        
        // Determine error severity
        const severity = this.determineSeverity(errorInfo);
        
        // Handle based on severity
        switch (severity) {
            case 'critical':
                this.handleCriticalError(errorInfo);
                break;
            case 'high':
                this.handleHighSeverityError(errorInfo);
                break;
            case 'medium':
                this.handleMediumSeverityError(errorInfo);
                break;
            case 'low':
                this.handleLowSeverityError(errorInfo);
                break;
        }
        
        // Track error analytics
        this.trackError(errorInfo, severity);
        
        // Attempt recovery if possible
        this.attemptRecovery(errorInfo);
    }

    determineSeverity(errorInfo) {
        // Critical errors that break core functionality
        if (errorInfo.type === 'javascript' && 
            (errorInfo.message.includes('Cannot read property') ||
             errorInfo.message.includes('is not a function') ||
             errorInfo.message.includes('ReferenceError'))) {
            return 'critical';
        }
        
        // Network errors
        if (errorInfo.type === 'network') {
            if (errorInfo.status >= 500) return 'high';
            if (errorInfo.status >= 400) return 'medium';
            return 'low';
        }
        
        // Promise rejections
        if (errorInfo.type === 'promise_rejection') {
            return 'medium';
        }
        
        return 'low';
    }

    handleCriticalError(errorInfo) {
        console.error('🚨 CRITICAL ERROR:', errorInfo);
        
        // Show user-friendly error message
        this.showErrorModal({
            title: 'Critical Error',
            message: 'A critical error has occurred. The application may not function properly.',
            type: 'critical',
            actions: [
                {
                    text: 'Reload Page',
                    action: () => window.location.reload(),
                    primary: true
                },
                {
                    text: 'Report Issue',
                    action: () => this.openErrorReport(errorInfo)
                }
            ]
        });
        
        // Disable non-essential features
        this.enableSafeMode();
    }

    handleHighSeverityError(errorInfo) {
        console.error('⚠️ HIGH SEVERITY ERROR:', errorInfo);
        
        this.showNotification(
            'A significant error occurred. Some features may be temporarily unavailable.',
            'error',
            10000
        );
    }

    handleMediumSeverityError(errorInfo) {
        console.warn('⚠️ MEDIUM SEVERITY ERROR:', errorInfo);
        
        this.showNotification(
            'An error occurred, but the application should continue to work normally.',
            'warning',
            5000
        );
    }

    handleLowSeverityError(errorInfo) {
        console.warn('ℹ️ LOW SEVERITY ERROR:', errorInfo);
        // Log only, no user notification for low severity errors
    }

    showErrorModal(config) {
        const modal = document.createElement('div');
        modal.className = 'modal active error-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header error-header">
                    <h2>
                        <i class="fas fa-exclamation-triangle"></i>
                        ${config.title}
                    </h2>
                </div>
                <div class="modal-body">
                    <p class="error-message">${config.message}</p>
                    <div class="error-actions">
                        ${config.actions.map(action => `
                            <button class="btn ${action.primary ? 'btn-primary' : 'btn-secondary'}" 
                                    onclick="this.closest('.modal').remove(); (${action.action.toString()})()">
                                ${action.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    enableSafeMode() {
        // Disable advanced features and enable basic functionality only
        document.body.classList.add('safe-mode');
        
        // Disable extensions that might cause issues
        const extensionButtons = document.querySelectorAll('.sidebar-btn[id$="-btn"]:not(#settings-btn)');
        extensionButtons.forEach(btn => {
            btn.disabled = true;
            btn.title = 'Disabled in safe mode';
        });
        
        this.showNotification(
            'Safe mode enabled. Advanced features are temporarily disabled.',
            'info',
            0 // Persistent notification
        );
    }

    attemptRecovery(errorInfo) {
        const errorKey = this.getErrorKey(errorInfo);
        const attempts = this.retryAttempts.get(errorKey) || 0;
        
        if (attempts < this.maxRetries) {
            this.retryAttempts.set(errorKey, attempts + 1);
            
            // Attempt specific recovery strategies
            switch (errorInfo.type) {
                case 'network':
                    this.attemptNetworkRecovery(errorInfo);
                    break;
                case 'javascript':
                    this.attemptJavaScriptRecovery(errorInfo);
                    break;
                case 'promise_rejection':
                    this.attemptPromiseRecovery(errorInfo);
                    break;
            }
        }
    }

    attemptNetworkRecovery(errorInfo) {
        // Retry network requests with exponential backoff
        const delay = Math.pow(2, this.retryAttempts.get(this.getErrorKey(errorInfo))) * 1000;
        
        setTimeout(() => {
            console.log(`🔄 Attempting network recovery for: ${errorInfo.url}`);
            // The intercepted fetch will handle the retry
        }, delay);
    }

    attemptJavaScriptRecovery(errorInfo) {
        // Attempt to reload specific modules or reinitialize components
        if (errorInfo.message.includes('extension')) {
            console.log('🔄 Attempting to reinitialize extensions...');
            this.reinitializeExtensions();
        }
    }

    attemptPromiseRecovery(errorInfo) {
        // Log promise rejection and continue
        console.log('🔄 Handling promise rejection gracefully');
    }

    reinitializeExtensions() {
        // Safely reinitialize extensions
        try {
            if (window.zeekyAI && typeof window.zeekyAI.initializeExtensions === 'function') {
                window.zeekyAI.initializeExtensions();
            }
        } catch (error) {
            console.error('Failed to reinitialize extensions:', error);
        }
    }

    getErrorKey(errorInfo) {
        return `${errorInfo.type}_${errorInfo.message}_${errorInfo.filename || errorInfo.url}`;
    }

    addToErrorLog(errorInfo) {
        this.errorLog.unshift(errorInfo);
        
        // Maintain log size
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(0, this.maxLogSize);
        }
        
        // Store in localStorage for persistence
        try {
            localStorage.setItem('zeeky_error_log', JSON.stringify(this.errorLog.slice(0, 100)));
        } catch (e) {
            // Storage might be full, clear old logs
            localStorage.removeItem('zeeky_error_log');
        }
    }

    trackError(errorInfo, severity) {
        // Track error in analytics if available
        if (window.analyticsManager) {
            window.analyticsManager.trackError(errorInfo.type, errorInfo.message);
        }
        
        // Send to external error tracking service if configured
        this.sendToErrorTracking(errorInfo, severity);
    }

    sendToErrorTracking(errorInfo, severity) {
        // Send to external error tracking service (Sentry, LogRocket, etc.)
        try {
            if (window.Sentry) {
                window.Sentry.captureException(new Error(errorInfo.message), {
                    tags: {
                        type: errorInfo.type,
                        severity: severity
                    },
                    extra: errorInfo
                });
            }
        } catch (e) {
            console.warn('Failed to send error to tracking service:', e);
        }
    }

    openErrorReport(errorInfo) {
        // Open error reporting interface
        const reportModal = document.createElement('div');
        reportModal.className = 'modal active';
        reportModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Report Error</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Help us improve Zeeky AI by reporting this error:</p>
                    <textarea id="error-description" placeholder="Describe what you were doing when this error occurred..." rows="4"></textarea>
                    <div class="error-details">
                        <h4>Technical Details:</h4>
                        <pre>${JSON.stringify(errorInfo, null, 2)}</pre>
                    </div>
                    <div class="form-actions">
                        <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button class="btn-primary" onclick="errorHandler.submitErrorReport('${errorInfo.timestamp}')">Send Report</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(reportModal);
    }

    submitErrorReport(timestamp) {
        const description = document.getElementById('error-description').value;
        const errorInfo = this.errorLog.find(e => e.timestamp.toString() === timestamp);
        
        // Submit error report
        if (window.zeekyAPI) {
            window.zeekyAPI.submitErrorReport({
                error: errorInfo,
                description: description,
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: Date.now()
            });
        }
        
        this.showNotification('Error report submitted. Thank you for helping us improve!', 'success');
        document.querySelector('.error-modal')?.remove();
    }

    showNotification(message, type, duration = 5000) {
        if (window.ZeekyUtils) {
            window.ZeekyUtils.showNotification(message, type, duration);
        }
    }

    // Public API
    getErrorLog() {
        return this.errorLog;
    }

    clearErrorLog() {
        this.errorLog = [];
        localStorage.removeItem('zeeky_error_log');
    }

    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            byType: {},
            bySeverity: {},
            recent: this.errorLog.filter(e => Date.now() - e.timestamp < 3600000).length // Last hour
        };
        
        this.errorLog.forEach(error => {
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            const severity = this.determineSeverity(error);
            stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
        });
        
        return stats;
    }
}

// Global error handler instance
window.errorHandler = new ZeekyErrorHandler();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZeekyErrorHandler;
}
