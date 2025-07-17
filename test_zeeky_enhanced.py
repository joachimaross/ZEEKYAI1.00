#!/usr/bin/env python3
"""
Comprehensive Test Suite for Zeeky AI 2.0 Enhanced
Tests all major components and features
"""

import asyncio
import pytest
import json
import tempfile
from pathlib import Path
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import Zeeky components
try:
    from zeeky_enhanced_ai import enhanced_zeeky, ZeekyPersonality
    from zeeky_rate_limiter import rate_limiter, api_key_manager
    from zeeky_file_processor import file_processor
    from zeeky_security import security_manager
    from zeeky_websocket import connection_manager
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure all dependencies are installed: pip install -r requirements.txt")
    sys.exit(1)

class TestZeekyEnhanced:
    """Test suite for Zeeky AI 2.0 Enhanced features"""
    
    @pytest.mark.asyncio
    async def test_enhanced_ai_system(self):
        """Test the enhanced AI system"""
        print("\n🧠 Testing Enhanced AI System...")
        
        # Test basic chat
        response = await enhanced_zeeky.chat("Hello!", personality="default")
        assert response["success"] == True
        assert len(response["response"]) > 0
        print(f"   ✅ Basic chat: {response['response'][:50]}...")
        
        # Test different personalities
        personalities = ["creative", "technical", "casual", "professional", "philosopher"]
        for personality in personalities:
            response = await enhanced_zeeky.chat("Tell me about yourself", personality=personality)
            assert response["success"] == True
            assert len(response["response"]) > 0
            print(f"   ✅ {personality.capitalize()} personality working")
        
        # Test conversation context
        response1 = await enhanced_zeeky.chat("My name is Alice", user_id="test_user", chat_id="test_chat")
        response2 = await enhanced_zeeky.chat("What's my name?", user_id="test_user", chat_id="test_chat")
        assert response1["success"] == True
        assert response2["success"] == True
        print("   ✅ Conversation context working")
    
    def test_personality_system(self):
        """Test the personality system"""
        print("\n🎭 Testing Personality System...")
        
        # Test personality configurations
        personalities = ZeekyPersonality.PERSONALITIES
        assert len(personalities) >= 6
        print(f"   ✅ {len(personalities)} personalities available")
        
        # Test personality switching
        result = enhanced_zeeky.switch_personality("test_user", "test_chat", "creative")
        assert result["success"] == True
        print("   ✅ Personality switching working")
        
        # Test conversation stats
        stats = enhanced_zeeky.get_conversation_stats("test_user", "test_chat")
        assert "personality" in stats
        assert "message_count" in stats
        print("   ✅ Conversation stats working")
    
    @pytest.mark.asyncio
    async def test_rate_limiter(self):
        """Test the rate limiting system"""
        print("\n🚦 Testing Rate Limiter...")
        
        # Test rate limit check
        result = await rate_limiter.check_rate_limit("test_user", "127.0.0.1", "free_user")
        assert result["allowed"] == True
        assert "remaining" in result
        print("   ✅ Rate limit check working")
        
        # Test API key validation
        validation = api_key_manager.validate_api_key("test-key")
        assert "valid" in validation
        print("   ✅ API key validation working")
        
        # Test global stats
        stats = rate_limiter.get_global_stats()
        assert "global_requests" in stats
        print("   ✅ Rate limiter stats working")
    
    @pytest.mark.asyncio
    async def test_file_processor(self):
        """Test the file processing system"""
        print("\n📁 Testing File Processor...")
        
        # Create test files
        test_files = {
            "test.txt": b"Hello, this is a test file with some content.",
            "test.json": b'{"name": "test", "value": 123}',
            "test.py": b'def hello():\n    print("Hello, World!")\n\nhello()'
        }
        
        for filename, content in test_files.items():
            result = await file_processor.upload_file(content, filename, "test_user")
            assert result["success"] == True
            assert "file_id" in result
            print(f"   ✅ {filename} processed successfully")
            
            # Test file info retrieval
            file_info = file_processor.get_file_info(result["file_id"])
            assert file_info is not None
            assert file_info["original_name"] == filename
            
            # Clean up
            file_processor.delete_file(result["file_id"])
    
    def test_security_manager(self):
        """Test the security system"""
        print("\n🔒 Testing Security Manager...")
        
        # Test input validation
        test_inputs = [
            ("Hello world", "text", True),
            ("<script>alert('xss')</script>", "text", False),
            ("user@example.com", "email", True),
            ("invalid-email", "email", False),
            ("https://example.com", "url", True),
            ("not-a-url", "url", False)
        ]
        
        for input_data, input_type, should_be_valid in test_inputs:
            result = security_manager.validate_input(input_data, input_type)
            assert result["valid"] == should_be_valid
            print(f"   ✅ {input_type} validation: {input_data[:20]}... -> {result['valid']}")
        
        # Test token generation and verification
        token = security_manager.generate_token("test_user")
        verification = security_manager.verify_token(token)
        assert verification["valid"] == True
        assert verification["user_id"] == "test_user"
        print("   ✅ Token generation and verification working")
        
        # Test password hashing
        password = "test_password_123"
        hashed = security_manager.hash_password(password)
        assert security_manager.verify_password(password, hashed) == True
        assert security_manager.verify_password("wrong_password", hashed) == False
        print("   ✅ Password hashing working")
    
    def test_websocket_manager(self):
        """Test the WebSocket connection manager"""
        print("\n🔌 Testing WebSocket Manager...")
        
        # Test connection info
        stats = connection_manager.get_stats()
        assert "active_connections" in stats
        assert "active_rooms" in stats
        print("   ✅ WebSocket stats working")
        
        # Test room user management
        users = asyncio.run(connection_manager.get_room_users("test_room"))
        assert isinstance(users, list)
        print("   ✅ Room user management working")

def test_integration():
    """Test integration between components"""
    print("\n🔗 Testing Component Integration...")
    
    # Test that all components can be imported and initialized
    components = [
        enhanced_zeeky,
        rate_limiter,
        file_processor,
        security_manager,
        connection_manager
    ]
    
    for component in components:
        assert component is not None
        print(f"   ✅ {component.__class__.__name__} initialized")

def test_api_endpoints():
    """Test API endpoint availability"""
    print("\n🌐 Testing API Endpoints...")
    
    try:
        from app import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # Test basic endpoints
        endpoints = [
            ("/", "GET"),
            ("/api/personality/list", "GET"),
            ("/api/security/stats", "GET")
        ]
        
        for endpoint, method in endpoints:
            if method == "GET":
                response = client.get(endpoint)
            else:
                response = client.post(endpoint, json={})
            
            # Check that endpoint exists (not 404)
            assert response.status_code != 404
            print(f"   ✅ {method} {endpoint} -> {response.status_code}")
            
    except ImportError:
        print("   ⚠️  FastAPI test client not available, skipping API tests")

def run_comprehensive_test():
    """Run all tests"""
    print("🚀 Starting Zeeky AI 2.0 Enhanced Test Suite")
    print("=" * 60)
    
    test_instance = TestZeekyEnhanced()
    
    try:
        # Run async tests
        asyncio.run(test_instance.test_enhanced_ai_system())
        asyncio.run(test_instance.test_rate_limiter())
        asyncio.run(test_instance.test_file_processor())
        
        # Run sync tests
        test_instance.test_personality_system()
        test_instance.test_security_manager()
        test_instance.test_websocket_manager()
        
        # Run integration tests
        test_integration()
        test_api_endpoints()
        
        print("\n" + "=" * 60)
        print("🎉 ALL TESTS PASSED! Zeeky AI 2.0 Enhanced is working correctly!")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

def quick_test():
    """Run a quick test of core functionality"""
    print("⚡ Quick Test of Core Functionality")
    print("-" * 40)
    
    try:
        # Test enhanced AI
        response = asyncio.run(enhanced_zeeky.chat("Hello!", personality="default"))
        assert response["success"] == True
        print("✅ Enhanced AI working")
        
        # Test security
        result = security_manager.validate_input("Hello world", "text")
        assert result["valid"] == True
        print("✅ Security validation working")
        
        # Test rate limiter
        result = asyncio.run(rate_limiter.check_rate_limit("test", "127.0.0.1"))
        assert result["allowed"] == True
        print("✅ Rate limiter working")
        
        print("\n🎉 Quick test passed! Core systems operational.")
        return True
        
    except Exception as e:
        print(f"\n❌ Quick test failed: {e}")
        return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Test Zeeky AI 2.0 Enhanced")
    parser.add_argument("--quick", action="store_true", help="Run quick test only")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    if args.quick:
        success = quick_test()
    else:
        success = run_comprehensive_test()
    
    sys.exit(0 if success else 1)
