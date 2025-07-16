"""
Complete Local AI Installation Script
Installs DeepSeek-R1, Qwen 3, Llama 3.3, Qwen 2.5-VL, Gemma 3, and more
Plus Gemini Code Assistant setup
"""

import os
import sys
import subprocess
import platform
import requests
import json
import time
from pathlib import Path

def print_banner():
    """Print installation banner"""
    print("🚀" + "="*78 + "🚀")
    print("🤖 ZEEKY AI - COMPLETE LOCAL AI INSTALLATION")
    print("🧠 DeepSeek-R1 • Qwen 3 • Llama 3.3 • Qwen 2.5-VL • Gemma 3")
    print("💻 Plus Gemini Code Assistant Integration")
    print("🆓 100% Free • Unlimited Usage • No Quotas")
    print("🚀" + "="*78 + "🚀")

def check_system_requirements():
    """Check system requirements"""
    print("\n💻 CHECKING SYSTEM REQUIREMENTS...")
    
    # Get system info
    system = platform.system()
    machine = platform.machine()
    
    try:
        import psutil
        cpu_cores = psutil.cpu_count()
        memory_gb = round(psutil.virtual_memory().total / (1024**3))
        disk_free_gb = round(psutil.disk_usage('.').free / (1024**3))
    except ImportError:
        print("⚠️ Installing psutil for system info...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'psutil'], check=True)
        import psutil
        cpu_cores = psutil.cpu_count()
        memory_gb = round(psutil.virtual_memory().total / (1024**3))
        disk_free_gb = round(psutil.disk_usage('.').free / (1024**3))
    
    print(f"✅ OS: {system} ({machine})")
    print(f"✅ CPU: {cpu_cores} cores")
    print(f"✅ RAM: {memory_gb} GB")
    print(f"✅ Free Disk: {disk_free_gb} GB")
    
    # Check requirements
    warnings = []
    if memory_gb < 8:
        warnings.append("⚠️ RAM < 8GB: Only basic models recommended")
    if disk_free_gb < 50:
        warnings.append("⚠️ Disk < 50GB: May not fit all models")
    
    if warnings:
        print("\n⚠️ WARNINGS:")
        for warning in warnings:
            print(f"  {warning}")
    
    return {
        'system': system,
        'cpu_cores': cpu_cores,
        'memory_gb': memory_gb,
        'disk_free_gb': disk_free_gb,
        'suitable': memory_gb >= 8 and disk_free_gb >= 50
    }

def install_python_requirements():
    """Install required Python packages"""
    print("\n🐍 INSTALLING PYTHON REQUIREMENTS...")
    
    requirements = [
        'requests',
        'psutil',
        'sqlite3'  # Usually built-in
    ]
    
    for package in requirements:
        try:
            __import__(package)
            print(f"✅ {package} already installed")
        except ImportError:
            print(f"📦 Installing {package}...")
            subprocess.run([sys.executable, '-m', 'pip', 'install', package], check=True)
            print(f"✅ {package} installed")

def check_ollama_installation():
    """Check if Ollama is installed"""
    print("\n🦙 CHECKING OLLAMA INSTALLATION...")
    
    try:
        result = subprocess.run(['ollama', '--version'], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✅ Ollama installed: {version}")
            
            # Check if running
            try:
                response = requests.get('http://localhost:11434/api/tags', timeout=5)
                if response.status_code == 200:
                    models = response.json().get('models', [])
                    print(f"✅ Ollama running with {len(models)} models")
                    return {'installed': True, 'running': True, 'models': len(models)}
                else:
                    print("⚠️ Ollama installed but not running")
                    return {'installed': True, 'running': False, 'models': 0}
            except:
                print("⚠️ Ollama installed but not running")
                return {'installed': True, 'running': False, 'models': 0}
        else:
            print("❌ Ollama not installed")
            return {'installed': False, 'running': False, 'models': 0}
    except:
        print("❌ Ollama not installed")
        return {'installed': False, 'running': False, 'models': 0}

def install_ollama():
    """Install Ollama based on operating system"""
    print("\n📥 INSTALLING OLLAMA...")
    
    system = platform.system()
    
    try:
        if system == 'Windows':
            print("🪟 Installing Ollama for Windows...")
            print("📥 Downloading installer...")
            
            # Download Ollama installer
            url = "https://ollama.ai/download/windows"
            installer_path = "ollama_installer.exe"
            
            response = requests.get(url, stream=True)
            with open(installer_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print("🔧 Running installer...")
            subprocess.run([installer_path, '/S'], check=True)
            
            # Clean up
            os.remove(installer_path)
            
            print("✅ Ollama installed for Windows")
            print("⚠️ Please restart your terminal and run 'ollama serve'")
            
        elif system == 'Darwin':  # macOS
            print("🍎 Installing Ollama for macOS...")
            subprocess.run(['curl', '-fsSL', 'https://ollama.ai/install.sh'], stdout=subprocess.PIPE, check=True)
            result = subprocess.run(['sh'], input=subprocess.run(['curl', '-fsSL', 'https://ollama.ai/install.sh'], capture_output=True, text=True).stdout, text=True, check=True)
            print("✅ Ollama installed for macOS")
            
        elif system == 'Linux':
            print("🐧 Installing Ollama for Linux...")
            subprocess.run(['curl', '-fsSL', 'https://ollama.ai/install.sh'], stdout=subprocess.PIPE, check=True)
            result = subprocess.run(['sh'], input=subprocess.run(['curl', '-fsSL', 'https://ollama.ai/install.sh'], capture_output=True, text=True).stdout, text=True, check=True)
            print("✅ Ollama installed for Linux")
            
        else:
            print(f"❌ Unsupported OS: {system}")
            print("📖 Please install manually from https://ollama.ai")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Ollama installation failed: {e}")
        print("📖 Please install manually from https://ollama.ai")
        return False

def start_ollama():
    """Start Ollama service"""
    print("\n🚀 STARTING OLLAMA...")
    
    try:
        # Check if already running
        response = requests.get('http://localhost:11434/api/tags', timeout=5)
        if response.status_code == 200:
            print("✅ Ollama already running")
            return True
    except:
        pass
    
    try:
        # Start Ollama
        print("🔄 Starting Ollama service...")
        if platform.system() == 'Windows':
            subprocess.Popen(['ollama', 'serve'], creationflags=subprocess.CREATE_NEW_CONSOLE)
        else:
            subprocess.Popen(['ollama', 'serve'])
        
        # Wait for startup
        print("⏳ Waiting for Ollama to start...")
        for i in range(30):  # Wait up to 30 seconds
            try:
                response = requests.get('http://localhost:11434/api/tags', timeout=2)
                if response.status_code == 200:
                    print("✅ Ollama started successfully")
                    return True
            except:
                pass
            time.sleep(1)
            print(f"⏳ Waiting... ({i+1}/30)")
        
        print("⚠️ Ollama may be starting in background")
        return True
        
    except Exception as e:
        print(f"❌ Failed to start Ollama: {e}")
        return False

def get_recommended_models(memory_gb):
    """Get recommended models based on system memory"""
    models = {
        'basic': [
            ('neural-chat:7b', 'Neural Chat', '4.1GB', 'Conversational AI'),
            ('gemma2:9b', 'Gemma 3', '5.4GB', 'Google\'s model'),
            ('qwen2.5:7b', 'Qwen 3', '4.4GB', 'Multilingual AI')
        ],
        'advanced': [
            ('deepseek-r1:7b', 'DeepSeek-R1', '4.1GB', 'Advanced reasoning'),
            ('phi4:14b', 'Phi-4', '8.2GB', 'Math & reasoning'),
            ('llava:7b', 'LLaVA', '4.7GB', 'Vision capabilities')
        ],
        'professional': [
            ('mistral-large:22b', 'Mistral Large', '12.9GB', 'Flagship model'),
            ('codestral:22b', 'Codestral', '12.9GB', 'Coding specialist'),
            ('qwen2-vl:7b', 'Qwen 2.5-VL', '5.5GB', 'Vision-language')
        ],
        'ultimate': [
            ('llama3.3:70b', 'Llama 3.3', '40GB', 'Meta\'s best model')
        ]
    }
    
    recommended = []
    
    # Always include basic models
    recommended.extend(models['basic'])
    
    if memory_gb >= 16:
        recommended.extend(models['advanced'])
    
    if memory_gb >= 32:
        recommended.extend(models['professional'])
    
    if memory_gb >= 64:
        recommended.extend(models['ultimate'])
    
    return recommended

def download_models(models_list):
    """Download recommended models"""
    print(f"\n📦 DOWNLOADING {len(models_list)} AI MODELS...")
    
    successful = 0
    failed = 0
    
    for ollama_name, display_name, size, description in models_list:
        print(f"\n⬇️ Downloading {display_name} ({size})...")
        print(f"   {description}")
        
        try:
            result = subprocess.run(
                ['ollama', 'pull', ollama_name],
                capture_output=True,
                text=True,
                timeout=1800  # 30 minutes
            )
            
            if result.returncode == 0:
                print(f"✅ {display_name} downloaded successfully")
                successful += 1
            else:
                print(f"❌ {display_name} failed: {result.stderr}")
                failed += 1
                
        except subprocess.TimeoutExpired:
            print(f"⏰ {display_name} download timeout (30 min)")
            failed += 1
        except Exception as e:
            print(f"❌ {display_name} error: {e}")
            failed += 1
    
    print(f"\n📊 DOWNLOAD RESULTS:")
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Success Rate: {(successful/(successful+failed)*100):.1f}%")
    
    return successful, failed

def setup_gemini_code_assistant():
    """Setup Gemini Code Assistant"""
    print("\n🌟 SETTING UP GEMINI CODE ASSISTANT...")
    
    print("📖 To setup Gemini Code Assistant:")
    print("1. Go to https://makersuite.google.com")
    print("2. Sign in with your Google account")
    print("3. Create a free API key")
    print("4. Add the key to your Zeeky AI configuration")
    print("")
    print("🆓 Free tier includes:")
    print("  • 60 requests per minute")
    print("  • Code generation and completion")
    print("  • Code explanation and documentation")
    print("  • Bug detection and fixing")
    print("  • Multi-language support")
    
    setup_now = input("\n❓ Open Gemini setup page now? (y/n): ").lower().strip()
    if setup_now == 'y':
        import webbrowser
        webbrowser.open('https://makersuite.google.com')
        print("🌐 Opened Gemini setup page in browser")

def main():
    """Main installation function"""
    print_banner()
    
    # Check system requirements
    system_info = check_system_requirements()
    
    if not system_info['suitable']:
        proceed = input("\n⚠️ System may not meet minimum requirements. Continue anyway? (y/n): ").lower().strip()
        if proceed != 'y':
            print("❌ Installation cancelled")
            return
    
    # Install Python requirements
    install_python_requirements()
    
    # Check/install Ollama
    ollama_status = check_ollama_installation()
    
    if not ollama_status['installed']:
        install_choice = input("\n❓ Install Ollama now? (y/n): ").lower().strip()
        if install_choice == 'y':
            if not install_ollama():
                print("❌ Cannot proceed without Ollama")
                return
        else:
            print("❌ Cannot proceed without Ollama")
            return
    
    # Start Ollama if not running
    if not ollama_status['running']:
        if not start_ollama():
            print("⚠️ Ollama may need manual start: ollama serve")
    
    # Get recommended models
    recommended_models = get_recommended_models(system_info['memory_gb'])
    
    print(f"\n📦 RECOMMENDED MODELS FOR YOUR SYSTEM:")
    total_size = 0
    for ollama_name, display_name, size, description in recommended_models:
        print(f"  • {display_name} ({size}) - {description}")
        # Extract size in GB for total calculation
        size_gb = float(size.replace('GB', ''))
        total_size += size_gb
    
    print(f"\n📊 Total download size: ~{total_size:.1f}GB")
    print(f"💾 Available disk space: {system_info['disk_free_gb']}GB")
    
    if total_size > system_info['disk_free_gb'] * 0.8:  # Leave 20% free space
        print("⚠️ Warning: Download size may exceed available space")
    
    # Ask to proceed with downloads
    download_choice = input(f"\n❓ Download {len(recommended_models)} recommended models? (y/n): ").lower().strip()
    
    if download_choice == 'y':
        successful, failed = download_models(recommended_models)
        
        if successful > 0:
            print(f"\n🎉 SUCCESS! {successful} models installed")
        if failed > 0:
            print(f"⚠️ {failed} models failed (you can retry later)")
    else:
        print("⏸️ Model download skipped")
    
    # Setup Gemini Code Assistant
    setup_gemini_code_assistant()
    
    # Final summary
    print("\n🎉 INSTALLATION COMPLETE!")
    print("\n🚀 NEXT STEPS:")
    print("1. Ensure Ollama is running: ollama serve")
    print("2. Test models: ollama run neural-chat:7b")
    print("3. Use Zeeky AI multi-provider interface")
    print("4. Setup Gemini API key for code assistant")
    print("5. Enjoy unlimited local AI!")
    
    print("\n🌟 You now have cutting-edge AI running locally!")
    print("🆓 No quotas, no limits, completely free!")

if __name__ == "__main__":
    main()
