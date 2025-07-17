"""
Zeeky AI Security & Validation System
Comprehensive security measures and input validation
"""

import re
import hashlib
import secrets
import jwt
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
from functools import wraps
import html
import bleach

logger = logging.getLogger(__name__)

class SecurityManager:
    """Comprehensive security management"""
    
    def __init__(self):
        self.secret_key = secrets.token_urlsafe(32)
        self.algorithm = "HS256"
        self.token_expiry = timedelta(hours=24)
        
        # Security patterns
        self.malicious_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'vbscript:',
            r'onload\s*=',
            r'onerror\s*=',
            r'onclick\s*=',
            r'eval\s*\(',
            r'exec\s*\(',
            r'system\s*\(',
            r'shell_exec\s*\(',
            r'passthru\s*\(',
            r'file_get_contents\s*\(',
            r'fopen\s*\(',
            r'include\s*\(',
            r'require\s*\(',
            r'\.\./',
            r'union\s+select',
            r'drop\s+table',
            r'delete\s+from',
            r'insert\s+into',
            r'update\s+.*\s+set'
        ]
        
        # Allowed HTML tags for rich text
        self.allowed_tags = [
            'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
            'code', 'pre', 'a'
        ]
        
        self.allowed_attributes = {
            'a': ['href', 'title'],
            'code': ['class'],
            'pre': ['class']
        }
        
        # Rate limiting for security events
        self.security_events = {}
        
    def validate_input(self, input_data: Any, input_type: str = "text") -> Dict:
        """Comprehensive input validation"""
        
        try:
            if input_type == "text":
                return self._validate_text_input(input_data)
            elif input_type == "email":
                return self._validate_email(input_data)
            elif input_type == "url":
                return self._validate_url(input_data)
            elif input_type == "json":
                return self._validate_json_input(input_data)
            elif input_type == "html":
                return self._validate_html_input(input_data)
            else:
                return self._validate_general_input(input_data)
                
        except Exception as e:
            logger.error(f"Input validation error: {e}")
            return {
                "valid": False,
                "error": "Validation failed",
                "sanitized": ""
            }
    
    def _validate_text_input(self, text: str) -> Dict:
        """Validate and sanitize text input"""
        
        if not isinstance(text, str):
            return {"valid": False, "error": "Input must be a string", "sanitized": ""}
        
        # Check length
        if len(text) > 10000:  # 10KB limit
            return {"valid": False, "error": "Input too long", "sanitized": ""}
        
        # Check for malicious patterns
        malicious_found = []
        text_lower = text.lower()
        
        for pattern in self.malicious_patterns:
            if re.search(pattern, text_lower, re.IGNORECASE):
                malicious_found.append(pattern)
        
        if malicious_found:
            logger.warning(f"Malicious patterns detected: {malicious_found}")
            return {
                "valid": False,
                "error": "Potentially malicious content detected",
                "patterns": malicious_found,
                "sanitized": ""
            }
        
        # Sanitize HTML entities
        sanitized = html.escape(text)
        
        return {
            "valid": True,
            "sanitized": sanitized,
            "original_length": len(text),
            "sanitized_length": len(sanitized)
        }
    
    def _validate_email(self, email: str) -> Dict:
        """Validate email address"""
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if not isinstance(email, str):
            return {"valid": False, "error": "Email must be a string"}
        
        if len(email) > 254:  # RFC 5321 limit
            return {"valid": False, "error": "Email too long"}
        
        if not re.match(email_pattern, email):
            return {"valid": False, "error": "Invalid email format"}
        
        return {"valid": True, "sanitized": email.lower().strip()}
    
    def _validate_url(self, url: str) -> Dict:
        """Validate URL"""
        
        url_pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        
        if not isinstance(url, str):
            return {"valid": False, "error": "URL must be a string"}
        
        if len(url) > 2048:  # Common URL length limit
            return {"valid": False, "error": "URL too long"}
        
        if not re.match(url_pattern, url, re.IGNORECASE):
            return {"valid": False, "error": "Invalid URL format"}
        
        # Check for suspicious domains
        suspicious_domains = ['bit.ly', 'tinyurl.com', 'goo.gl']  # Add more as needed
        for domain in suspicious_domains:
            if domain in url.lower():
                return {"valid": False, "error": "Suspicious URL domain"}
        
        return {"valid": True, "sanitized": url.strip()}
    
    def _validate_json_input(self, json_data: Any) -> Dict:
        """Validate JSON input"""
        
        import json
        
        try:
            if isinstance(json_data, str):
                parsed = json.loads(json_data)
            else:
                parsed = json_data
            
            # Check for deeply nested structures (DoS protection)
            if self._check_json_depth(parsed) > 10:
                return {"valid": False, "error": "JSON structure too deeply nested"}
            
            # Check size
            json_str = json.dumps(parsed)
            if len(json_str) > 1000000:  # 1MB limit
                return {"valid": False, "error": "JSON data too large"}
            
            return {"valid": True, "sanitized": parsed}
            
        except json.JSONDecodeError as e:
            return {"valid": False, "error": f"Invalid JSON: {str(e)}"}
    
    def _validate_html_input(self, html_input: str) -> Dict:
        """Validate and sanitize HTML input"""
        
        if not isinstance(html_input, str):
            return {"valid": False, "error": "HTML input must be a string"}
        
        if len(html_input) > 50000:  # 50KB limit
            return {"valid": False, "error": "HTML input too long"}
        
        # Sanitize HTML using bleach
        try:
            sanitized = bleach.clean(
                html_input,
                tags=self.allowed_tags,
                attributes=self.allowed_attributes,
                strip=True
            )
            
            return {
                "valid": True,
                "sanitized": sanitized,
                "original_length": len(html_input),
                "sanitized_length": len(sanitized)
            }
            
        except Exception as e:
            logger.error(f"HTML sanitization error: {e}")
            return {"valid": False, "error": "HTML sanitization failed"}
    
    def _validate_general_input(self, input_data: Any) -> Dict:
        """General input validation"""
        
        # Convert to string for validation
        try:
            input_str = str(input_data)
            return self._validate_text_input(input_str)
        except Exception as e:
            return {"valid": False, "error": f"Cannot convert input to string: {e}"}
    
    def _check_json_depth(self, obj: Any, depth: int = 0) -> int:
        """Check JSON nesting depth"""
        
        if depth > 20:  # Prevent infinite recursion
            return depth
        
        if isinstance(obj, dict):
            return max([self._check_json_depth(v, depth + 1) for v in obj.values()] + [depth])
        elif isinstance(obj, list):
            return max([self._check_json_depth(item, depth + 1) for item in obj] + [depth])
        else:
            return depth
    
    def generate_token(self, user_id: str, user_type: str = "user") -> str:
        """Generate JWT token"""
        
        payload = {
            "user_id": user_id,
            "user_type": user_type,
            "exp": datetime.utcnow() + self.token_expiry,
            "iat": datetime.utcnow(),
            "jti": secrets.token_urlsafe(16)  # Unique token ID
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Dict:
        """Verify JWT token"""
        
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return {
                "valid": True,
                "user_id": payload["user_id"],
                "user_type": payload["user_type"],
                "expires": payload["exp"]
            }
        except jwt.ExpiredSignatureError:
            return {"valid": False, "error": "Token expired"}
        except jwt.InvalidTokenError:
            return {"valid": False, "error": "Invalid token"}
    
    def hash_password(self, password: str) -> str:
        """Hash password securely"""
        
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return f"{salt}:{password_hash.hex()}"
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        
        try:
            salt, password_hash = hashed.split(':')
            computed_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
            return computed_hash.hex() == password_hash
        except Exception:
            return False
    
    def log_security_event(self, event_type: str, user_id: str, ip_address: str, details: Dict = None):
        """Log security events"""
        
        event = {
            "type": event_type,
            "user_id": user_id,
            "ip_address": ip_address,
            "timestamp": datetime.now().isoformat(),
            "details": details or {}
        }
        
        # Store in memory (in production, use proper logging/database)
        if user_id not in self.security_events:
            self.security_events[user_id] = []
        
        self.security_events[user_id].append(event)
        
        # Keep only last 100 events per user
        if len(self.security_events[user_id]) > 100:
            self.security_events[user_id] = self.security_events[user_id][-100:]
        
        logger.warning(f"Security event: {event_type} for user {user_id} from {ip_address}")
    
    def check_suspicious_activity(self, user_id: str, ip_address: str) -> Dict:
        """Check for suspicious activity patterns"""
        
        if user_id not in self.security_events:
            return {"suspicious": False}
        
        recent_events = [
            event for event in self.security_events[user_id]
            if (datetime.now() - datetime.fromisoformat(event["timestamp"])).seconds < 3600  # Last hour
        ]
        
        # Check for multiple failed attempts
        failed_attempts = [e for e in recent_events if e["type"] in ["failed_login", "invalid_token", "malicious_input"]]
        
        if len(failed_attempts) >= 5:
            return {
                "suspicious": True,
                "reason": "Multiple failed attempts",
                "event_count": len(failed_attempts),
                "recommendation": "temporary_block"
            }
        
        # Check for rapid requests
        if len(recent_events) >= 50:
            return {
                "suspicious": True,
                "reason": "Too many requests",
                "event_count": len(recent_events),
                "recommendation": "rate_limit"
            }
        
        return {"suspicious": False}

# Global security manager
security_manager = SecurityManager()

# Decorator for securing endpoints
def secure_endpoint(require_auth: bool = True, validate_input: bool = True):
    """Decorator to secure API endpoints"""
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # This would be implemented with FastAPI dependencies
            # For now, it's a placeholder
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Input validation decorator
def validate_input(input_type: str = "text"):
    """Decorator to validate input"""
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Validate inputs based on function parameters
            # This is a simplified implementation
            return await func(*args, **kwargs)
        return wrapper
    return decorator
