// Analytics Extension for Zeeky AI
class AnalyticsManager {
    constructor() {
        this.sessionStart = Date.now();
        this.metrics = {
            totalMessages: 0,
            sessionTime: 0,
            filesUploaded: 0,
            conversationsStarted: 0,
            voiceInteractions: 0,
            errors: 0,
            responseTime: [],
            userActions: []
        };
        
        this.charts = {};
        this.isTracking = true;
        
        this.init();
    }

    init() {
        this.loadStoredMetrics();
        this.setupEventListeners();
        this.startSessionTracking();
        this.setupCharts();
    }

    loadStoredMetrics() {
        const saved = localStorage.getItem('zeeky_analytics');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.metrics = { ...this.metrics, ...data };
            } catch (e) {
                console.error('Failed to load analytics data:', e);
            }
        }
    }

    saveMetrics() {
        if (this.isTracking) {
            localStorage.setItem('zeeky_analytics', JSON.stringify(this.metrics));
        }
    }

    setupEventListeners() {
        // Analytics modal button
        const analyticsBtn = document.getElementById('analytics-btn');
        analyticsBtn?.addEventListener('click', () => {
            this.openAnalyticsModal();
        });

        // Analytics tabs
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchAnalyticsTab(tab.dataset.tab);
            });
        });

        // Track user interactions
        document.addEventListener('click', (e) => {
            this.trackUserAction('click', e.target.tagName, e.target.className);
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.trackUserAction('form_submit', e.target.name || 'unnamed_form');
        });
    }

    startSessionTracking() {
        // Update session time every minute
        setInterval(() => {
            this.metrics.sessionTime = Math.floor((Date.now() - this.sessionStart) / 1000);
            this.updateSessionTimeDisplay();
        }, 60000);

        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackUserAction('page_hidden');
            } else {
                this.trackUserAction('page_visible');
            }
        });

        // Track before unload
        window.addEventListener('beforeunload', () => {
            this.saveMetrics();
        });
    }

    setupCharts() {
        // Initialize Chart.js charts when modal is opened
        this.setupUsageChart();
        this.setupPerformanceChart();
    }

    setupUsageChart() {
        const ctx = document.getElementById('usage-chart');
        if (!ctx) return;

        // Generate sample data for the last 7 days
        const labels = [];
        const messageData = [];
        const fileData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            
            // Generate realistic sample data
            messageData.push(Math.floor(Math.random() * 50) + 10);
            fileData.push(Math.floor(Math.random() * 10) + 1);
        }

        this.charts.usage = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Messages',
                    data: messageData,
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Files Uploaded',
                    data: fileData,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Daily Usage Trends'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    setupPerformanceChart() {
        const ctx = document.getElementById('performance-chart');
        if (!ctx) return;

        // Generate sample response time data
        const labels = [];
        const responseData = [];
        
        for (let i = 23; i >= 0; i--) {
            const hour = new Date();
            hour.setHours(hour.getHours() - i);
            labels.push(hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
            
            // Generate realistic response times (0.5-3 seconds)
            responseData.push((Math.random() * 2.5 + 0.5).toFixed(2));
        }

        this.charts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Response Time (seconds)',
                    data: responseData,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Response Time (Last 24 Hours)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Seconds'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                }
            }
        });
    }

    openAnalyticsModal() {
        const modal = document.getElementById('analytics-modal');
        if (modal) {
            modal.classList.add('active');
            this.updateAnalyticsDisplay();
            this.refreshCharts();
        }
    }

    switchAnalyticsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update panels
        document.querySelectorAll('.analytics-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });

        // Refresh charts when switching tabs
        setTimeout(() => this.refreshCharts(), 100);
    }

    updateAnalyticsDisplay() {
        // Update metric displays
        document.getElementById('total-messages').textContent = this.metrics.totalMessages.toLocaleString();
        document.getElementById('session-time').textContent = this.formatTime(this.metrics.sessionTime);
        document.getElementById('files-uploaded').textContent = this.metrics.filesUploaded.toLocaleString();
        document.getElementById('total-conversations').textContent = this.metrics.conversationsStarted.toLocaleString();
        
        // Calculate average messages per conversation
        const avgMessages = this.metrics.conversationsStarted > 0 
            ? Math.round(this.metrics.totalMessages / this.metrics.conversationsStarted)
            : 0;
        document.getElementById('avg-messages').textContent = avgMessages.toLocaleString();

        // Calculate average response time
        const avgResponseTime = this.metrics.responseTime.length > 0
            ? (this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length).toFixed(1)
            : '0.0';
        document.getElementById('response-time').textContent = avgResponseTime + 's';

        // Calculate success rate
        const totalActions = this.metrics.totalMessages + this.metrics.errors;
        const successRate = totalActions > 0 
            ? (((totalActions - this.metrics.errors) / totalActions) * 100).toFixed(1)
            : '100.0';
        document.getElementById('success-rate').textContent = successRate + '%';
    }

    updateSessionTimeDisplay() {
        const element = document.getElementById('session-time');
        if (element) {
            element.textContent = this.formatTime(this.metrics.sessionTime);
        }
    }

    refreshCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    // Tracking methods
    trackMessage(isUser = false) {
        if (!this.isTracking) return;
        
        this.metrics.totalMessages++;
        this.trackUserAction('message_sent', isUser ? 'user' : 'bot');
        this.saveMetrics();
    }

    trackConversationStart() {
        if (!this.isTracking) return;
        
        this.metrics.conversationsStarted++;
        this.trackUserAction('conversation_started');
        this.saveMetrics();
    }

    trackFileUpload() {
        if (!this.isTracking) return;
        
        this.metrics.filesUploaded++;
        this.trackUserAction('file_uploaded');
        this.saveMetrics();
    }

    trackVoiceInteraction(type) {
        if (!this.isTracking) return;
        
        this.metrics.voiceInteractions++;
        this.trackUserAction('voice_interaction', type);
        this.saveMetrics();
    }

    trackResponseTime(startTime) {
        if (!this.isTracking) return;
        
        const responseTime = (Date.now() - startTime) / 1000;
        this.metrics.responseTime.push(responseTime);
        
        // Keep only last 100 response times to prevent memory issues
        if (this.metrics.responseTime.length > 100) {
            this.metrics.responseTime = this.metrics.responseTime.slice(-100);
        }
        
        this.saveMetrics();
    }

    trackError(errorType, errorMessage) {
        if (!this.isTracking) return;
        
        this.metrics.errors++;
        this.trackUserAction('error', errorType, errorMessage);
        this.saveMetrics();
    }

    trackUserAction(action, target = '', details = '') {
        if (!this.isTracking) return;
        
        const actionData = {
            timestamp: Date.now(),
            action: action,
            target: target,
            details: details,
            url: window.location.pathname
        };
        
        this.metrics.userActions.push(actionData);
        
        // Keep only last 1000 actions to prevent memory issues
        if (this.metrics.userActions.length > 1000) {
            this.metrics.userActions = this.metrics.userActions.slice(-1000);
        }
    }

    // Utility methods
    formatTime(seconds) {
        if (seconds < 60) {
            return seconds + 's';
        } else if (seconds < 3600) {
            return Math.floor(seconds / 60) + 'm';
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return hours + 'h ' + minutes + 'm';
        }
    }

    // Export data
    exportAnalytics() {
        const data = {
            metrics: this.metrics,
            exportDate: new Date().toISOString(),
            sessionDuration: Date.now() - this.sessionStart
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zeeky-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Privacy controls
    enableTracking() {
        this.isTracking = true;
        localStorage.setItem('zeeky_analytics_enabled', 'true');
    }

    disableTracking() {
        this.isTracking = false;
        localStorage.setItem('zeeky_analytics_enabled', 'false');
    }

    clearAnalytics() {
        if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
            this.metrics = {
                totalMessages: 0,
                sessionTime: 0,
                filesUploaded: 0,
                conversationsStarted: 0,
                voiceInteractions: 0,
                errors: 0,
                responseTime: [],
                userActions: []
            };
            
            localStorage.removeItem('zeeky_analytics');
            this.updateAnalyticsDisplay();
            
            if (window.ZeekyUtils) {
                window.ZeekyUtils.showNotification('Analytics data cleared', 'success');
            }
        }
    }

    // Public API
    getMetrics() {
        return { ...this.metrics };
    }

    isTrackingEnabled() {
        return this.isTracking;
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
});
