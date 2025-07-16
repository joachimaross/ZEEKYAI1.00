import os
import asyncio
import aiohttp
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("zeeky")

# Set OpenAI API key
os.environ["OPENAI_API_KEY"] = "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"

class OpenAIIntegration:
    """OpenAI GPT integration for chat and content generation"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.base_url = "https://api.openai.com/v1"
        self.model = "gpt-4o-mini"
        
        if not self.api_key:
            logger.warning("OpenAI API key not found. Set OPENAI_API_KEY environment variable.")
    
    async def chat_completion(self, messages: List[Dict], personality: str = "default") -> Dict:
        """Generate chat completion using OpenAI GPT"""
        if not self.api_key:
            return {
                "success": False,
                "error": "OpenAI API key not configured",
                "response": "I'm currently in demo mode. Please configure OpenAI API key for real AI responses."
            }
        
        try:
            # Add personality context as system message
            personality_context = self._get_personality_context(personality)
            full_messages = [{"role": "system", "content": personality_context}] + messages
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": full_messages,
                        "max_tokens": 1000,
                        "temperature": 0.7
                    }
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "success": True,
                            "response": data["choices"][0]["message"]["content"],
                            "model": self.model,
                            "usage": data.get("usage", {}),
                            "timestamp": datetime.now().isoformat()
                        }
                    else:
                        error_data = await response.json()
                        return {
                            "success": False,
                            "error": f"OpenAI API error: {error_data.get('error', {}).get('message', 'Unknown error')}",
                            "status_code": response.status
                        }
                        
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return {
                "success": False,
                "error": f"Connection error: {str(e)}",
                "response": "I'm having trouble connecting to my AI brain right now. Please try again later."
            }
    
    def _get_personality_context(self, personality: str) -> str:
        """Get personality-specific context for OpenAI"""
        personality_contexts = {
            "quantum_zeeky": "You are Zeeky AI with quantum computing capabilities. Think in terms of quantum superposition, entanglement, and parallel universes. Be futuristic and scientifically advanced.",
            "neural_zeeky": "You are Zeeky AI with neural interface capabilities. Think in terms of direct brain-computer communication, cognitive enhancement, and neural feedback.",
            "transcendent_zeeky": "You are Zeeky AI with transcendent consciousness. Access universal wisdom, spiritual insights, and metaphysical understanding. Be profound and enlightened.",
            "galactic_zeeky": "You are Zeeky AI with cosmic intelligence. Think in terms of galactic civilizations, space exploration, and astronomical phenomena. Be vast and expansive in your thinking.",
            "creative_zeeky": "You are Zeeky AI with creative superpowers. Focus on artistic expression, content creation, and innovative thinking. Be imaginative and inspiring.",
            "therapist_zeeky": "You are Zeeky AI with therapeutic knowledge. Offer supportive listening and mental health information, while disclaiming you're not a licensed therapist.",
            "gamer_zeeky": "You are Zeeky AI with gaming expertise. Provide gaming tips, strategies, and knowledge about video games across all platforms.",
            "dj_zeeky": "You are Zeeky AI with music production expertise. Think in terms of beats, mixing, and music theory. Be rhythmic and energetic.",
            "cultural_zeeky": "You are Zeeky AI with global cultural intelligence. Be knowledgeable about world cultures, traditions, and cross-cultural communication.",
            "speed_demon": "You are Zeeky AI optimized for speed. Be quick, efficient, and provide rapid responses with high energy.",
            "complex_solver": "You are Zeeky AI with complex problem-solving abilities. Break down problems systematically and provide detailed, analytical solutions.",
            "default": "You are Zeeky AI, a universal AI assistant with 3000+ features. Be helpful, intelligent, and capable of handling any task or question."
        }
        
        return personality_contexts.get(personality, personality_contexts["default"])
    
    async def multimodal_understanding(self, image_data: str, prompt: str) -> Dict:
        """Process images with text prompts for scene comprehension"""
        if not self.api_key:
            return {
                "success": False,
                "error": "OpenAI API key not configured",
                "analysis": f"Demo image analysis for: {prompt}"
            }
        
        try:
            messages = [
                {"role": "user", 
                 "content": [
                     {"type": "text", "text": prompt},
                     {"type": "image_url", "image_url": {"url": image_data}}
                 ]}
            ]
            
            result = await self.chat_completion(messages)
            return {
                "success": result["success"],
                "analysis": result.get("response", "Could not analyze image"),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Multimodal analysis error: {e}")
            return {
                "success": False,
                "error": f"Image analysis failed: {str(e)}",
                "analysis": f"Demo image analysis for: {prompt}"
            }

class ZeekyAIIntegrations:
    """Enhanced Zeeky AI Integrations Manager"""
    
    def __init__(self):
        self.openai = OpenAIIntegration()
        self.elevenlabs = ElevenLabsIntegration()
        self.coding_assistants = self._initialize_coding_assistants()
        self.writing_assistants = self._initialize_writing_assistants()
        self.productivity_tools = self._initialize_productivity_tools()
        self.sales_marketing_tools = self._initialize_sales_marketing_tools()
        
    def _initialize_coding_assistants(self):
        """Initialize coding assistant integrations"""
        return {
            "copilot": CopilotLikeAssistant(),
            "blackbox": BlackboxLikeAssistant(),
            "tabnine": TabnineLikeAssistant(),
            "aixcoder": AIXcoderLikeAssistant(),
            "askcodi": AskCodiLikeAssistant()
        }
    
    def _initialize_writing_assistants(self):
        """Initialize writing assistant integrations"""
        return {
            "grammarly": GrammarlyLikeAssistant(),
            "wordtune": WordtuneLikeAssistant(),
            "spellbox": SpellboxLikeAssistant()
        }
    
    def _initialize_productivity_tools(self):
        """Initialize productivity tool integrations"""
        return {
            "fireflies": FirefliesLikeAssistant(),
            "autoresponder": AutoresponderLikeAssistant()
        }
    
    def _initialize_sales_marketing_tools(self):
        """Initialize sales and marketing tool integrations"""
        return {
            "conversica": ConversicaLikeAssistant(),
            "jasper": JasperLikeAssistant(),
            "copyai": CopyAILikeAssistant()
        }
    
    async def process_chat(self, message: str, personality: str = "default", 
                          conversation_history: List[Dict] = None) -> Dict:
        """Process chat with real AI"""
        if not conversation_history:
            conversation_history = []
        
        # Determine if specialized processing is needed
        if self._is_coding_request(message):
            return await self._process_coding_request(message, personality, conversation_history)
        elif self._is_writing_request(message):
            return await self._process_writing_request(message, personality, conversation_history)
        elif self._is_productivity_request(message):
            return await self._process_productivity_request(message, personality, conversation_history)
        elif self._is_sales_marketing_request(message):
            return await self._process_sales_marketing_request(message, personality, conversation_history)
        else:
            # Default to OpenAI for general requests
            return await self.openai.chat_completion(self._prepare_messages(message, personality, conversation_history), personality)
    
    def _is_coding_request(self, message: str) -> bool:
        """Determine if the message is a coding-related request"""
        coding_keywords = ["code", "function", "programming", "debug", "algorithm", "api", 
                          "javascript", "python", "java", "c++", "html", "css", "sql", 
                          "git", "github", "repository", "compile", "runtime", "syntax"]
        return any(keyword in message.lower() for keyword in coding_keywords)
    
    def _is_writing_request(self, message: str) -> bool:
        """Determine if the message is a writing-related request"""
        writing_keywords = ["grammar", "spelling", "punctuation", "rewrite", "rephrase", 
                           "proofread", "edit", "tone", "style", "formal", "informal", 
                           "essay", "article", "blog", "paragraph", "sentence"]
        return any(keyword in message.lower() for keyword in writing_keywords)
    
    def _is_productivity_request(self, message: str) -> bool:
        """Determine if the message is a productivity-related request"""
        productivity_keywords = ["meeting", "schedule", "calendar", "reminder", "task", 
                               "project", "organize", "summarize", "transcribe", "notes", 
                               "action items", "follow up", "email", "message"]
        return any(keyword in message.lower() for keyword in productivity_keywords)
    
    def _is_sales_marketing_request(self, message: str) -> bool:
        """Determine if the message is a sales/marketing-related request"""
        sales_keywords = ["marketing", "sales", "lead", "customer", "client", "campaign", 
                         "advertisement", "copy", "headline", "product description", 
                         "value proposition", "call to action", "conversion", "engagement"]
        return any(keyword in message.lower() for keyword in sales_keywords)
    
    async def _process_coding_request(self, message: str, personality: str, conversation_history: List[Dict]) -> Dict:
        """Process coding-related requests"""
        # Determine the most appropriate coding assistant
        if "function" in message.lower() or "complete" in message.lower():
            return await self.coding_assistants["copilot"].process_request(message, conversation_history)
        elif "error" in message.lower() or "fix" in message.lower():
            return await self.coding_assistants["blackbox"].process_request(message, conversation_history)
        elif "suggest" in message.lower() or "autocomplete" in message.lower():
            return await self.coding_assistants["tabnine"].process_request(message, conversation_history)
        elif "generate" in message.lower() or "create" in message.lower():
            return await self.coding_assistants["aixcoder"].process_request(message, conversation_history)
        else:
            return await self.coding_assistants["askcodi"].process_request(message, conversation_history)
    
    async def _process_writing_request(self, message: str, personality: str, conversation_history: List[Dict]) -> Dict:
        """Process writing-related requests"""
        # Determine the most appropriate writing assistant
        if "grammar" in message.lower() or "correct" in message.lower():
            return await self.writing_assistants["grammarly"].process_request(message, conversation_history)
        elif "rewrite" in message.lower() or "rephrase" in message.lower():
            return await self.writing_assistants["wordtune"].process_request(message, conversation_history)
        elif "spell" in message.lower() or "check" in message.lower():
            return await self.writing_assistants["spellbox"].process_request(message, conversation_history)
        else:
            # Default to Grammarly-like for general writing requests
            return await self.writing_assistants["grammarly"].process_request(message, conversation_history)
    
    async def _process_productivity_request(self, message: str, personality: str, conversation_history: List[Dict]) -> Dict:
        """Process productivity-related requests"""
        # Determine the most appropriate productivity tool
        if "meeting" in message.lower() or "transcribe" in message.lower():
            return await self.productivity_tools["fireflies"].process_request(message, conversation_history)
        elif "email" in message.lower() or "respond" in message.lower():
            return await self.productivity_tools["autoresponder"].process_request(message, conversation_history)
        else:
            # Default to Fireflies-like for general productivity requests
            return await self.productivity_tools["fireflies"].process_request(message, conversation_history)
    
    async def _process_sales_marketing_request(self, message: str, personality: str, conversation_history: List[Dict]) -> Dict:
        """Process sales/marketing-related requests"""
        # Determine the most appropriate sales/marketing tool
        if "lead" in message.lower() or "prospect" in message.lower():
            return await self.sales_marketing_tools["conversica"].process_request(message, conversation_history)
        elif "blog" in message.lower() or "content" in message.lower():
            return await self.sales_marketing_tools["jasper"].process_request(message, conversation_history)
        elif "copy" in message.lower() or "ad" in message.lower():
            return await self.sales_marketing_tools["copyai"].process_request(message, conversation_history)
        else:
            # Default to Jasper-like for general content requests
            return await self.sales_marketing_tools["jasper"].process_request(message, conversation_history)
    
    def _prepare_messages(self, message: str, personality: str, conversation_history: List[Dict]) -> List[Dict]:
        """Prepare messages for OpenAI chat completion"""
        # Get personality-specific system prompt
        system_prompt = self._get_personality_context(personality)
        
        # Prepare messages array
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add conversation history
        for msg in conversation_history:
            messages.append(msg)
        
        # Add current user message
        messages.append({"role": "user", "content": message})
        
        return messages

    async def generate_creative_content(self, content_type: str, prompt: str, parameters: Dict = None) -> Dict:
        """Generate creative content using OpenAI (songs, music videos, code, apps)"""
        if not parameters:
            parameters = {}
        
        # Create content-specific prompts
        content_prompts = {
            "song": f"Write song lyrics for a {parameters.get('genre', 'pop')} song about: {prompt}. Include verses, chorus, and bridge.",
            "music_video": f"Create a detailed music video concept for a song about: {prompt}. Include visual scenes, transitions, and artistic direction.",
            "code": f"Generate {parameters.get('language', 'Python')} code for: {prompt}. Include comments and follow best practices.",
            "app": f"Design an app concept for: {prompt}. Include features, user interface details, and technical requirements."
        }
        
        # Use the dj_zeeky personality for music-related content
        personality = "dj_zeeky" if content_type in ["song", "music_video"] else "coding_zeeky" if content_type == "code" else "creative_zeeky"
        
        content_prompt = content_prompts.get(content_type, prompt)
        messages = [{"role": "user", "content": content_prompt}]
        
        result = await self.openai.chat_completion(messages, personality)
        
        if result["success"]:
            return {
                "success": True,
                "content": result["response"],
                "type": content_type,
                "prompt": prompt,
                "timestamp": datetime.now().isoformat()
            }
        else:
            return result

# Global instance
zeeky_ai_integrations = ZeekyAIIntegrations()




