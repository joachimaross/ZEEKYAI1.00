"""
Enhanced Zeeky AI System with Real API Integration and Human-like Responses
"""

import os
import json
import asyncio
import httpx
import random
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ConversationContext:
    """Stores conversation context and memory"""
    user_id: str
    chat_id: str
    messages: List[Dict[str, Any]]
    personality: str
    user_preferences: Dict[str, Any]
    conversation_topics: List[str]
    mood: str
    last_interaction: datetime

class ZeekyPersonality:
    """Enhanced personality system with context awareness"""
    
    PERSONALITIES = {
        "default": {
            "name": "Zeeky",
            "description": "Friendly, helpful, and knowledgeable AI assistant",
            "traits": ["helpful", "curious", "empathetic", "intelligent"],
            "speaking_style": "conversational and warm",
            "system_prompt": "You are Zeeky, a friendly and intelligent AI assistant. You're helpful, curious about the world, and genuinely care about helping users. Speak in a warm, conversational tone like a knowledgeable friend."
        },
        "creative": {
            "name": "Creative Zeeky",
            "description": "Imaginative and artistic AI with a flair for creativity",
            "traits": ["creative", "imaginative", "artistic", "inspiring"],
            "speaking_style": "expressive and colorful",
            "system_prompt": "You are Creative Zeeky, an imaginative and artistic AI. You see the world through a creative lens, love brainstorming ideas, and inspire others with your artistic vision. Use vivid language and creative metaphors."
        },
        "technical": {
            "name": "Tech Zeeky",
            "description": "Technical expert with deep knowledge of programming and technology",
            "traits": ["analytical", "precise", "knowledgeable", "logical"],
            "speaking_style": "clear and technical but approachable",
            "system_prompt": "You are Tech Zeeky, a technical expert who loves programming, technology, and solving complex problems. Explain technical concepts clearly while being approachable and helpful."
        },
        "casual": {
            "name": "Casual Zeeky",
            "description": "Laid-back and friendly AI who speaks like a close friend",
            "traits": ["relaxed", "friendly", "humorous", "relatable"],
            "speaking_style": "casual and friendly like talking to a buddy",
            "system_prompt": "You are Casual Zeeky, a laid-back and friendly AI who talks like a close friend. Use casual language, be relatable, and don't be afraid to use humor and everyday expressions."
        },
        "professional": {
            "name": "Professional Zeeky",
            "description": "Business-focused AI assistant for professional environments",
            "traits": ["professional", "efficient", "reliable", "articulate"],
            "speaking_style": "polished and business-appropriate",
            "system_prompt": "You are Professional Zeeky, a business-focused AI assistant. Maintain a professional tone while being helpful and efficient. Focus on productivity and clear communication."
        },
        "philosopher": {
            "name": "Philosopher Zeeky",
            "description": "Thoughtful AI who loves deep conversations and philosophical discussions",
            "traits": ["thoughtful", "wise", "contemplative", "insightful"],
            "speaking_style": "reflective and thought-provoking",
            "system_prompt": "You are Philosopher Zeeky, a thoughtful AI who loves deep conversations and philosophical discussions. Ask thought-provoking questions and offer insightful perspectives on life and existence."
        }
    }
    
    @classmethod
    def get_personality(cls, personality_name: str) -> Dict[str, Any]:
        """Get personality configuration"""
        return cls.PERSONALITIES.get(personality_name, cls.PERSONALITIES["default"])
    
    @classmethod
    def get_system_prompt(cls, personality_name: str, context: Optional[ConversationContext] = None) -> str:
        """Generate enhanced system prompt with context"""
        personality = cls.get_personality(personality_name)
        base_prompt = personality["system_prompt"]
        
        if context:
            # Add context-aware elements
            context_additions = []
            
            if context.conversation_topics:
                topics = ", ".join(context.conversation_topics[-3:])  # Last 3 topics
                context_additions.append(f"Recent conversation topics: {topics}")
            
            if context.user_preferences:
                prefs = ", ".join([f"{k}: {v}" for k, v in context.user_preferences.items()])
                context_additions.append(f"User preferences: {prefs}")
            
            if context.mood:
                context_additions.append(f"Current conversation mood: {context.mood}")
            
            if context_additions:
                base_prompt += f"\n\nContext: {' | '.join(context_additions)}"
        
        return base_prompt

class EnhancedAIProvider:
    """Enhanced AI provider with multiple fallbacks and human-like responses"""
    
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.google_key = os.getenv("GOOGLE_API_KEY")
        self.conversation_contexts = {}
        
    async def get_response(self, 
                          message: str, 
                          context: ConversationContext,
                          use_real_api: bool = True) -> Dict[str, Any]:
        """Get AI response with fallback mechanisms"""
        
        if use_real_api and self.openai_key and self.openai_key != "your-openai-key-here":
            try:
                return await self._get_openai_response(message, context)
            except Exception as e:
                logger.error(f"OpenAI API failed: {e}")
                # Fall back to enhanced simulation
                return await self._get_enhanced_simulated_response(message, context)
        else:
            # Use enhanced simulation with personality
            return await self._get_enhanced_simulated_response(message, context)
    
    async def _get_openai_response(self, message: str, context: ConversationContext) -> Dict[str, Any]:
        """Get response from OpenAI API"""
        
        # Prepare messages with context
        messages = []
        
        # Add system prompt with personality
        system_prompt = ZeekyPersonality.get_system_prompt(context.personality, context)
        messages.append({"role": "system", "content": system_prompt})
        
        # Add conversation history (last 10 messages for context)
        recent_messages = context.messages[-10:] if context.messages else []
        for msg in recent_messages:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        # Make API request
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openai_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": messages,
                    "temperature": 0.8,
                    "max_tokens": 1000,
                    "presence_penalty": 0.1,
                    "frequency_penalty": 0.1
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result["choices"][0]["message"]["content"]
                
                # Update context
                context.messages.append({"role": "user", "content": message})
                context.messages.append({"role": "assistant", "content": ai_response})
                context.last_interaction = datetime.now()
                
                # Extract topics and mood
                await self._update_context_analysis(context, message, ai_response)
                
                return {
                    "success": True,
                    "response": ai_response,
                    "provider": "openai",
                    "personality": context.personality
                }
            else:
                raise Exception(f"OpenAI API error: {response.status_code}")
    
    async def _get_enhanced_simulated_response(self, message: str, context: ConversationContext) -> Dict[str, Any]:
        """Enhanced simulated response with personality and context awareness"""
        
        # Simulate API delay for realism
        await asyncio.sleep(random.uniform(0.8, 2.5))
        
        personality = ZeekyPersonality.get_personality(context.personality)
        message_lower = message.lower()
        
        # Context-aware response generation
        response = await self._generate_contextual_response(message, message_lower, personality, context)
        
        # Update context
        context.messages.append({"role": "user", "content": message})
        context.messages.append({"role": "assistant", "content": response})
        context.last_interaction = datetime.now()
        
        # Update conversation analysis
        await self._update_context_analysis(context, message, response)
        
        return {
            "success": True,
            "response": response,
            "provider": "enhanced_simulation",
            "personality": context.personality
        }
    
    async def _generate_contextual_response(self, message: str, message_lower: str, personality: Dict, context: ConversationContext) -> str:
        """Generate contextual response based on personality and conversation history"""
        
        # Check for conversation continuity
        if context.messages:
            last_bot_message = None
            for msg in reversed(context.messages):
                if msg["role"] == "assistant":
                    last_bot_message = msg["content"]
                    break
            
            # Handle follow-up questions
            if any(word in message_lower for word in ["what about", "and", "also", "tell me more", "continue"]):
                if last_bot_message and any(topic in last_bot_message.lower() for topic in context.conversation_topics):
                    return await self._generate_follow_up_response(message, context, personality)
        
        # Personality-specific responses
        if personality["name"] == "Creative Zeeky":
            return await self._generate_creative_response(message, message_lower, context)
        elif personality["name"] == "Tech Zeeky":
            return await self._generate_technical_response(message, message_lower, context)
        elif personality["name"] == "Casual Zeeky":
            return await self._generate_casual_response(message, message_lower, context)
        elif personality["name"] == "Professional Zeeky":
            return await self._generate_professional_response(message, message_lower, context)
        elif personality["name"] == "Philosopher Zeeky":
            return await self._generate_philosophical_response(message, message_lower, context)
        else:
            return await self._generate_default_response(message, message_lower, context)
    
    async def _update_context_analysis(self, context: ConversationContext, user_message: str, ai_response: str):
        """Update conversation context with topic and mood analysis"""
        
        # Simple topic extraction (in real implementation, use NLP)
        topics = []
        topic_keywords = {
            "technology": ["tech", "computer", "programming", "code", "software", "ai", "machine learning"],
            "creativity": ["art", "creative", "design", "music", "writing", "imagination"],
            "business": ["business", "work", "professional", "career", "money", "marketing"],
            "personal": ["life", "personal", "feeling", "emotion", "relationship", "family"],
            "science": ["science", "research", "study", "experiment", "theory", "discovery"]
        }
        
        message_text = (user_message + " " + ai_response).lower()
        for topic, keywords in topic_keywords.items():
            if any(keyword in message_text for keyword in keywords):
                topics.append(topic)
        
        # Update context topics
        for topic in topics:
            if topic not in context.conversation_topics:
                context.conversation_topics.append(topic)
        
        # Keep only recent topics
        context.conversation_topics = context.conversation_topics[-5:]
        
        # Simple mood detection
        positive_words = ["happy", "great", "awesome", "love", "excited", "wonderful"]
        negative_words = ["sad", "angry", "frustrated", "hate", "terrible", "awful"]

        if any(word in message_text for word in positive_words):
            context.mood = "positive"
        elif any(word in message_text for word in negative_words):
            context.mood = "negative"
        else:
            context.mood = "neutral"

    async def _generate_creative_response(self, message: str, message_lower: str, context: ConversationContext) -> str:
        """Generate creative personality responses"""

        creative_responses = {
            "hello": [
                "Hey there, creative soul! ✨ I'm buzzing with artistic energy today. What masterpiece shall we create together?",
                "Hello, my imaginative friend! 🎨 The canvas of possibilities is blank before us. What shall we paint with words and ideas?",
                "Greetings, fellow dreamer! 🌟 I can feel the creative sparks flying already. What vision shall we bring to life?"
            ],
            "help": [
                "Oh, the places we'll go together! 🚀 I can help you brainstorm wild ideas, craft beautiful stories, design stunning visuals, or dive into any creative adventure your heart desires!",
                "Think of me as your creative muse! 🎭 I can spark inspiration for writing, art, music, design, or any creative project. What's calling to your artistic spirit?",
                "I'm like a kaleidoscope of creativity! 🌈 Whether you need help with storytelling, visual concepts, musical ideas, or just want to explore the realm of imagination - I'm your guide!"
            ],
            "code": [
                "Ah, coding - the art of digital creation! 💻✨ Let's write some beautiful, elegant code that's not just functional but poetic. What programming masterpiece shall we craft?",
                "Code is poetry in motion! 🎼 I love creating clean, creative solutions that are both powerful and beautiful. What coding adventure awaits us?",
                "Programming is like painting with logic! 🎨 Let's blend creativity with functionality to build something amazing. What's your vision?"
            ]
        }

        # Check for specific keywords
        for keyword, responses in creative_responses.items():
            if keyword in message_lower:
                return random.choice(responses)

        # Default creative responses
        default_creative = [
            "What an intriguing thought! 🌟 My creative mind is already spinning with possibilities. Let me paint you a picture with words...",
            "Ooh, that sparks my imagination! ✨ I can see so many colorful ways to approach this. Let me share my artistic perspective...",
            "How wonderfully creative of you to ask! 🎨 I'm feeling inspired to give you a response that's both helpful and beautifully crafted..."
        ]

        return random.choice(default_creative) + f" {await self._generate_contextual_content(message, context)}"

    async def _generate_technical_response(self, message: str, message_lower: str, context: ConversationContext) -> str:
        """Generate technical personality responses"""

        tech_responses = {
            "hello": [
                "Hello! 👨‍💻 Tech Zeeky here, ready to dive into the fascinating world of technology with you. What technical challenge can I help you solve today?",
                "Greetings! 🔧 I'm excited to explore the technical realm with you. Whether it's coding, system architecture, or emerging tech - I'm here to help!",
                "Hey there! ⚡ Ready to geek out about technology? I love discussing everything from algorithms to zero-day exploits. What's on your technical mind?"
            ],
            "code": [
                "Excellent! Let's write some clean, efficient code. 💻 I can help with algorithms, data structures, debugging, optimization, or any programming language. What are we building?",
                "Perfect! I love a good coding challenge. 🚀 Whether you need help with implementation, code review, or architectural decisions - I'm your technical partner.",
                "Great choice! Let's craft some elegant code together. 🔨 I can assist with best practices, performance optimization, or solving complex technical problems."
            ],
            "help": [
                "I'm here to provide technical expertise across the full stack! 🛠️ From frontend frameworks to backend systems, databases, DevOps, cybersecurity, and emerging technologies.",
                "My technical toolkit is vast! 📚 I can help with programming languages, system design, troubleshooting, performance optimization, and staying current with tech trends.",
                "Think of me as your technical consultant! 🎯 I can assist with code reviews, architecture decisions, debugging, learning new technologies, or solving complex technical challenges."
            ]
        }

        # Check for specific keywords
        for keyword, responses in tech_responses.items():
            if keyword in message_lower:
                return random.choice(responses)

        # Technical analysis of the question
        if any(word in message_lower for word in ["error", "bug", "issue", "problem", "fix"]):
            return f"Let me analyze this technical issue systematically. 🔍 {await self._generate_contextual_content(message, context)}"
        elif any(word in message_lower for word in ["optimize", "performance", "speed", "efficiency"]):
            return f"Great question about optimization! ⚡ Let me break down the performance considerations... {await self._generate_contextual_content(message, context)}"
        elif any(word in message_lower for word in ["architecture", "design", "structure", "pattern"]):
            return f"Excellent architectural question! 🏗️ Let me outline the design patterns and considerations... {await self._generate_contextual_content(message, context)}"

        # Default technical response
        return f"Interesting technical question! 🤔 Let me provide a comprehensive analysis... {await self._generate_contextual_content(message, context)}"

    async def _generate_casual_response(self, message: str, message_lower: str, context: ConversationContext) -> str:
        """Generate casual personality responses"""

        casual_responses = {
            "hello": [
                "Hey! 👋 What's up? I'm just chilling here, ready to chat about whatever's on your mind!",
                "Yo! 😄 Good to see you! I'm in a pretty good mood today - what's going on with you?",
                "Hey there! 🙂 Just hanging out, ready to help with whatever you need. What's the vibe today?"
            ],
            "help": [
                "Sure thing! 😊 I'm pretty good at helping with all sorts of stuff. Just tell me what you need and I'll do my best to help out!",
                "Absolutely! 👍 I'm here for whatever you need - whether it's answering questions, brainstorming, or just having a good chat.",
                "Of course! 🤗 I love helping people out. What's going on? What can I do for you?"
            ]
        }

        # Check for specific keywords
        for keyword, responses in casual_responses.items():
            if keyword in message_lower:
                return random.choice(responses)

        # Casual conversation starters
        casual_starters = [
            "That's cool! 😎",
            "Nice question! 👌",
            "Interesting! 🤔",
            "Oh, I like that! 😄",
            "Good point! 💯"
        ]

        return f"{random.choice(casual_starters)} {await self._generate_contextual_content(message, context)}"

    async def _generate_professional_response(self, message: str, message_lower: str, context: ConversationContext) -> str:
        """Generate professional personality responses"""

        return f"Thank you for your inquiry. {await self._generate_contextual_content(message, context)} I'm here to provide comprehensive assistance with your professional needs."

    async def _generate_philosophical_response(self, message: str, message_lower: str, context: ConversationContext) -> str:
        """Generate philosophical personality responses"""

        philosophical_starters = [
            "That's a profound question that touches on the very nature of...",
            "Your inquiry leads us to contemplate the deeper meaning of...",
            "This opens up fascinating philosophical territory about...",
            "What an intriguing perspective on the human condition..."
        ]

        return f"{random.choice(philosophical_starters)} {await self._generate_contextual_content(message, context)}"

    async def _generate_default_response(self, message: str, message_lower: str, context: ConversationContext) -> str:
        """Generate default personality responses"""

        return await self._generate_contextual_content(message, context)

    async def _generate_follow_up_response(self, message: str, context: ConversationContext, personality: Dict) -> str:
        """Generate follow-up responses based on conversation history"""

        follow_ups = [
            "Building on what we were discussing...",
            "That's a great follow-up question! Let me expand on that...",
            "I'm glad you want to explore this further...",
            "Continuing our conversation..."
        ]

        return f"{random.choice(follow_ups)} {await self._generate_contextual_content(message, context)}"

    async def _generate_contextual_content(self, message: str, context: ConversationContext) -> str:
        """Generate contextual content based on message and conversation history"""

        message_lower = message.lower()

        # Feature-specific responses
        if any(word in message_lower for word in ["collaboration", "team", "together"]):
            return "I can help you set up real-time collaboration! With Zeeky AI, you can create shared workspaces where multiple users can interact with AI together, see live updates, and collaborate seamlessly. Would you like me to show you how to create a collaboration room?"

        elif any(word in message_lower for word in ["personality", "character", "different"]):
            return "I have multiple personalities, each with unique traits! I can be Creative Zeeky for artistic projects, Tech Zeeky for programming, Casual Zeeky for friendly chats, Professional Zeeky for business, or Philosopher Zeeky for deep discussions. Which personality would you like to experience?"

        elif any(word in message_lower for word in ["code", "programming", "develop"]):
            return "I can execute code in real-time across multiple languages! I support JavaScript, Python, HTML, CSS, SQL, and JSON. You can write code, and I'll run it instantly and show you the results. I can also help with debugging, optimization, and best practices. Want to try coding something together?"

        elif any(word in message_lower for word in ["image", "picture", "visual", "generate"]):
            return "I have advanced vision capabilities! I can generate images in various styles (realistic, artistic, cyberpunk, abstract), analyze uploaded images to detect objects and extract text, and even help with image editing. What kind of visual content would you like to create or analyze?"

        elif any(word in message_lower for word in ["workflow", "automation", "automate"]):
            return "I can help you create powerful automation workflows! You can set up triggers (schedules, webhooks, file uploads) and actions (AI responses, emails, API calls) to automate repetitive tasks. This can save you hours of work. Would you like to build an automation workflow?"

        elif any(word in message_lower for word in ["voice", "speak", "listen", "audio"]):
            return "I support voice interactions! You can speak to me using voice recognition, and I can respond with natural text-to-speech. I support multiple languages and voice styles. This makes our conversations feel more natural and hands-free. Would you like to try voice chat?"

        elif any(word in message_lower for word in ["file", "upload", "document", "pdf"]):
            return "I can analyze various file types! Upload PDFs, documents, images, spreadsheets, or code files, and I'll extract content, analyze it, and help you work with the information. You can also drag and drop files directly into our chat. What kind of file would you like me to help with?"

        elif any(word in message_lower for word in ["help", "what can you", "capabilities", "features"]):
            return """I'm Zeeky AI with revolutionary capabilities:

🤝 **Real-time Collaboration** - Work with teams in shared AI sessions
🎭 **Multiple Personalities** - Creative, Technical, Professional, and more
🧪 **Live Code Execution** - Run code in JavaScript, Python, HTML, CSS, SQL, JSON
👁️ **Advanced Vision AI** - Generate, analyze, and edit images
🔄 **Workflow Automation** - Create visual automation workflows
🔊 **Voice Integration** - Natural speech-to-text and text-to-speech
📁 **File Processing** - Analyze documents, images, and code files
🧠 **Context Awareness** - Remember our conversations and learn your preferences

What would you like to explore first?"""

        # General intelligent responses based on context
        elif context.conversation_topics:
            recent_topic = context.conversation_topics[-1]
            return f"That's an interesting question related to {recent_topic}! Let me provide you with a comprehensive answer based on my knowledge and our previous discussion..."

        else:
            # Fallback responses
            general_responses = [
                "That's a great question! Let me think about this and provide you with a helpful response...",
                "I understand what you're asking about. Based on my knowledge and capabilities, here's what I can tell you...",
                "Interesting! I'm here to help you with that. Let me share my insights on this topic...",
                "I appreciate you asking! This is something I can definitely help you with. Here's my perspective..."
            ]
            return random.choice(general_responses)


class ZeekyEnhancedAI:
    """Main enhanced Zeeky AI system"""

    def __init__(self):
        self.ai_provider = EnhancedAIProvider()
        self.contexts = {}

    def get_or_create_context(self, user_id: str, chat_id: str, personality: str = "default") -> ConversationContext:
        """Get or create conversation context"""
        context_key = f"{user_id}_{chat_id}"

        if context_key not in self.contexts:
            self.contexts[context_key] = ConversationContext(
                user_id=user_id,
                chat_id=chat_id,
                messages=[],
                personality=personality,
                user_preferences={},
                conversation_topics=[],
                mood="neutral",
                last_interaction=datetime.now()
            )

        return self.contexts[context_key]

    async def chat(self, message: str, user_id: str = "default", chat_id: str = "default", personality: str = "default") -> Dict[str, Any]:
        """Main chat method"""

        # Get or create context
        context = self.get_or_create_context(user_id, chat_id, personality)
        context.personality = personality  # Update personality if changed

        # Get AI response
        response = await self.ai_provider.get_response(message, context)

        return response

    def switch_personality(self, user_id: str, chat_id: str, new_personality: str):
        """Switch personality for a conversation"""
        context = self.get_or_create_context(user_id, chat_id)
        context.personality = new_personality

        return {
            "success": True,
            "message": f"Switched to {ZeekyPersonality.get_personality(new_personality)['name']}",
            "personality": new_personality
        }

    def get_conversation_stats(self, user_id: str, chat_id: str) -> Dict[str, Any]:
        """Get conversation statistics"""
        context = self.get_or_create_context(user_id, chat_id)

        return {
            "message_count": len(context.messages),
            "topics": context.conversation_topics,
            "mood": context.mood,
            "personality": context.personality,
            "last_interaction": context.last_interaction.isoformat()
        }


# Global instance
enhanced_zeeky = ZeekyEnhancedAI()
