#!/usr/bin/env python3
"""
Script to update the API URL in the frontend JavaScript file
Usage: python update-api-url.py <your-backend-url>
Example: python update-api-url.py https://your-app.railway.app
"""

import sys
import re

def update_api_url(new_url):
    """Update the API URL in the frontend JavaScript file"""
    
    # Remove trailing slash if present
    new_url = new_url.rstrip('/')
    
    # Read the current file
    try:
        with open('frontend/scripts/main.js', 'r') as file:
            content = file.read()
    except FileNotFoundError:
        print("❌ Error: frontend/scripts/main.js not found!")
        return False
    
    # Pattern to match the apiBaseUrl line
    pattern = r"this\.apiBaseUrl = '[^']*';"
    replacement = f"this.apiBaseUrl = '{new_url}';"
    
    # Replace the URL
    new_content = re.sub(pattern, replacement, content)
    
    # Check if replacement was made
    if new_content == content:
        print("❌ Error: Could not find apiBaseUrl to replace!")
        return False
    
    # Write the updated content back
    try:
        with open('frontend/scripts/main.js', 'w') as file:
            file.write(new_content)
        print(f"✅ Successfully updated API URL to: {new_url}")
        return True
    except Exception as e:
        print(f"❌ Error writing file: {e}")
        return False

def main():
    if len(sys.argv) != 2:
        print("Usage: python update-api-url.py <your-backend-url>")
        print("Example: python update-api-url.py https://your-app.railway.app")
        sys.exit(1)
    
    backend_url = sys.argv[1]
    
    # Validate URL format
    if not backend_url.startswith(('http://', 'https://')):
        print("❌ Error: URL must start with http:// or https://")
        sys.exit(1)
    
    print(f"🔄 Updating API URL to: {backend_url}")
    
    if update_api_url(backend_url):
        print("\n📝 Next steps:")
        print("1. Test the updated frontend locally")
        print("2. Commit and push changes:")
        print("   git add frontend/scripts/main.js")
        print("   git commit -m 'Update API URL to production backend'")
        print("   git push origin main")
        print("3. Netlify will automatically redeploy")
        print("4. Test the live site with real backend integration")
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
