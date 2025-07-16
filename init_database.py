#!/usr/bin/env python3
"""
Database initialization script for Zeeky AI
"""

import asyncio
import os
from dotenv import load_dotenv
from db.database import init_database, close_database, create_tables
from db.models import User, Conversation, Message
from passlib.context import CryptContext

# Load environment variables
load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_demo_user():
    """Create a demo user for testing"""
    try:
        # Check if demo user already exists
        existing_user = await User.get_by_username("demo")
        if existing_user:
            print("✅ Demo user already exists")
            return existing_user
        
        # Create demo user
        hashed_password = pwd_context.hash("demo123")
        demo_user = User(
            username="demo",
            email="demo@zeeky.ai",
            hashed_password=hashed_password,
            full_name="Demo User"
        )
        await demo_user.save()
        print("✅ Demo user created successfully")
        print("   Username: demo")
        print("   Password: demo123")
        return demo_user
        
    except Exception as e:
        print(f"❌ Error creating demo user: {e}")
        return None

async def create_demo_conversation(user):
    """Create a demo conversation"""
    try:
        # Create conversation
        conversation = Conversation(
            user_id=user.id,
            title="Welcome to Zeeky AI"
        )
        await conversation.save()
        
        # Create welcome messages
        welcome_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content="Hello! Welcome to Zeeky AI. I'm your intelligent assistant ready to help with anything you need. How can I assist you today?"
        )
        await welcome_message.save()
        
        user_message = Message(
            conversation_id=conversation.id,
            role="user",
            content="Hi Zeeky! What can you do?"
        )
        await user_message.save()
        
        response_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content="I can help you with a wide variety of tasks including:\n\n• Answering questions and providing information\n• Creative writing and content generation\n• Technical assistance and coding help\n• Smart home automation\n• Productivity and task management\n• Entertainment and games\n\nJust ask me anything, and I'll do my best to help!"
        )
        await response_message.save()
        
        print("✅ Demo conversation created successfully")
        return conversation
        
    except Exception as e:
        print(f"❌ Error creating demo conversation: {e}")
        return None

async def main():
    """Main initialization function"""
    print("🚀 Initializing Zeeky AI Database...")
    print("=" * 50)
    
    try:
        # Initialize database
        await init_database()
        
        # Create demo user
        demo_user = await create_demo_user()
        
        if demo_user:
            # Create demo conversation
            await create_demo_conversation(demo_user)
        
        print("\n🎉 Database initialization completed!")
        print("\n📋 Next steps:")
        print("   1. Start the server: py test_server.py")
        print("   2. Open the test interface: zeeky_test_interface.html")
        print("   3. Try the authentication endpoints at /api/auth/")
        print("   4. Login with demo/demo123 to test user features")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
    
    finally:
        # Close database connection
        await close_database()

if __name__ == "__main__":
    asyncio.run(main())
