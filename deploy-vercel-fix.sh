#!/bin/bash

# Zeeky AI Vercel Deployment Fix Script
# This script fixes common deployment issues and ensures proper configuration

echo "🚀 Starting Zeeky AI Vercel deployment fix..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Create backup of current vercel.json
if [ -f "vercel.json" ]; then
    cp vercel.json vercel.json.backup
    echo "✅ Backed up existing vercel.json"
fi

# Ensure all required directories exist
echo "📁 Checking directory structure..."
mkdir -p frontend/assets
mkdir -p frontend/scripts
mkdir -p frontend/styles
mkdir -p frontend/config
mkdir -p frontend/features

# Check if main files exist
echo "🔍 Checking required files..."
required_files=(
    "frontend/index.html"
    "frontend/manifest.json"
    "frontend/sw.js"
    "frontend/robots.txt"
    "frontend/404.html"
    "frontend/500.html"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "⚠️  Warning: $file not found"
        case "$file" in
            "frontend/404.html")
                echo "Creating basic 404.html..."
                cat > "$file" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found | Zeeky AI</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
        a { color: #007bff; text-decoration: none; }
    </style>
</head>
<body>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">← Back to Home</a>
</body>
</html>
EOF
                ;;
            "frontend/500.html")
                echo "Creating basic 500.html..."
                cat > "$file" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 - Server Error | Zeeky AI</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
        a { color: #007bff; text-decoration: none; }
    </style>
</head>
<body>
    <h1>500 - Server Error</h1>
    <p>Something went wrong on our end.</p>
    <a href="/">← Back to Home</a>
</body>
</html>
EOF
                ;;
            "frontend/robots.txt")
                echo "Creating robots.txt..."
                cat > "$file" << 'EOF'
User-agent: *
Allow: /

Sitemap: https://your-domain.vercel.app/sitemap.xml
EOF
                ;;
        esac
    else
        echo "✅ $file exists"
    fi
done

# Test build process
echo "🔨 Testing build process..."
npm run vercel-build
if [ $? -eq 0 ]; then
    echo "✅ Build process successful"
else
    echo "⚠️  Build process had issues, but continuing..."
fi

# Validate vercel.json
echo "🔍 Validating vercel.json..."
if command -v jq &> /dev/null; then
    if jq empty vercel.json 2>/dev/null; then
        echo "✅ vercel.json is valid JSON"
    else
        echo "❌ vercel.json has JSON syntax errors"
        exit 1
    fi
else
    echo "⚠️  jq not found, skipping JSON validation"
fi

# Create deployment summary
echo "📋 Deployment Summary:"
echo "   - Project: Zeeky AI"
echo "   - Configuration: Static site with frontend routing"
echo "   - Main entry: frontend/index.html"
echo "   - Assets: frontend/assets/"
echo "   - Scripts: frontend/scripts/"
echo "   - Styles: frontend/styles/"

echo ""
echo "🎉 Deployment fix complete!"
echo ""
echo "Next steps:"
echo "1. Commit your changes: git add . && git commit -m 'Fix Vercel deployment configuration'"
echo "2. Push to GitHub: git push"
echo "3. Vercel should automatically redeploy"
echo "4. If manual deployment needed: vercel --prod"
echo ""
echo "If you still get 404 errors, check:"
echo "- Vercel dashboard for build logs"
echo "- Ensure all files are committed to git"
echo "- Verify domain settings in Vercel"
