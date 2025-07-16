"""
Zeeky AI Configuration
Contains API keys and configuration settings
"""

import os
from typing import Dict, Any

# OpenAI Configuration
OPENAI_API_KEY = "your-openai-key-here"  # Replace with your actual OpenAI API key
OPENAI_MODEL = "gpt-4"
OPENAI_MAX_TOKENS = 4000
OPENAI_TEMPERATURE = 0.7

# Zeeky AI Configuration
ZEEKY_VERSION = "2.0.0"
ZEEKY_NAME = "Zeeky AI"
ZEEKY_DESCRIPTION = "Advanced AI Assistant with 18+ Integrated Phases"

# API Configuration
API_HOST = "127.0.0.1"
API_PORT = 8000
API_RELOAD = True

# Database Configuration
DATABASE_URL = "sqlite:///zeeky_ai.db"
REDIS_URL = "redis://localhost:6379"

# Security Configuration
SECRET_KEY = "zeeky-ai-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Feature Flags
FEATURES = {
    "voice_integration": True,
    "smart_home": True,
    "blockchain": True,
    "quantum_computing": True,
    "metaverse": True,
    "cybersecurity": True,
    "autonomous_systems": True,
    "neural_networks": True,
    "advanced_reasoning": True,
    "entertainment": True,
    "business_intelligence": True,
    "analytics": True,
    "integrations": True,
    "realistic_avatar": True
}

# Avatar Configuration
AVATAR_CONFIG = {
    "enabled": True,
    "model_type": "realistic_3d",
    "voice_synthesis": True,
    "lip_sync": True,
    "facial_expressions": True,
    "eye_tracking": True,
    "emotion_detection": True
}

def get_openai_config() -> Dict[str, Any]:
    """Get OpenAI configuration"""
    return {
        "api_key": OPENAI_API_KEY,
        "model": OPENAI_MODEL,
        "max_tokens": OPENAI_MAX_TOKENS,
        "temperature": OPENAI_TEMPERATURE
    }

def get_zeeky_config() -> Dict[str, Any]:
    """Get Zeeky AI configuration"""
    return {
        "version": ZEEKY_VERSION,
        "name": ZEEKY_NAME,
        "description": ZEEKY_DESCRIPTION,
        "features": FEATURES,
        "avatar": AVATAR_CONFIG
    }