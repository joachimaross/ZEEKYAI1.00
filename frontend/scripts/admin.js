// Zeeky AI Admin Dashboard
class ZeekyAdmin {
    constructor() {
        this.apiBaseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:5000' 
            : 'https://your-backend-api.herokuapp.com';
        
        this.stats = {
            totalUsers: 1247,
            activeSessions: 89,
            messagesToday: 15432,
            systemHealth: 'Excellent'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.startRealTimeUpdates();
    }

    setupEventListeners() {
        // Control buttons
        document.getElementById('restart-system')?.addEventListener('click', () => this.restartSystem());
        document.getElementById('backup-data')?.addEventListener('click', () => this.backupData());
        document.getElementById('update-system')?.addEventListener('click', () => this.updateSystem());
        
        // Settings
        document.getElementById('theme-select')?.addEventListener('change', (e) => this.updateTheme(e.target.value));
        document.getElementById('font-size')?.addEventListener('change', (e) => this.updateFontSize(e.target.value));
        document.getElementById('sound-enabled')?.addEventListener('change', (e) => this.updateSoundSettings(e.target.checked));
        document.getElementById('auto-save')?.addEventListener('change', (e) => this.updateAutoSave(e.target.checked));
    }

    loadDashboardData() {
        this.updateStats();
        this.loadUserList();
        this.loadAnalytics();
        this.loadSystemStatus();
    }

    updateStats() {
        // Update overview stats with animation
        this.animateCounter('total-users', this.stats.totalUsers);
        this.animateCounter('active-sessions', this.stats.activeSessions);
        this.animateCounter('messages-today', this.stats.messagesToday);
        
        const healthElement = document.getElementById('system-health');
        if (healthElement) {
            healthElement.textContent = this.stats.systemHealth;
        }
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    loadUserList() {
        const userList = document.querySelector('.user-list');
        if (!userList) return;

        // Simulate user data
        const users = [
            { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', lastSeen: '2 minutes ago' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', lastSeen: '1 hour ago' },
            { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active', lastSeen: 'Just now' },
            { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'active', lastSeen: '5 minutes ago' },
            { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', status: 'inactive', lastSeen: '2 days ago' }
        ];

        userList.innerHTML = `
            <div class="user-list-header">
                <div class="user-header-item">Name</div>
                <div class="user-header-item">Email</div>
                <div class="user-header-item">Status</div>
                <div class="user-header-item">Last Seen</div>
                <div class="user-header-item">Actions</div>
            </div>
            ${users.map(user => `
                <div class="user-list-item">
                    <div class="user-item">${user.name}</div>
                    <div class="user-item">${user.email}</div>
                    <div class="user-item">
                        <span class="status-badge ${user.status}">${user.status}</span>
                    </div>
                    <div class="user-item">${user.lastSeen}</div>
                    <div class="user-item">
                        <button class="user-action-btn" onclick="zeekyAdmin.viewUser(${user.id})">View</button>
                        <button class="user-action-btn danger" onclick="zeekyAdmin.suspendUser(${user.id})">Suspend</button>
                    </div>
                </div>
            `).join('')}
        `;
    }

    loadAnalytics() {
        const chartContainer = document.getElementById('usage-chart');
        if (!chartContainer) return;

        // Simple chart placeholder
        chartContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">
                <div style="text-align: center;">
                    <i class="fas fa-chart-line" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p>Analytics chart would be displayed here</p>
                    <p style="font-size: 12px;">Integration with Chart.js or similar library needed</p>
                </div>
            </div>
        `;
    }

    loadSystemStatus() {
        // Simulate system status checks
        const systemChecks = [
            { name: 'Database', status: 'healthy', response: '12ms' },
            { name: 'API Server', status: 'healthy', response: '45ms' },
            { name: 'Cache', status: 'healthy', response: '3ms' },
            { name: 'Storage', status: 'warning', response: '156ms' },
            { name: 'External APIs', status: 'healthy', response: '89ms' }
        ];

        console.log('System Status:', systemChecks);
    }

    startRealTimeUpdates() {
        // Update stats every 30 seconds
        setInterval(() => {
            this.stats.activeSessions += Math.floor(Math.random() * 10) - 5;
            this.stats.messagesToday += Math.floor(Math.random() * 50);
            this.updateStats();
        }, 30000);
    }

    // Admin Actions
    async restartSystem() {
        if (!confirm('Are you sure you want to restart the system? This will temporarily interrupt service.')) {
            return;
        }

        try {
            ZeekyUtils.showNotification('System restart initiated...', 'info');
            // Simulate restart process
            await new Promise(resolve => setTimeout(resolve, 3000));
            ZeekyUtils.showNotification('System restarted successfully!', 'success');
        } catch (error) {
            ZeekyUtils.showNotification('Failed to restart system', 'error');
        }
    }

    async backupData() {
        try {
            ZeekyUtils.showNotification('Starting data backup...', 'info');
            // Simulate backup process
            await new Promise(resolve => setTimeout(resolve, 5000));
            ZeekyUtils.showNotification('Data backup completed successfully!', 'success');
        } catch (error) {
            ZeekyUtils.showNotification('Backup failed', 'error');
        }
    }

    async updateSystem() {
        if (!confirm('Are you sure you want to update the system? This may take several minutes.')) {
            return;
        }

        try {
            ZeekyUtils.showNotification('System update started...', 'info');
            // Simulate update process
            await new Promise(resolve => setTimeout(resolve, 8000));
            ZeekyUtils.showNotification('System updated successfully!', 'success');
        } catch (error) {
            ZeekyUtils.showNotification('System update failed', 'error');
        }
    }

    // User Management
    viewUser(userId) {
        ZeekyUtils.showNotification(`Viewing user ${userId}`, 'info');
        // Implementation for viewing user details
    }

    suspendUser(userId) {
        if (confirm(`Are you sure you want to suspend user ${userId}?`)) {
            ZeekyUtils.showNotification(`User ${userId} suspended`, 'info');
            // Implementation for suspending user
        }
    }

    // Settings
    updateTheme(theme) {
        localStorage.setItem('admin-theme', theme);
        if (window.zeekyAI) {
            window.zeekyAI.theme = theme;
            window.zeekyAI.setupTheme();
        }
    }

    updateFontSize(size) {
        localStorage.setItem('admin-font-size', size);
        document.documentElement.style.fontSize = size === 'small' ? '12px' : size === 'large' ? '16px' : '14px';
    }

    updateSoundSettings(enabled) {
        localStorage.setItem('admin-sound-enabled', enabled);
        ZeekyUtils.showNotification(`Sound ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }

    updateAutoSave(enabled) {
        localStorage.setItem('admin-auto-save', enabled);
        ZeekyUtils.showNotification(`Auto-save ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }
}

// Initialize admin when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.zeekyAdmin = new ZeekyAdmin();
});

// Add admin-specific styles
const adminStyles = `
    .user-list-header {
        display: grid;
        grid-template-columns: 1fr 1fr 100px 120px 120px;
        gap: 12px;
        padding: 12px;
        background: var(--bg-tertiary);
        border-radius: 8px;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 8px;
    }

    .user-list-item {
        display: grid;
        grid-template-columns: 1fr 1fr 100px 120px 120px;
        gap: 12px;
        padding: 12px;
        border-bottom: 1px solid var(--border-color);
        align-items: center;
    }

    .user-item {
        font-size: 13px;
        color: var(--text-primary);
    }

    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
    }

    .status-badge.active {
        background: var(--success-color);
        color: white;
    }

    .status-badge.inactive {
        background: var(--text-muted);
        color: white;
    }

    .user-action-btn {
        background: var(--accent-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 11px;
        cursor: pointer;
        margin-right: 4px;
        transition: var(--transition);
    }

    .user-action-btn:hover {
        opacity: 0.8;
    }

    .user-action-btn.danger {
        background: var(--danger-color);
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = adminStyles;
document.head.appendChild(styleSheet);
