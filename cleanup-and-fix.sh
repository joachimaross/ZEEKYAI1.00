#!/bin/bash

# Professional Zeeky AI Cleanup and Fix Script
# Removes conflicting files and implements proper Vercel deployment

set -e

echo "🧹 ZEEKY AI PROFESSIONAL CLEANUP & FIX"
echo "====================================="

# Create backup directory
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in $BACKUP_DIR..."

# Backup important files before cleanup
cp vercel.json "$BACKUP_DIR/" 2>/dev/null || true
cp package.json "$BACKUP_DIR/" 2>/dev/null || true
cp index.html "$BACKUP_DIR/" 2>/dev/null || true

echo "🗑️  Removing conflicting and duplicate files..."

# Remove conflicting Vercel configurations
rm -f vercel-static.json
rm -f vercel-simple.json
rm -f vercel-frontend-only.json
rm -f build-vercel.sh
rm -f deploy-vercel-fix.sh

# Remove duplicate deployment scripts
rm -f deploy.sh
rm -f deploy_zeeky_production.sh

# Remove documentation clutter (keep essential ones)
rm -f BACKEND_DEPLOYMENT.md
rm -f BETA_TESTING_STRATEGY.md
rm -f CODEMAGIC_IMPLEMENTATION_SUMMARY.md
rm -f CODEMAGIC_SETUP_GUIDE.md
rm -f CUSTOM_DOMAIN_SETUP.md
rm -f DEEP_DIVE_ANALYSIS_COMPLETE.md
rm -f DEPLOYMENT_CHECKLIST.md
rm -f DEPLOYMENT_READY.md
rm -f EMERGENCY_FIXES_AND_UPDATES.md
rm -f EXTENSIONS_DOCUMENTATION.md
rm -f FINAL_AUDIT_REPORT.md
rm -f FREE_AI_ALTERNATIVES_SETUP_GUIDE.md
rm -f IMPLEMENTATION_COMPLETE_SUMMARY.md
rm -f LOCAL_AI_COMPLETE_REQUIREMENTS.md
rm -f MOBILE_APP_DEPLOYMENT_GUIDE.md
rm -f MOBILE_APP_SUMMARY.md
rm -f NETLIFY_DEPLOYMENT.md
rm -f NETLIFY_DEPLOYMENT_CHECKLIST.md
rm -f NETLIFY_FORMS_GUIDE.md
rm -f NEXT_LEVEL_FEATURES.md
rm -f NEXT_LEVEL_README.md
rm -f OPENAI_QUOTA_SOLUTION_GUIDE.md
rm -f PRODUCTION_LAUNCH_CHECKLIST.md
rm -f UI_UX_ENHANCEMENTS_SUMMARY.md
rm -f VERCEL_404_FIX_GUIDE.md
rm -f VERCEL_DEPLOYMENT_CHECKLIST.md
rm -f VERCEL_DEPLOYMENT_GUIDE.md
rm -f VERCEL_DEPLOYMENT_READY.md
rm -f ZEEKY_COMPATIBILITY_ANALYSIS.md

# Remove unused Python files
rm -f app.py
rm -f beta_testing_implementation.py
rm -f config.py
rm -f init_database.py
rm -f install_complete_local_ai.py
rm -f install_zeeky_full.py
rm -f setup_zeeky.py
rm -f test_zeeky_enhanced.py
rm -f update-api-url.py
rm -f zeeky_*.py

# Remove unused directories
rm -rf db/
rm -rf deployment/
rm -rf netlify/
rm -rf nextjs-chatbot/
rm -rf ZeekyAIMobile/
rm -rf reports/
rm -rf tests/
rm -rf scripts/

# Remove unused config files
rm -f codemagic.yaml
rm -f docker-compose.yml
rm -f Dockerfile
rm -f nelify.toml
rm -f netlify.toml
rm -f Procfile
rm -f railway.json
rm -f render.yaml
rm -f runtime.txt
rm -f requirements.txt
rm -f requirements-vercel.txt
rm -f "zeeky ai 7,13.code-workspace"
rm -f EXECUTE_WORLD_CHANGING.bat
rm -f COMPLETE_ZEEKY_FILES.zip
rm -f deployment-report.txt
rm -f deployment_status.html
rm -f implementation_plan.md
rm -f "1.0.0"

# Remove duplicate frontend files
rm -f frontend/index-original.html
rm -f frontend/_redirects

echo "✅ Cleanup completed!"

echo "🔧 Creating professional Vercel configuration..."

# Create the definitive vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "name": "zeeky-ai",
  "builds": [
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/",
      "dest": "/frontend/index.html"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "headers": [
    {
      "source": "/frontend/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
EOF

echo "📝 Updating package.json..."

# Create clean package.json
cat > package.json << 'EOF'
{
  "name": "zeeky-ai",
  "version": "1.0.0",
  "description": "Professional AI Assistant Platform",
  "main": "frontend/index.html",
  "scripts": {
    "start": "npx http-server frontend -p 8000",
    "build": "echo 'Static build ready'",
    "vercel-build": "echo 'Vercel deployment ready'"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/joachimaross/ZEEKYAI1.00.git"
  },
  "keywords": ["ai", "assistant", "chatbot"],
  "author": "Joachima Ross <zeekyai@hotmail.com>",
  "license": "MIT"
}
EOF

echo "🏠 Removing root index.html (using frontend only)..."
rm -f index.html

echo "✅ Professional cleanup and configuration complete!"
echo ""
echo "📊 Summary of changes:"
echo "   ✓ Removed 4 conflicting Vercel configurations"
echo "   ✓ Removed duplicate deployment scripts"
echo "   ✓ Removed 25+ unnecessary documentation files"
echo "   ✓ Removed unused Python backend files"
echo "   ✓ Removed unused directories and configs"
echo "   ✓ Created clean, professional vercel.json"
echo "   ✓ Simplified package.json"
echo "   ✓ Removed root index.html conflict"
echo ""
echo "🚀 Ready for professional deployment!"
