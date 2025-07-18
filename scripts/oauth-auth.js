// OAuth Authentication System for Zeeky AI
// Supports Google, Apple, GitHub, and traditional email/password

class OAuthAuthenticationManager {
    constructor() {
        this.providers = {
            google: {
                clientId: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
                scope: 'openid email profile',
                redirectUri: `${window.location.origin}/auth/callback/google`
            },
            github: {
                clientId: 'your_github_client_id',
                scope: 'user:email',
                redirectUri: `${window.location.origin}/auth/callback/github`
            },
            apple: {
                clientId: 'com.zeekyai.app',
                scope: 'name email',
                redirectUri: `${window.location.origin}/auth/callback/apple`
            }
        };
        
        this.currentUser = null;
        this.authToken = null;
        this.init();
    }

    init() {
        this.loadStoredAuth();
        this.setupEventListeners();
        this.checkAuthCallback();
        this.createAuthUI();
    }

    loadStoredAuth() {
        const storedToken = localStorage.getItem('zeeky_auth_token');
        const storedUser = localStorage.getItem('zeeky_user');
        
        if (storedToken && storedUser) {
            this.authToken = storedToken;
            this.currentUser = JSON.parse(storedUser);
            this.updateAuthUI();
        }
    }

    setupEventListeners() {
        // Listen for auth state changes
        window.addEventListener('zeeky:auth:login', (event) => {
            this.handleAuthSuccess(event.detail);
        });

        window.addEventListener('zeeky:auth:logout', () => {
            this.handleLogout();
        });

        // Handle auth buttons
        document.addEventListener('click', (event) => {
            if (event.target.matches('[data-auth-provider]')) {
                const provider = event.target.dataset.authProvider;
                this.initiateOAuth(provider);
            }
            
            if (event.target.matches('#logout-btn')) {
                this.logout();
            }
            
            if (event.target.matches('#login-btn')) {
                this.showLoginModal();
            }
        });
    }

    checkAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const provider = urlParams.get('provider');
        
        if (code && state && provider) {
            this.handleOAuthCallback(provider, code, state);
        }
    }

    // OAuth Providers
    async initiateOAuth(provider) {
        const config = this.providers[provider];
        if (!config) {
            this.showError(`Unsupported provider: ${provider}`);
            return;
        }

        const state = this.generateState();
        localStorage.setItem('oauth_state', state);
        localStorage.setItem('oauth_provider', provider);

        let authUrl;
        
        switch (provider) {
            case 'google':
                authUrl = this.buildGoogleAuthUrl(config, state);
                break;
            case 'github':
                authUrl = this.buildGitHubAuthUrl(config, state);
                break;
            case 'apple':
                authUrl = this.buildAppleAuthUrl(config, state);
                break;
        }

        if (authUrl) {
            window.location.href = authUrl;
        }
    }

    buildGoogleAuthUrl(config, state) {
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            response_type: 'code',
            scope: config.scope,
            state: state,
            access_type: 'offline',
            prompt: 'consent'
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    buildGitHubAuthUrl(config, state) {
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            scope: config.scope,
            state: state,
            allow_signup: 'true'
        });

        return `https://github.com/login/oauth/authorize?${params.toString()}`;
    }

    buildAppleAuthUrl(config, state) {
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            response_type: 'code',
            scope: config.scope,
            state: state,
            response_mode: 'form_post'
        });

        return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
    }

    async handleOAuthCallback(provider, code, state) {
        const storedState = localStorage.getItem('oauth_state');
        const storedProvider = localStorage.getItem('oauth_provider');

        if (state !== storedState || provider !== storedProvider) {
            this.showError('Invalid OAuth state. Please try again.');
            return;
        }

        try {
            this.showLoading('Completing authentication...');
            
            const response = await fetch('/auth/oauth/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider,
                    code,
                    state
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.handleAuthSuccess(result.user, result.token);
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                this.showError(result.error || 'Authentication failed');
            }
        } catch (error) {
            this.showError('Authentication error: ' + error.message);
        } finally {
            this.hideLoading();
            localStorage.removeItem('oauth_state');
            localStorage.removeItem('oauth_provider');
        }
    }

    // Traditional Email/Password Authentication
    async loginWithEmail(email, password, rememberMe = false) {
        try {
            this.showLoading('Signing in...');
            
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    rememberMe
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.handleAuthSuccess(result.user, result.token);
                this.hideLoginModal();
            } else {
                this.showError(result.error || 'Login failed');
            }
        } catch (error) {
            this.showError('Login error: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async registerWithEmail(email, password, name, username) {
        try {
            this.showLoading('Creating account...');
            
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    username
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.handleAuthSuccess(result.user, result.token);
                this.hideLoginModal();
                this.showSuccess('Account created successfully!');
            } else {
                this.showError(result.error || 'Registration failed');
            }
        } catch (error) {
            this.showError('Registration error: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async logout() {
        try {
            await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
        } catch (error) {
            console.warn('Logout API call failed:', error);
        }

        this.handleLogout();
    }

    handleAuthSuccess(user, token) {
        this.currentUser = user;
        this.authToken = token;
        
        // Store auth data
        localStorage.setItem('zeeky_auth_token', token);
        localStorage.setItem('zeeky_user', JSON.stringify(user));
        
        // Update UI
        this.updateAuthUI();
        
        // Trigger auth success event
        window.dispatchEvent(new CustomEvent('zeeky:auth:success', {
            detail: { user, token }
        }));
        
        this.showSuccess(`Welcome back, ${user.name}!`);
    }

    handleLogout() {
        this.currentUser = null;
        this.authToken = null;
        
        // Clear stored data
        localStorage.removeItem('zeeky_auth_token');
        localStorage.removeItem('zeeky_user');
        
        // Update UI
        this.updateAuthUI();
        
        // Trigger logout event
        window.dispatchEvent(new CustomEvent('zeeky:auth:logout'));
        
        this.showSuccess('Logged out successfully');
    }

    updateAuthUI() {
        const authContainer = document.getElementById('auth-container');
        const userProfile = document.getElementById('user-profile');
        
        if (this.currentUser) {
            // User is logged in
            if (authContainer) {
                authContainer.style.display = 'none';
            }
            
            if (userProfile) {
                userProfile.style.display = 'flex';
                userProfile.innerHTML = `
                    <div class="user-avatar">
                        <img src="${this.currentUser.avatar || '/assets/default-avatar.png'}" alt="${this.currentUser.name}">
                    </div>
                    <div class="user-info">
                        <div class="user-name">${this.currentUser.name}</div>
                        <div class="user-email">${this.currentUser.email}</div>
                    </div>
                    <button id="logout-btn" class="logout-btn">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                `;
            }
        } else {
            // User is not logged in
            if (authContainer) {
                authContainer.style.display = 'flex';
            }
            
            if (userProfile) {
                userProfile.style.display = 'none';
            }
        }
    }

    createAuthUI() {
        // Create auth container if it doesn't exist
        if (!document.getElementById('auth-container')) {
            const authContainer = document.createElement('div');
            authContainer.id = 'auth-container';
            authContainer.className = 'auth-container';
            authContainer.innerHTML = `
                <button id="login-btn" class="auth-btn primary">
                    <i class="fas fa-sign-in-alt"></i>
                    Sign In
                </button>
            `;
            
            // Add to header
            const header = document.querySelector('header, .header');
            if (header) {
                header.appendChild(authContainer);
            }
        }

        // Create user profile container if it doesn't exist
        if (!document.getElementById('user-profile')) {
            const userProfile = document.createElement('div');
            userProfile.id = 'user-profile';
            userProfile.className = 'user-profile';
            userProfile.style.display = 'none';
            
            // Add to header
            const header = document.querySelector('header, .header');
            if (header) {
                header.appendChild(userProfile);
            }
        }
    }

    showLoginModal() {
        const modal = this.createLoginModal();
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.remove();
        }
    }

    createLoginModal() {
        const modal = document.createElement('div');
        modal.id = 'login-modal';
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <div class="auth-modal-header">
                    <h2>Sign in to Zeeky AI</h2>
                    <button class="close-btn" onclick="this.closest('.auth-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="auth-modal-body">
                    <!-- OAuth Providers -->
                    <div class="oauth-providers">
                        <button class="oauth-btn google" data-auth-provider="google">
                            <i class="fab fa-google"></i>
                            Continue with Google
                        </button>
                        <button class="oauth-btn github" data-auth-provider="github">
                            <i class="fab fa-github"></i>
                            Continue with GitHub
                        </button>
                        <button class="oauth-btn apple" data-auth-provider="apple">
                            <i class="fab fa-apple"></i>
                            Continue with Apple
                        </button>
                    </div>
                    
                    <div class="auth-divider">
                        <span>or</span>
                    </div>
                    
                    <!-- Email/Password Form -->
                    <form id="auth-form" class="auth-form">
                        <div class="form-tabs">
                            <button type="button" class="tab-btn active" data-tab="login">Sign In</button>
                            <button type="button" class="tab-btn" data-tab="register">Sign Up</button>
                        </div>
                        
                        <div class="tab-content" id="login-tab">
                            <div class="form-group">
                                <input type="email" id="login-email" placeholder="Email" required>
                            </div>
                            <div class="form-group">
                                <input type="password" id="login-password" placeholder="Password" required>
                            </div>
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="remember-me">
                                    <span>Remember me</span>
                                </label>
                            </div>
                            <button type="submit" class="auth-submit-btn">Sign In</button>
                        </div>
                        
                        <div class="tab-content" id="register-tab" style="display: none;">
                            <div class="form-group">
                                <input type="text" id="register-name" placeholder="Full Name" required>
                            </div>
                            <div class="form-group">
                                <input type="text" id="register-username" placeholder="Username" required>
                            </div>
                            <div class="form-group">
                                <input type="email" id="register-email" placeholder="Email" required>
                            </div>
                            <div class="form-group">
                                <input type="password" id="register-password" placeholder="Password" required>
                            </div>
                            <button type="submit" class="auth-submit-btn">Create Account</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add event listeners
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Tab switching
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                modal.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
                btn.classList.add('active');
                modal.getElementById(`${tab}-tab`).style.display = 'block';
            });
        });

        // Form submission
        modal.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const activeTab = modal.querySelector('.tab-btn.active').dataset.tab;
            
            if (activeTab === 'login') {
                const email = modal.getElementById('login-email').value;
                const password = modal.getElementById('login-password').value;
                const rememberMe = modal.getElementById('remember-me').checked;
                this.loginWithEmail(email, password, rememberMe);
            } else {
                const name = modal.getElementById('register-name').value;
                const username = modal.getElementById('register-username').value;
                const email = modal.getElementById('register-email').value;
                const password = modal.getElementById('register-password').value;
                this.registerWithEmail(email, password, name, username);
            }
        });

        return modal;
    }

    // Utility methods
    generateState() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    showLoading(message) {
        // Implementation for loading indicator
        console.log('Loading:', message);
    }

    hideLoading() {
        // Implementation for hiding loading indicator
        console.log('Loading complete');
    }

    showError(message) {
        if (window.ZeekyUtils) {
            window.ZeekyUtils.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    showSuccess(message) {
        if (window.ZeekyUtils) {
            window.ZeekyUtils.showNotification(message, 'success');
        } else {
            console.log('Success:', message);
        }
    }

    // Public API
    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getAuthToken() {
        return this.authToken;
    }
}

// Initialize OAuth Authentication Manager
document.addEventListener('DOMContentLoaded', () => {
    window.oauthAuth = new OAuthAuthenticationManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OAuthAuthenticationManager;
}
