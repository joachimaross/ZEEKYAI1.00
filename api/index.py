"""
Vercel deployment entry point for ZEEKY AI
This file serves as the main entry point for Vercel's Python runtime
"""

import sys
import os

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the FastAPI app
from app import app

# Export the app for Vercel
handler = app
