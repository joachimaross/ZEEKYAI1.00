#!/bin/bash
# Ultra-lightweight build script for Vercel deployment

echo "🚀 Starting ZEEKY AI Vercel build..."

# Copy minimal requirements
echo "📦 Using minimal requirements..."
cp requirements-vercel.txt requirements.txt

# Remove large directories that might be included
echo "🧹 Cleaning up large files..."
rm -rf __pycache__
rm -rf .pytest_cache
rm -rf *.egg-info
rm -rf build
rm -rf dist
rm -rf venv
rm -rf env
rm -rf .venv
rm -rf node_modules
rm -rf .git
find . -name "*.pyc" -delete
find . -name "*.pyo" -delete
find . -name "*.pyd" -delete

echo "✅ Build preparation complete!"
echo "📊 Final size check..."
du -sh . 2>/dev/null || echo "Size check not available"

echo "🎉 ZEEKY AI ready for Vercel deployment!"
