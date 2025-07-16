"""
🔐 ZEEKY USER AUTHENTICATION SYSTEM
Advanced user management with OAuth, JWT, and role-based access
"""

import asyncio
import json
import hashlib
import jwt
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import uuid

class AuthSystem:
    """Advanced Authentication System"""
    
    def __init__(self):
        self.users = {}
        self.sessions = {}
        self.oauth_providers = self._initialize_oauth_providers()
        self.roles = self._initialize_roles()
        self.permissions = self._initialize_permissions()
        self.jwt_secret = secrets.token_urlsafe(32)
        self.password_hasher = PasswordHasher()
        self.session_manager = SessionManager()
        
    def _initialize_oauth_providers(self):
        """Initialize OAuth providers"""
        return {
            "google": {
                "name": "Google",
                "client_id": "google_client_id",
                "client_secret": "google_client_secret",
                "auth_url": "https://accounts.google.com/oauth/authorize",
                "token_url": "https://oauth2.googleapis.com/token",
                "user_info_url": "https://www.googleapis.com/oauth2/v2/userinfo",
                "scopes": ["openid", "email", "profile"]
            },
            "github": {
                "name": "GitHub",
                "client_id": "github_client_id",
                "client_secret": "github_client_secret",
                "auth_url": "https://github.com/login/oauth/authorize",
                "token_url": "https://github.com/login/oauth/access_token",
                "user_info_url": "https://api.github.com/user",
                "scopes": ["user:email"]
            },
            "apple": {
                "name": "Apple",
                "client_id": "apple_client_id",
                "client_secret": "apple_client_secret",
                "auth_url": "https://appleid.apple.com/auth/authorize",
                "token_url": "https://appleid.apple.com/auth/token",
                "user_info_url": "https://appleid.apple.com/auth/userinfo",
                "scopes": ["name", "email"]
            },
            "microsoft": {
                "name": "Microsoft",
                "client_id": "microsoft_client_id",
                "client_secret": "microsoft_client_secret",
                "auth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
                "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
                "user_info_url": "https://graph.microsoft.com/v1.0/me",
                "scopes": ["openid", "profile", "email"]
            }
        }
    
    def _initialize_roles(self):
        """Initialize user roles"""
        return {
            "user": {
                "name": "User",
                "description": "Standard user with basic access",
                "permissions": ["read_content", "create_content", "edit_own_content"]
            },
            "premium": {
                "name": "Premium User",
                "description": "Premium user with enhanced features",
                "permissions": ["read_content", "create_content", "edit_own_content", "advanced_features", "priority_support"]
            },
            "creator": {
                "name": "Content Creator",
                "description": "Content creator with marketplace access",
                "permissions": ["read_content", "create_content", "edit_own_content", "marketplace_sell", "analytics_access"]
            },
            "admin": {
                "name": "Administrator",
                "description": "System administrator with full access",
                "permissions": ["*"]  # All permissions
            },
            "moderator": {
                "name": "Moderator",
                "description": "Content moderator",
                "permissions": ["read_content", "moderate_content", "manage_users", "view_reports"]
            }
        }
    
    def _initialize_permissions(self):
        """Initialize system permissions"""
        return [
            "read_content", "create_content", "edit_own_content", "delete_own_content",
            "edit_any_content", "delete_any_content", "moderate_content",
            "manage_users", "view_analytics", "advanced_features", "priority_support",
            "marketplace_sell", "marketplace_buy", "api_access", "admin_panel"
        ]
    
    async def register_user(self, email: str, password: str, username: str, 
                          profile_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Register new user"""
        try:
            # Validate input
            validation = await self._validate_registration(email, password, username)
            if not validation["valid"]:
                return {"success": False, "errors": validation["errors"]}
            
            # Hash password
            password_hash = await self.password_hasher.hash_password(password)
            
            # Create user
            user_id = str(uuid.uuid4())
            user = {
                "id": user_id,
                "email": email.lower(),
                "username": username,
                "password_hash": password_hash,
                "role": "user",
                "profile": profile_data or {},
                "email_verified": False,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "last_login": None,
                "login_count": 0,
                "status": "active",
                "preferences": self._get_default_preferences(),
                "oauth_accounts": {}
            }
            
            # Store user
            self.users[user_id] = user
            
            # Send verification email
            verification_token = await self._generate_verification_token(user_id)
            await self._send_verification_email(email, verification_token)
            
            return {
                "success": True,
                "user_id": user_id,
                "message": "User registered successfully. Please check your email for verification.",
                "verification_required": True
            }
            
        except Exception as e:
            return {"success": False, "error": f"Registration failed: {str(e)}"}
    
    async def _validate_registration(self, email: str, password: str, username: str) -> Dict[str, Any]:
        """Validate registration data"""
        errors = []
        
        # Email validation
        if not email or "@" not in email:
            errors.append("Invalid email address")
        elif any(user["email"] == email.lower() for user in self.users.values()):
            errors.append("Email already registered")
        
        # Password validation
        if not password or len(password) < 8:
            errors.append("Password must be at least 8 characters")
        elif not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter")
        elif not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter")
        elif not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number")
        
        # Username validation
        if not username or len(username) < 3:
            errors.append("Username must be at least 3 characters")
        elif any(user["username"] == username for user in self.users.values()):
            errors.append("Username already taken")
        
        return {"valid": len(errors) == 0, "errors": errors}
    
    async def login_user(self, email: str, password: str) -> Dict[str, Any]:
        """Login user with email and password"""
        try:
            # Find user
            user = next((u for u in self.users.values() if u["email"] == email.lower()), None)
            if not user:
                return {"success": False, "error": "Invalid email or password"}
            
            # Verify password
            if not await self.password_hasher.verify_password(password, user["password_hash"]):
                return {"success": False, "error": "Invalid email or password"}
            
            # Check if email is verified
            if not user["email_verified"]:
                return {"success": False, "error": "Please verify your email before logging in"}
            
            # Check user status
            if user["status"] != "active":
                return {"success": False, "error": "Account is suspended"}
            
            # Create session
            session = await self.session_manager.create_session(user["id"])
            
            # Generate JWT token
            token = await self._generate_jwt_token(user["id"], session["id"])
            
            # Update user login info
            user["last_login"] = datetime.now().isoformat()
            user["login_count"] += 1
            user["updated_at"] = datetime.now().isoformat()
            
            return {
                "success": True,
                "user": self._sanitize_user_data(user),
                "token": token,
                "session_id": session["id"],
                "expires_at": session["expires_at"]
            }
            
        except Exception as e:
            return {"success": False, "error": f"Login failed: {str(e)}"}
    
    async def oauth_login(self, provider: str, oauth_code: str) -> Dict[str, Any]:
        """Login with OAuth provider"""
        try:
            if provider not in self.oauth_providers:
                return {"success": False, "error": "Unsupported OAuth provider"}
            
            # Exchange code for token
            oauth_token = await self._exchange_oauth_code(provider, oauth_code)
            if not oauth_token["success"]:
                return oauth_token
            
            # Get user info from provider
            user_info = await self._get_oauth_user_info(provider, oauth_token["access_token"])
            if not user_info["success"]:
                return user_info
            
            # Find or create user
            user = await self._find_or_create_oauth_user(provider, user_info["user_data"])
            
            # Create session
            session = await self.session_manager.create_session(user["id"])
            
            # Generate JWT token
            token = await self._generate_jwt_token(user["id"], session["id"])
            
            # Update login info
            user["last_login"] = datetime.now().isoformat()
            user["login_count"] += 1
            user["updated_at"] = datetime.now().isoformat()
            
            return {
                "success": True,
                "user": self._sanitize_user_data(user),
                "token": token,
                "session_id": session["id"],
                "expires_at": session["expires_at"],
                "oauth_provider": provider
            }
            
        except Exception as e:
            return {"success": False, "error": f"OAuth login failed: {str(e)}"}
    
    async def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=["HS256"])
            
            user_id = payload["user_id"]
            session_id = payload["session_id"]
            
            # Check if session is valid
            session = self.sessions.get(session_id)
            if not session or session["user_id"] != user_id:
                return {"success": False, "error": "Invalid session"}
            
            # Check if session is expired
            if datetime.fromisoformat(session["expires_at"]) < datetime.now():
                return {"success": False, "error": "Session expired"}
            
            # Get user
            user = self.users.get(user_id)
            if not user or user["status"] != "active":
                return {"success": False, "error": "User not found or inactive"}
            
            return {
                "success": True,
                "user": self._sanitize_user_data(user),
                "session_id": session_id,
                "permissions": self._get_user_permissions(user["role"])
            }
            
        except jwt.ExpiredSignatureError:
            return {"success": False, "error": "Token expired"}
        except jwt.InvalidTokenError:
            return {"success": False, "error": "Invalid token"}
        except Exception as e:
            return {"success": False, "error": f"Token verification failed: {str(e)}"}
    
    async def logout_user(self, session_id: str) -> Dict[str, Any]:
        """Logout user and invalidate session"""
        try:
            if session_id in self.sessions:
                del self.sessions[session_id]
            
            return {"success": True, "message": "Logged out successfully"}
            
        except Exception as e:
            return {"success": False, "error": f"Logout failed: {str(e)}"}
    
    async def change_password(self, user_id: str, current_password: str, new_password: str) -> Dict[str, Any]:
        """Change user password"""
        try:
            user = self.users.get(user_id)
            if not user:
                return {"success": False, "error": "User not found"}
            
            # Verify current password
            if not await self.password_hasher.verify_password(current_password, user["password_hash"]):
                return {"success": False, "error": "Current password is incorrect"}
            
            # Validate new password
            validation = await self._validate_password(new_password)
            if not validation["valid"]:
                return {"success": False, "errors": validation["errors"]}
            
            # Hash new password
            new_password_hash = await self.password_hasher.hash_password(new_password)
            
            # Update user
            user["password_hash"] = new_password_hash
            user["updated_at"] = datetime.now().isoformat()
            
            return {"success": True, "message": "Password changed successfully"}
            
        except Exception as e:
            return {"success": False, "error": f"Password change failed: {str(e)}"}
    
    async def update_user_role(self, user_id: str, new_role: str, admin_user_id: str) -> Dict[str, Any]:
        """Update user role (admin only)"""
        try:
            # Check admin permissions
            admin_user = self.users.get(admin_user_id)
            if not admin_user or admin_user["role"] != "admin":
                return {"success": False, "error": "Insufficient permissions"}
            
            # Check if role exists
            if new_role not in self.roles:
                return {"success": False, "error": "Invalid role"}
            
            # Update user role
            user = self.users.get(user_id)
            if not user:
                return {"success": False, "error": "User not found"}
            
            old_role = user["role"]
            user["role"] = new_role
            user["updated_at"] = datetime.now().isoformat()
            
            return {
                "success": True,
                "message": f"User role updated from {old_role} to {new_role}",
                "old_role": old_role,
                "new_role": new_role
            }
            
        except Exception as e:
            return {"success": False, "error": f"Role update failed: {str(e)}"}
    
    def _sanitize_user_data(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Remove sensitive data from user object"""
        sanitized = user.copy()
        sanitized.pop("password_hash", None)
        return sanitized
    
    def _get_user_permissions(self, role: str) -> List[str]:
        """Get permissions for user role"""
        if role not in self.roles:
            return []
        
        permissions = self.roles[role]["permissions"]
        if "*" in permissions:
            return self.permissions
        
        return permissions
    
    def _get_default_preferences(self) -> Dict[str, Any]:
        """Get default user preferences"""
        return {
            "theme": "light",
            "language": "en",
            "notifications": {
                "email": True,
                "push": True,
                "marketing": False
            },
            "privacy": {
                "profile_public": False,
                "show_activity": False
            }
        }
    
    async def _generate_jwt_token(self, user_id: str, session_id: str) -> str:
        """Generate JWT token"""
        payload = {
            "user_id": user_id,
            "session_id": session_id,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(payload, self.jwt_secret, algorithm="HS256")
    
    async def _generate_verification_token(self, user_id: str) -> str:
        """Generate email verification token"""
        return secrets.token_urlsafe(32)
    
    async def _send_verification_email(self, email: str, token: str) -> bool:
        """Send verification email"""
        # In production, would send actual email
        print(f"Verification email sent to {email} with token: {token}")
        return True
    
    async def _validate_password(self, password: str) -> Dict[str, Any]:
        """Validate password strength"""
        errors = []
        
        if len(password) < 8:
            errors.append("Password must be at least 8 characters")
        if not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number")
        
        return {"valid": len(errors) == 0, "errors": errors}
    
    async def _exchange_oauth_code(self, provider: str, code: str) -> Dict[str, Any]:
        """Exchange OAuth code for access token"""
        # Simulate OAuth token exchange
        return {
            "success": True,
            "access_token": f"oauth_token_{provider}_{secrets.token_urlsafe(16)}",
            "token_type": "Bearer",
            "expires_in": 3600
        }
    
    async def _get_oauth_user_info(self, provider: str, access_token: str) -> Dict[str, Any]:
        """Get user info from OAuth provider"""
        # Simulate getting user info from OAuth provider
        return {
            "success": True,
            "user_data": {
                "id": f"{provider}_user_123",
                "email": f"user@{provider}.com",
                "name": "OAuth User",
                "picture": f"https://{provider}.com/avatar.jpg"
            }
        }
    
    async def _find_or_create_oauth_user(self, provider: str, oauth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Find existing user or create new one for OAuth"""
        email = oauth_data["email"]
        
        # Find existing user by email
        user = next((u for u in self.users.values() if u["email"] == email.lower()), None)
        
        if user:
            # Link OAuth account
            user["oauth_accounts"][provider] = {
                "id": oauth_data["id"],
                "linked_at": datetime.now().isoformat()
            }
            return user
        else:
            # Create new user
            user_id = str(uuid.uuid4())
            user = {
                "id": user_id,
                "email": email.lower(),
                "username": oauth_data["name"].replace(" ", "_").lower(),
                "password_hash": None,  # OAuth users don't have passwords
                "role": "user",
                "profile": {
                    "name": oauth_data["name"],
                    "picture": oauth_data.get("picture")
                },
                "email_verified": True,  # OAuth emails are pre-verified
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "last_login": None,
                "login_count": 0,
                "status": "active",
                "preferences": self._get_default_preferences(),
                "oauth_accounts": {
                    provider: {
                        "id": oauth_data["id"],
                        "linked_at": datetime.now().isoformat()
                    }
                }
            }
            
            self.users[user_id] = user
            return user

class PasswordHasher:
    """Password hashing utility"""
    
    async def hash_password(self, password: str) -> str:
        """Hash password using secure algorithm"""
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return f"{salt}:{password_hash.hex()}"
    
    async def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        try:
            salt, hash_hex = password_hash.split(':')
            password_hash_check = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
            return password_hash_check.hex() == hash_hex
        except:
            return False

class SessionManager:
    """Session management"""
    
    def __init__(self):
        self.sessions = {}
    
    async def create_session(self, user_id: str) -> Dict[str, Any]:
        """Create new session"""
        session_id = str(uuid.uuid4())
        session = {
            "id": session_id,
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
            "expires_at": (datetime.now() + timedelta(hours=24)).isoformat(),
            "last_activity": datetime.now().isoformat()
        }
        
        auth_system.sessions[session_id] = session
        return session
    
    async def update_session_activity(self, session_id: str) -> bool:
        """Update session last activity"""
        if session_id in auth_system.sessions:
            auth_system.sessions[session_id]["last_activity"] = datetime.now().isoformat()
            return True
        return False

# Global instance
auth_system = AuthSystem()
