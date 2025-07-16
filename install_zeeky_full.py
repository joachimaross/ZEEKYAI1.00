#!/usr/bin/env python3
"""
Zeeky AI Full Installation Script
Install all necessary dependencies and expansions for maximum potential
"""

import subprocess
import sys
import os
import json
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def install_python_packages():
    """Install all Python packages for Zeeky AI"""
    packages = [
        # Core AI and ML
        "openai>=1.0.0",
        "anthropic",
        "transformers",
        "torch",
        "numpy",
        "pandas",
        "scikit-learn",
        
        # Web Framework and API
        "fastapi>=0.104.0",
        "uvicorn[standard]>=0.24.0",
        "httpx>=0.25.0",
        "websockets>=12.0",
        "python-multipart>=0.0.6",
        
        # Database and Storage
        "sqlalchemy>=2.0.0",
        "databases[aiosqlite]>=0.8.0",
        "alembic>=1.12.0",
        "redis>=5.0.0",
        "pymongo>=4.5.0",
        
        # Authentication and Security
        "python-jose[cryptography]>=3.3.0",
        "passlib[bcrypt]>=1.7.4",
        "python-multipart>=0.0.6",
        "cryptography>=41.0.0",
        
        # Voice and Audio Processing
        "speechrecognition>=3.10.0",
        "pyttsx3>=2.90",
        "pyaudio>=0.2.11",
        "wave>=0.0.2",
        "librosa>=0.10.0",
        "soundfile>=0.12.0",
        
        # Image and Video Processing
        "pillow>=10.0.0",
        "opencv-python>=4.8.0",
        "imageio>=2.31.0",
        "matplotlib>=3.7.0",
        
        # Natural Language Processing
        "nltk>=3.8.0",
        "spacy>=3.7.0",
        "textblob>=0.17.0",
        "langchain>=0.0.300",
        "sentence-transformers>=2.2.0",
        
        # Smart Home and IoT
        "paho-mqtt>=1.6.0",
        "bleak>=0.21.0",  # Bluetooth Low Energy
        "zeroconf>=0.112.0",  # Network discovery
        "requests>=2.31.0",
        
        # Business and Productivity
        "python-docx>=0.8.11",
        "openpyxl>=3.1.0",
        "reportlab>=4.0.0",
        "jinja2>=3.1.0",
        "email-validator>=2.0.0",
        
        # Scheduling and Calendar
        "python-dateutil>=2.8.0",
        "icalendar>=5.0.0",
        "pytz>=2023.3",
        
        # Data Processing and Analytics
        "plotly>=5.17.0",
        "seaborn>=0.12.0",
        "jupyter>=1.0.0",
        "ipython>=8.15.0",
        
        # Environment and Configuration
        "python-dotenv>=1.0.0",
        "pydantic>=2.4.0",
        "pyyaml>=6.0.0",
        "toml>=0.10.0",
        
        # Testing and Development
        "pytest>=7.4.0",
        "pytest-asyncio>=0.21.0",
        "black>=23.9.0",
        "flake8>=6.1.0",
        
        # Additional Utilities
        "rich>=13.6.0",  # Beautiful terminal output
        "click>=8.1.0",  # CLI framework
        "watchdog>=3.0.0",  # File system monitoring
        "psutil>=5.9.0",  # System monitoring
        "schedule>=1.2.0",  # Job scheduling
    ]
    
    print("📦 Installing Python packages...")
    for package in packages:
        success = run_command(f"py -m pip install {package}", f"Installing {package}")
        if not success:
            print(f"⚠️  Failed to install {package}, continuing...")
    
    return True

def install_spacy_models():
    """Install spaCy language models"""
    models = [
        "en_core_web_sm",
        "en_core_web_md",
        "en_core_web_lg"
    ]
    
    print("🧠 Installing spaCy language models...")
    for model in models:
        run_command(f"py -m spacy download {model}", f"Installing spaCy model {model}")

def setup_nltk_data():
    """Download NLTK data"""
    print("📚 Setting up NLTK data...")
    nltk_script = '''
import nltk
import ssl

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('vader_lexicon')
nltk.download('averaged_perceptron_tagger')
print("NLTK data downloaded successfully")
'''
    
    with open("setup_nltk.py", "w") as f:
        f.write(nltk_script)
    
    run_command("py setup_nltk.py", "Downloading NLTK data")
    os.remove("setup_nltk.py")

def create_environment_file():
    """Create comprehensive .env file"""
    env_content = """# Zeeky AI Configuration File
# API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
AZURE_API_KEY=your_azure_api_key_here

# Database Configuration
DATABASE_URL=sqlite:///./zeeky.db
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://localhost:27017/zeeky

# Security
JWT_SECRET_KEY=your_super_secret_jwt_key_change_in_production
ENCRYPTION_KEY=your_encryption_key_here

# Voice Services
SPEECH_RECOGNITION_ENGINE=google
TTS_ENGINE=elevenlabs
VOICE_WAKE_WORD=aye zeeky

# Smart Home Integration
MQTT_BROKER=localhost
MQTT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=

# Business Integration
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
CALENDAR_API_KEY=your_calendar_api_key
SLACK_BOT_TOKEN=your_slack_bot_token

# External Services
WEATHER_API_KEY=your_weather_api_key
NEWS_API_KEY=your_news_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Application Settings
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=INFO
MAX_CONVERSATION_HISTORY=100
ENABLE_LEARNING=True
ENABLE_VOICE=True
ENABLE_SMART_HOME=True
ENABLE_BUSINESS_FEATURES=True

# Performance Settings
MAX_WORKERS=4
CACHE_TTL=3600
REQUEST_TIMEOUT=30
MAX_FILE_SIZE=10485760

# Feature Flags
ENABLE_RAG=True
ENABLE_MULTIMODAL=True
ENABLE_ANALYTICS=True
ENABLE_AUTOMATION=True
"""
    
    if not os.path.exists(".env"):
        with open(".env", "w") as f:
            f.write(env_content)
        print("✅ Created comprehensive .env configuration file")
    else:
        print("⚠️  .env file already exists, skipping creation")

def create_requirements_full():
    """Create comprehensive requirements.txt"""
    requirements_content = """# Zeeky AI - Full Requirements
# Core AI and ML
openai>=1.0.0
anthropic>=0.7.0
transformers>=4.35.0
torch>=2.1.0
numpy>=1.24.0
pandas>=2.1.0
scikit-learn>=1.3.0

# Web Framework and API
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
httpx>=0.25.0
websockets>=12.0
python-multipart>=0.0.6

# Database and Storage
sqlalchemy>=2.0.0
databases[aiosqlite]>=0.8.0
alembic>=1.12.0
redis>=5.0.0
pymongo>=4.5.0

# Authentication and Security
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
cryptography>=41.0.0

# Voice and Audio Processing
speechrecognition>=3.10.0
pyttsx3>=2.90
pyaudio>=0.2.11
librosa>=0.10.0
soundfile>=0.12.0

# Image and Video Processing
pillow>=10.0.0
opencv-python>=4.8.0
imageio>=2.31.0
matplotlib>=3.7.0

# Natural Language Processing
nltk>=3.8.0
spacy>=3.7.0
textblob>=0.17.0
langchain>=0.0.300
sentence-transformers>=2.2.0

# Smart Home and IoT
paho-mqtt>=1.6.0
bleak>=0.21.0
zeroconf>=0.112.0
requests>=2.31.0

# Business and Productivity
python-docx>=0.8.11
openpyxl>=3.1.0
reportlab>=4.0.0
jinja2>=3.1.0
email-validator>=2.0.0

# Scheduling and Calendar
python-dateutil>=2.8.0
icalendar>=5.0.0
pytz>=2023.3

# Data Processing and Analytics
plotly>=5.17.0
seaborn>=0.12.0

# Environment and Configuration
python-dotenv>=1.0.0
pydantic>=2.4.0
pyyaml>=6.0.0

# Additional Utilities
rich>=13.6.0
click>=8.1.0
watchdog>=3.0.0
psutil>=5.9.0
schedule>=1.2.0
"""
    
    with open("requirements_full.txt", "w") as f:
        f.write(requirements_content)
    print("✅ Created comprehensive requirements_full.txt")

def create_startup_script():
    """Create startup script for Zeeky"""
    startup_content = '''#!/usr/bin/env python3
"""
Zeeky AI Startup Script
Launch Zeeky with all features enabled
"""

import asyncio
import uvicorn
import sys
import os
from pathlib import Path

# Add current directory to Python path
sys.path.append(str(Path(__file__).parent))

def main():
    """Main startup function"""
    print("🤖 Starting Zeeky AI - Full Potential Mode")
    print("=" * 50)
    
    # Check if .env file exists
    if not os.path.exists(".env"):
        print("⚠️  Warning: .env file not found. Some features may not work.")
        print("   Please configure your API keys in the .env file.")
    
    # Start the server
    try:
        uvicorn.run(
            "app:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\\n👋 Zeeky AI shutdown complete")
    except Exception as e:
        print(f"❌ Error starting Zeeky AI: {e}")

if __name__ == "__main__":
    main()
'''
    
    with open("start_zeeky.py", "w") as f:
        f.write(startup_content)
    print("✅ Created startup script: start_zeeky.py")

def create_feature_test_script():
    """Create comprehensive feature test script"""
    test_content = '''#!/usr/bin/env python3
"""
Zeeky AI Feature Test Script
Test all installed features and capabilities
"""

import asyncio
import sys
import os
from pathlib import Path

# Add current directory to Python path
sys.path.append(str(Path(__file__).parent))

async def test_all_features():
    """Test all Zeeky features"""
    print("🧪 Testing Zeeky AI Features")
    print("=" * 50)
    
    tests_passed = 0
    tests_total = 0
    
    # Test 1: Basic imports
    tests_total += 1
    try:
        from app import app
        print("✅ Test 1: Basic app import - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 1: Basic app import - FAILED: {e}")
    
    # Test 2: RAG System
    tests_total += 1
    try:
        from zeeky_rag_system import rag_system
        result = await rag_system.enhanced_chat("Hello Zeeky!")
        if result["success"]:
            print("✅ Test 2: RAG System - PASSED")
            tests_passed += 1
        else:
            print("❌ Test 2: RAG System - FAILED")
    except Exception as e:
        print(f"❌ Test 2: RAG System - FAILED: {e}")
    
    # Test 3: Business System
    tests_total += 1
    try:
        from zeeky_business_system import crm_system, task_manager
        contacts = await crm_system.get_contacts()
        tasks = await task_manager.get_tasks()
        print("✅ Test 3: Business System - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 3: Business System - FAILED: {e}")
    
    # Test 4: Voice Service
    tests_total += 1
    try:
        from zeeky_voice_service import voice_service
        voices = await voice_service.get_available_voices()
        print("✅ Test 4: Voice Service - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 4: Voice Service - FAILED: {e}")
    
    # Test 5: Smart Home
    tests_total += 1
    try:
        from zeeky_smart_home_service import smart_home_hub
        devices = await smart_home_hub.get_all_devices()
        print("✅ Test 5: Smart Home System - PASSED")
        tests_passed += 1
    except Exception as e:
        print(f"❌ Test 5: Smart Home System - FAILED: {e}")
    
    print("\\n" + "=" * 50)
    print(f"🎯 Test Results: {tests_passed}/{tests_total} tests passed")
    
    if tests_passed == tests_total:
        print("🎉 All tests passed! Zeeky is ready for full operation!")
    else:
        print("⚠️  Some tests failed. Check the error messages above.")
    
    return tests_passed == tests_total

if __name__ == "__main__":
    asyncio.run(test_all_features())
'''
    
    with open("test_zeeky_features.py", "w") as f:
        f.write(test_content)
    print("✅ Created feature test script: test_zeeky_features.py")

def main():
    """Main installation function"""
    print("🚀 Zeeky AI Full Installation")
    print("=" * 50)
    print("Installing all necessary expansions for maximum potential...")
    print()
    
    # Step 1: Install Python packages
    install_python_packages()
    print()
    
    # Step 2: Install spaCy models
    install_spacy_models()
    print()
    
    # Step 3: Setup NLTK data
    setup_nltk_data()
    print()
    
    # Step 4: Create configuration files
    create_environment_file()
    create_requirements_full()
    create_startup_script()
    create_feature_test_script()
    print()
    
    print("🎉 Zeeky AI Full Installation Complete!")
    print("=" * 50)
    print()
    print("📋 Next Steps:")
    print("1. Configure your API keys in the .env file")
    print("2. Run: py test_zeeky_features.py (to test all features)")
    print("3. Run: py start_zeeky.py (to start Zeeky with full features)")
    print()
    print("🔑 Important API Keys to Configure:")
    print("   - OPENAI_API_KEY (for AI chat)")
    print("   - ELEVENLABS_API_KEY (for voice synthesis)")
    print("   - GOOGLE_API_KEY (for additional services)")
    print()
    print("🌟 Zeeky is now ready to reach his full potential!")

if __name__ == "__main__":
    main()
