"""
Database initialization and management for Zeeky AI
"""

import asyncio
import logging
import sqlite3
import os
from typing import Optional

logger = logging.getLogger("zeeky_database")

# Global database connection
_db_connection: Optional[sqlite3.Connection] = None

async def init_database():
    """Initialize the database connection"""
    global _db_connection
    
    try:
        # Create database directory if it doesn't exist
        os.makedirs("data", exist_ok=True)
        
        # Connect to SQLite database
        _db_connection = sqlite3.connect("data/zeeky_ai.db", check_same_thread=False)
        _db_connection.row_factory = sqlite3.Row  # Enable dict-like access
        
        # Create tables
        await create_tables()
        
        logger.info("✅ Database initialized successfully")
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")
        raise

async def create_tables():
    """Create necessary database tables"""
    global _db_connection
    
    if not _db_connection:
        raise RuntimeError("Database not initialized")
    
    cursor = _db_connection.cursor()
    
    # Conversations table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            message TEXT,
            response TEXT,
            personality TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            hashed_password TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE
        )
    """)
    
    # System logs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level TEXT,
            message TEXT,
            module TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Settings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    _db_connection.commit()
    logger.info("✅ Database tables created successfully")

async def close_database():
    """Close the database connection"""
    global _db_connection
    
    if _db_connection:
        _db_connection.close()
        _db_connection = None
        logger.info("✅ Database connection closed")

def get_db_connection():
    """Get the current database connection"""
    global _db_connection
    return _db_connection

async def execute_query(query: str, params: tuple = ()):
    """Execute a database query"""
    global _db_connection
    
    if not _db_connection:
        raise RuntimeError("Database not initialized")
    
    cursor = _db_connection.cursor()
    cursor.execute(query, params)
    _db_connection.commit()
    return cursor

async def fetch_one(query: str, params: tuple = ()):
    """Fetch one row from database"""
    cursor = await execute_query(query, params)
    return cursor.fetchone()

async def fetch_all(query: str, params: tuple = ()):
    """Fetch all rows from database"""
    cursor = await execute_query(query, params)
    return cursor.fetchall()
