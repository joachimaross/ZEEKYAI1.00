"""
Zeeky AI Rate Limiter and API Protection
Prevents abuse and ensures fair usage
"""

import time
import asyncio
from collections import defaultdict, deque
from typing import Dict, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """Advanced rate limiter with multiple strategies"""
    
    def __init__(self):
        self.user_requests = defaultdict(deque)
        self.ip_requests = defaultdict(deque)
        self.global_requests = deque()
        
        # Rate limits (requests per minute)
        self.limits = {
            "free_user": 20,
            "premium_user": 100,
            "enterprise_user": 500,
            "ip_limit": 50,
            "global_limit": 1000
        }
        
        # Time windows (seconds)
        self.windows = {
            "user": 60,  # 1 minute
            "ip": 60,    # 1 minute
            "global": 60 # 1 minute
        }
        
        # Blocked IPs and users
        self.blocked_ips = set()
        self.blocked_users = set()
        
        # Suspicious activity tracking
        self.suspicious_activity = defaultdict(list)
    
    async def check_rate_limit(self, user_id: str, ip_address: str, user_type: str = "free_user") -> Dict:
        """Check if request is within rate limits"""
        
        current_time = time.time()
        
        # Check if user/IP is blocked
        if user_id in self.blocked_users:
            return {
                "allowed": False,
                "reason": "User blocked due to abuse",
                "retry_after": 3600  # 1 hour
            }
        
        if ip_address in self.blocked_ips:
            return {
                "allowed": False,
                "reason": "IP blocked due to abuse",
                "retry_after": 3600  # 1 hour
            }
        
        # Clean old requests
        self._cleanup_old_requests(current_time)
        
        # Check user rate limit
        user_limit = self.limits.get(user_type, self.limits["free_user"])
        user_requests = len(self.user_requests[user_id])
        
        if user_requests >= user_limit:
            self._track_suspicious_activity(user_id, ip_address, "rate_limit_exceeded")
            return {
                "allowed": False,
                "reason": f"Rate limit exceeded: {user_requests}/{user_limit} requests per minute",
                "retry_after": 60,
                "current_usage": user_requests,
                "limit": user_limit
            }
        
        # Check IP rate limit
        ip_requests = len(self.ip_requests[ip_address])
        if ip_requests >= self.limits["ip_limit"]:
            self._track_suspicious_activity(user_id, ip_address, "ip_rate_limit_exceeded")
            return {
                "allowed": False,
                "reason": f"IP rate limit exceeded: {ip_requests}/{self.limits['ip_limit']} requests per minute",
                "retry_after": 60
            }
        
        # Check global rate limit
        global_requests = len(self.global_requests)
        if global_requests >= self.limits["global_limit"]:
            return {
                "allowed": False,
                "reason": "Global rate limit exceeded. Please try again later.",
                "retry_after": 60
            }
        
        # Add request to tracking
        self.user_requests[user_id].append(current_time)
        self.ip_requests[ip_address].append(current_time)
        self.global_requests.append(current_time)
        
        return {
            "allowed": True,
            "remaining": user_limit - user_requests - 1,
            "limit": user_limit,
            "reset_time": current_time + self.windows["user"]
        }
    
    def _cleanup_old_requests(self, current_time: float):
        """Remove old requests outside the time window"""
        
        # Clean user requests
        for user_id in list(self.user_requests.keys()):
            requests = self.user_requests[user_id]
            while requests and current_time - requests[0] > self.windows["user"]:
                requests.popleft()
            if not requests:
                del self.user_requests[user_id]
        
        # Clean IP requests
        for ip in list(self.ip_requests.keys()):
            requests = self.ip_requests[ip]
            while requests and current_time - requests[0] > self.windows["ip"]:
                requests.popleft()
            if not requests:
                del self.ip_requests[ip]
        
        # Clean global requests
        while self.global_requests and current_time - self.global_requests[0] > self.windows["global"]:
            self.global_requests.popleft()
    
    def _track_suspicious_activity(self, user_id: str, ip_address: str, activity_type: str):
        """Track suspicious activity for potential blocking"""
        
        current_time = datetime.now()
        self.suspicious_activity[user_id].append({
            "type": activity_type,
            "ip": ip_address,
            "timestamp": current_time
        })
        
        # Check if user should be blocked
        recent_violations = [
            activity for activity in self.suspicious_activity[user_id]
            if current_time - activity["timestamp"] < timedelta(hours=1)
        ]
        
        if len(recent_violations) >= 5:  # 5 violations in 1 hour
            self.blocked_users.add(user_id)
            self.blocked_ips.add(ip_address)
            logger.warning(f"Blocked user {user_id} and IP {ip_address} due to suspicious activity")
    
    def unblock_user(self, user_id: str):
        """Manually unblock a user"""
        self.blocked_users.discard(user_id)
        if user_id in self.suspicious_activity:
            del self.suspicious_activity[user_id]
    
    def unblock_ip(self, ip_address: str):
        """Manually unblock an IP"""
        self.blocked_ips.discard(ip_address)
    
    def get_user_stats(self, user_id: str) -> Dict:
        """Get user usage statistics"""
        current_time = time.time()
        self._cleanup_old_requests(current_time)
        
        user_requests = len(self.user_requests.get(user_id, []))
        suspicious_count = len(self.suspicious_activity.get(user_id, []))
        
        return {
            "current_requests": user_requests,
            "suspicious_activities": suspicious_count,
            "is_blocked": user_id in self.blocked_users,
            "last_request": max(self.user_requests.get(user_id, [0])) if self.user_requests.get(user_id) else None
        }
    
    def get_global_stats(self) -> Dict:
        """Get global usage statistics"""
        current_time = time.time()
        self._cleanup_old_requests(current_time)
        
        return {
            "global_requests": len(self.global_requests),
            "active_users": len(self.user_requests),
            "active_ips": len(self.ip_requests),
            "blocked_users": len(self.blocked_users),
            "blocked_ips": len(self.blocked_ips),
            "total_suspicious_activities": sum(len(activities) for activities in self.suspicious_activity.values())
        }

class APIKeyManager:
    """Manage API keys and usage tracking"""
    
    def __init__(self):
        self.api_keys = {}
        self.key_usage = defaultdict(int)
        self.key_limits = defaultdict(lambda: 1000)  # Default limit
        
    def validate_api_key(self, api_key: str) -> Dict:
        """Validate API key and check usage"""
        
        if not api_key or api_key == "your-openai-key-here":
            return {
                "valid": False,
                "reason": "Invalid or missing API key",
                "demo_mode": True
            }
        
        # Check usage limits
        current_usage = self.key_usage[api_key]
        limit = self.key_limits[api_key]
        
        if current_usage >= limit:
            return {
                "valid": False,
                "reason": f"API key usage limit exceeded: {current_usage}/{limit}",
                "demo_mode": True
            }
        
        return {
            "valid": True,
            "usage": current_usage,
            "limit": limit,
            "remaining": limit - current_usage
        }
    
    def increment_usage(self, api_key: str):
        """Increment API key usage"""
        self.key_usage[api_key] += 1
    
    def set_key_limit(self, api_key: str, limit: int):
        """Set usage limit for API key"""
        self.key_limits[api_key] = limit

# Global instances
rate_limiter = RateLimiter()
api_key_manager = APIKeyManager()

# Middleware function for FastAPI
async def rate_limit_middleware(request, call_next):
    """Rate limiting middleware for FastAPI"""
    
    # Extract user info
    user_id = getattr(request.state, 'user_id', 'anonymous')
    ip_address = request.client.host
    user_type = getattr(request.state, 'user_type', 'free_user')
    
    # Check rate limit
    rate_check = await rate_limiter.check_rate_limit(user_id, ip_address, user_type)
    
    if not rate_check["allowed"]:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=429,
            detail=rate_check["reason"],
            headers={"Retry-After": str(rate_check["retry_after"])}
        )
    
    # Add rate limit headers
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(rate_check["limit"])
    response.headers["X-RateLimit-Remaining"] = str(rate_check["remaining"])
    response.headers["X-RateLimit-Reset"] = str(int(rate_check["reset_time"]))
    
    return response
