"""
🗄️ ZEEKY AI DATABASE SYSTEM
Advanced database management with SQLAlchemy and async support
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker
import aiosqlite
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./zeeky_ai.db")
ASYNC_DATABASE_URL = DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://")

# Create declarative base
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    preferences = Column(JSON, default={})

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    personality = Column(String(50), default="default")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    is_archived = Column(Boolean, default=False)
    meta_data = Column(JSON, default={})

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, index=True, nullable=False)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    model_used = Column(String(50))
    tokens_used = Column(Integer, default=0)
    meta_data = Column(JSON, default={})

class FileUpload(Base):
    __tablename__ = "file_uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    processed = Column(Boolean, default=False)
    meta_data = Column(JSON, default={})

class APIUsage(Base):
    __tablename__ = "api_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    endpoint = Column(String(100), nullable=False)
    method = Column(String(10), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    response_time_ms = Column(Integer)
    status_code = Column(Integer)
    tokens_used = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    meta_data = Column(JSON, default={})

class SecurityEvent(Base):
    __tablename__ = "security_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    event_type = Column(String(50), nullable=False)
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    timestamp = Column(DateTime, default=datetime.utcnow)
    severity = Column(String(20), default="low")
    details = Column(JSON, default={})
    resolved = Column(Boolean, default=False)

# Database Engine and Session Management
class DatabaseManager:
    """Advanced Database Manager with async support"""
    
    def __init__(self):
        self.engine = None
        self.async_engine = None
        self.SessionLocal = None
        self.AsyncSessionLocal = None
        self.initialized = False
    
    async def initialize(self):
        """Initialize database connections"""
        try:
            # Create async engine
            self.async_engine = create_async_engine(
                ASYNC_DATABASE_URL,
                echo=False,
                future=True
            )
            
            # Create async session factory
            self.AsyncSessionLocal = async_sessionmaker(
                self.async_engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            # Create tables
            async with self.async_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            
            self.initialized = True
            logger.info("✅ Database initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise
    
    async def close(self):
        """Close database connections"""
        if self.async_engine:
            await self.async_engine.dispose()
            logger.info("🔒 Database connections closed")
    
    async def get_async_session(self):
        """Get async database session"""
        if not self.initialized:
            await self.initialize()
        
        async with self.AsyncSessionLocal() as session:
            try:
                yield session
            finally:
                await session.close()
    
    async def health_check(self) -> Dict[str, Any]:
        """Check database health"""
        try:
            if not self.initialized:
                return {"status": "not_initialized", "healthy": False}
            
            async with self.AsyncSessionLocal() as session:
                # Simple query to test connection
                result = await session.execute("SELECT 1")
                await result.fetchone()
                
                return {
                    "status": "healthy",
                    "healthy": True,
                    "database_url": DATABASE_URL.split("://")[0] + "://***",
                    "tables_created": True
                }
                
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {
                "status": "unhealthy",
                "healthy": False,
                "error": str(e)
            }

# Global database manager instance
db_manager = DatabaseManager()

# Convenience functions for app.py
async def init_database():
    """Initialize database - called from app.py lifespan"""
    await db_manager.initialize()

async def close_database():
    """Close database - called from app.py lifespan"""
    await db_manager.close()

async def get_db():
    """Dependency for FastAPI routes"""
    async for session in db_manager.get_async_session():
        yield session

# Database utility functions
class DatabaseUtils:
    """Database utility functions"""
    
    @staticmethod
    async def create_user(session: AsyncSession, user_data: Dict[str, Any]) -> User:
        """Create a new user"""
        user = User(**user_data)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user
    
    @staticmethod
    async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
        """Get user by email"""
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_conversation(session: AsyncSession, user_id: int, title: str, personality: str = "default") -> Conversation:
        """Create a new conversation"""
        conversation = Conversation(
            user_id=user_id,
            title=title,
            personality=personality
        )
        session.add(conversation)
        await session.commit()
        await session.refresh(conversation)
        return conversation
    
    @staticmethod
    async def add_message(session: AsyncSession, conversation_id: int, role: str, content: str, **kwargs) -> Message:
        """Add a message to conversation"""
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            **kwargs
        )
        session.add(message)
        await session.commit()
        await session.refresh(message)
        return message
    
    @staticmethod
    async def log_api_usage(session: AsyncSession, user_id: int, endpoint: str, method: str, **kwargs):
        """Log API usage"""
        usage = APIUsage(
            user_id=user_id,
            endpoint=endpoint,
            method=method,
            **kwargs
        )
        session.add(usage)
        await session.commit()
    
    @staticmethod
    async def log_security_event(session: AsyncSession, event_type: str, **kwargs):
        """Log security event"""
        event = SecurityEvent(
            event_type=event_type,
            **kwargs
        )
        session.add(event)
        await session.commit()

# Export main components
__all__ = [
    'Base', 'User', 'Conversation', 'Message', 'FileUpload', 'APIUsage', 'SecurityEvent',
    'DatabaseManager', 'db_manager', 'init_database', 'close_database', 'get_db',
    'DatabaseUtils'
]
