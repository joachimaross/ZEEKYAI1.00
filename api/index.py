"""
Vercel deployment entry point for ZEEKY AI
Lightweight version for serverless deployment
"""

import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Create lightweight FastAPI app for Vercel
app = FastAPI(
    title="ZEEKY AI",
    description="Advanced AI Assistant Platform",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    personality: Optional[str] = "default"
    model: Optional[str] = "gpt-4o-mini"

# Basic endpoints
@app.get("/")
async def root():
    return {
        "name": "ZEEKY AI",
        "version": "2.0.0",
        "status": "operational",
        "description": "Advanced AI Assistant Platform",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "Multi-model AI support",
            "Advanced chat interface",
            "Real-time responses",
            "Multiple personalities",
            "File processing",
            "Voice integration"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "environment": "production"
    }

@app.get("/personalities")
async def get_personalities():
    return {
        "personalities": [
            {
                "id": "default",
                "name": "Default",
                "description": "Balanced and helpful AI assistant"
            },
            {
                "id": "creative",
                "name": "Creative",
                "description": "Imaginative and artistic AI companion"
            },
            {
                "id": "professional",
                "name": "Professional",
                "description": "Business-focused and formal AI assistant"
            },
            {
                "id": "friendly",
                "name": "Friendly",
                "description": "Warm and conversational AI friend"
            },
            {
                "id": "technical",
                "name": "Technical",
                "description": "Detail-oriented technical AI expert"
            },
            {
                "id": "humorous",
                "name": "Humorous",
                "description": "Witty and entertaining AI companion"
            }
        ]
    }

@app.get("/features")
async def get_features():
    return {
        "features": [
            {
                "category": "AI Chat",
                "items": ["Multi-model support", "Real-time responses", "Context awareness"]
            },
            {
                "category": "Interface",
                "items": ["Modern UI", "Dark/light themes", "Mobile responsive"]
            },
            {
                "category": "Advanced",
                "items": ["Voice input", "File processing", "Code generation"]
            }
        ]
    }

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """Lightweight chat endpoint for Vercel"""
    try:
        # Import OpenAI only when needed to reduce cold start
        import openai

        # Get API key from environment
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")

        client = openai.OpenAI(api_key=api_key)

        # Convert messages to OpenAI format
        openai_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in request.messages
        ]

        # Add personality system message
        personality_prompts = {
            "default": "You are ZEEKY AI, a helpful and knowledgeable AI assistant.",
            "creative": "You are ZEEKY AI in creative mode. You're imaginative and artistic.",
            "professional": "You are ZEEKY AI in professional mode. You communicate formally and efficiently.",
            "friendly": "You are ZEEKY AI in friendly mode. You're warm and conversational.",
            "technical": "You are ZEEKY AI in technical mode. You're detail-oriented and precise.",
            "humorous": "You are ZEEKY AI in humorous mode. You're witty and entertaining."
        }

        system_message = {
            "role": "system",
            "content": personality_prompts.get(request.personality, personality_prompts["default"])
        }

        # Make OpenAI API call
        response = client.chat.completions.create(
            model=request.model,
            messages=[system_message] + openai_messages,
            max_tokens=2000,
            temperature=0.8
        )

        return {
            "response": response.choices[0].message.content,
            "model": request.model,
            "personality": request.personality,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

# Export the app for Vercel
handler = app
