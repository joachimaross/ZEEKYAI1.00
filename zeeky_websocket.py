"""
Zeeky AI WebSocket Manager
Real-time communication for collaboration and live features
"""

import json
import asyncio
import uuid
from typing import Dict, Set, List, Optional
from datetime import datetime
import logging
from fastapi import WebSocket, WebSocketDisconnect
from collections import defaultdict

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manage WebSocket connections for real-time features"""
    
    def __init__(self):
        # Active connections
        self.active_connections: Dict[str, WebSocket] = {}
        
        # Room-based connections for collaboration
        self.rooms: Dict[str, Set[str]] = defaultdict(set)
        
        # User information
        self.user_info: Dict[str, Dict] = {}
        
        # Typing indicators
        self.typing_users: Dict[str, Set[str]] = defaultdict(set)
        
        # Message history for rooms
        self.room_messages: Dict[str, List[Dict]] = defaultdict(list)
        
        # Connection metadata
        self.connection_metadata: Dict[str, Dict] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str, room_id: str = "general") -> str:
        """Connect a user to WebSocket"""
        
        await websocket.accept()
        
        # Generate connection ID
        connection_id = str(uuid.uuid4())
        
        # Store connection
        self.active_connections[connection_id] = websocket
        self.rooms[room_id].add(connection_id)
        
        # Store user info
        self.user_info[connection_id] = {
            "user_id": user_id,
            "room_id": room_id,
            "connected_at": datetime.now().isoformat(),
            "last_activity": datetime.now().isoformat()
        }
        
        # Store metadata
        self.connection_metadata[connection_id] = {
            "user_agent": websocket.headers.get("user-agent", ""),
            "ip_address": websocket.client.host if websocket.client else "unknown"
        }
        
        # Notify room about new user
        await self.broadcast_to_room(room_id, {
            "type": "user_joined",
            "user_id": user_id,
            "connection_id": connection_id,
            "timestamp": datetime.now().isoformat(),
            "room_users": await self.get_room_users(room_id)
        }, exclude_connection=connection_id)
        
        # Send welcome message to user
        await self.send_personal_message(connection_id, {
            "type": "welcome",
            "connection_id": connection_id,
            "room_id": room_id,
            "message": f"Connected to room: {room_id}",
            "room_users": await self.get_room_users(room_id),
            "recent_messages": self.room_messages[room_id][-10:]  # Last 10 messages
        })
        
        logger.info(f"User {user_id} connected to room {room_id} with connection {connection_id}")
        return connection_id
    
    async def disconnect(self, connection_id: str):
        """Disconnect a user"""
        
        if connection_id not in self.active_connections:
            return
        
        user_info = self.user_info.get(connection_id, {})
        user_id = user_info.get("user_id", "unknown")
        room_id = user_info.get("room_id", "general")
        
        # Remove from active connections
        del self.active_connections[connection_id]
        
        # Remove from room
        self.rooms[room_id].discard(connection_id)
        
        # Remove from typing indicators
        self.typing_users[room_id].discard(connection_id)
        
        # Clean up user info
        if connection_id in self.user_info:
            del self.user_info[connection_id]
        
        if connection_id in self.connection_metadata:
            del self.connection_metadata[connection_id]
        
        # Notify room about user leaving
        await self.broadcast_to_room(room_id, {
            "type": "user_left",
            "user_id": user_id,
            "connection_id": connection_id,
            "timestamp": datetime.now().isoformat(),
            "room_users": await self.get_room_users(room_id)
        })
        
        # Clean up empty rooms
        if not self.rooms[room_id]:
            del self.rooms[room_id]
            if room_id in self.room_messages:
                del self.room_messages[room_id]
            if room_id in self.typing_users:
                del self.typing_users[room_id]
        
        logger.info(f"User {user_id} disconnected from room {room_id}")
    
    async def send_personal_message(self, connection_id: str, message: Dict):
        """Send message to specific connection"""
        
        if connection_id in self.active_connections:
            try:
                websocket = self.active_connections[connection_id]
                await websocket.send_text(json.dumps(message))
                
                # Update last activity
                if connection_id in self.user_info:
                    self.user_info[connection_id]["last_activity"] = datetime.now().isoformat()
                    
            except Exception as e:
                logger.error(f"Error sending message to {connection_id}: {e}")
                await self.disconnect(connection_id)
    
    async def broadcast_to_room(self, room_id: str, message: Dict, exclude_connection: str = None):
        """Broadcast message to all users in a room"""
        
        if room_id not in self.rooms:
            return
        
        # Add timestamp if not present
        if "timestamp" not in message:
            message["timestamp"] = datetime.now().isoformat()
        
        # Store message in room history
        if message.get("type") == "chat_message":
            self.room_messages[room_id].append(message)
            
            # Keep only last 100 messages
            if len(self.room_messages[room_id]) > 100:
                self.room_messages[room_id] = self.room_messages[room_id][-100:]
        
        # Send to all connections in room
        disconnected_connections = []
        
        for connection_id in self.rooms[room_id]:
            if connection_id != exclude_connection:
                try:
                    websocket = self.active_connections[connection_id]
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error broadcasting to {connection_id}: {e}")
                    disconnected_connections.append(connection_id)
        
        # Clean up disconnected connections
        for connection_id in disconnected_connections:
            await self.disconnect(connection_id)
    
    async def handle_message(self, connection_id: str, message: Dict):
        """Handle incoming WebSocket message"""
        
        if connection_id not in self.user_info:
            return
        
        user_info = self.user_info[connection_id]
        user_id = user_info["user_id"]
        room_id = user_info["room_id"]
        message_type = message.get("type")
        
        # Update last activity
        user_info["last_activity"] = datetime.now().isoformat()
        
        if message_type == "chat_message":
            await self.handle_chat_message(connection_id, message)
        
        elif message_type == "typing_start":
            await self.handle_typing_start(connection_id)
        
        elif message_type == "typing_stop":
            await self.handle_typing_stop(connection_id)
        
        elif message_type == "join_room":
            await self.handle_room_change(connection_id, message.get("room_id"))
        
        elif message_type == "ai_request":
            await self.handle_ai_request(connection_id, message)
        
        elif message_type == "collaboration_action":
            await self.handle_collaboration_action(connection_id, message)
        
        else:
            logger.warning(f"Unknown message type: {message_type}")
    
    async def handle_chat_message(self, connection_id: str, message: Dict):
        """Handle chat message"""
        
        user_info = self.user_info[connection_id]
        user_id = user_info["user_id"]
        room_id = user_info["room_id"]
        
        # Create chat message
        chat_message = {
            "type": "chat_message",
            "user_id": user_id,
            "connection_id": connection_id,
            "content": message.get("content", ""),
            "timestamp": datetime.now().isoformat(),
            "message_id": str(uuid.uuid4())
        }
        
        # Broadcast to room
        await self.broadcast_to_room(room_id, chat_message)
    
    async def handle_typing_start(self, connection_id: str):
        """Handle typing start indicator"""
        
        user_info = self.user_info[connection_id]
        room_id = user_info["room_id"]
        
        self.typing_users[room_id].add(connection_id)
        
        await self.broadcast_to_room(room_id, {
            "type": "typing_update",
            "typing_users": [
                self.user_info[conn_id]["user_id"] 
                for conn_id in self.typing_users[room_id]
                if conn_id in self.user_info
            ]
        }, exclude_connection=connection_id)
    
    async def handle_typing_stop(self, connection_id: str):
        """Handle typing stop indicator"""
        
        user_info = self.user_info[connection_id]
        room_id = user_info["room_id"]
        
        self.typing_users[room_id].discard(connection_id)
        
        await self.broadcast_to_room(room_id, {
            "type": "typing_update",
            "typing_users": [
                self.user_info[conn_id]["user_id"] 
                for conn_id in self.typing_users[room_id]
                if conn_id in self.user_info
            ]
        }, exclude_connection=connection_id)
    
    async def handle_room_change(self, connection_id: str, new_room_id: str):
        """Handle user changing rooms"""
        
        if not new_room_id:
            return
        
        user_info = self.user_info[connection_id]
        old_room_id = user_info["room_id"]
        user_id = user_info["user_id"]
        
        # Remove from old room
        self.rooms[old_room_id].discard(connection_id)
        self.typing_users[old_room_id].discard(connection_id)
        
        # Add to new room
        self.rooms[new_room_id].add(connection_id)
        user_info["room_id"] = new_room_id
        
        # Notify old room
        await self.broadcast_to_room(old_room_id, {
            "type": "user_left",
            "user_id": user_id,
            "connection_id": connection_id,
            "room_users": await self.get_room_users(old_room_id)
        })
        
        # Notify new room
        await self.broadcast_to_room(new_room_id, {
            "type": "user_joined",
            "user_id": user_id,
            "connection_id": connection_id,
            "room_users": await self.get_room_users(new_room_id)
        }, exclude_connection=connection_id)
        
        # Send room info to user
        await self.send_personal_message(connection_id, {
            "type": "room_changed",
            "room_id": new_room_id,
            "room_users": await self.get_room_users(new_room_id),
            "recent_messages": self.room_messages[new_room_id][-10:]
        })
    
    async def handle_ai_request(self, connection_id: str, message: Dict):
        """Handle AI request through WebSocket"""
        
        user_info = self.user_info[connection_id]
        room_id = user_info["room_id"]
        
        # Process AI request (integrate with enhanced AI system)
        try:
            from zeeky_enhanced_ai import enhanced_zeeky
            
            ai_response = await enhanced_zeeky.chat(
                message=message.get("content", ""),
                user_id=user_info["user_id"],
                chat_id=room_id,
                personality=message.get("personality", "default")
            )
            
            # Broadcast AI response to room
            await self.broadcast_to_room(room_id, {
                "type": "ai_response",
                "request_id": message.get("request_id"),
                "content": ai_response["response"],
                "personality": message.get("personality", "default"),
                "user_id": "Zeeky AI",
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"AI request error: {e}")
            await self.send_personal_message(connection_id, {
                "type": "ai_error",
                "request_id": message.get("request_id"),
                "error": str(e)
            })
    
    async def handle_collaboration_action(self, connection_id: str, message: Dict):
        """Handle collaboration actions (cursor movement, selections, etc.)"""
        
        user_info = self.user_info[connection_id]
        room_id = user_info["room_id"]
        
        # Broadcast collaboration action to room
        await self.broadcast_to_room(room_id, {
            "type": "collaboration_action",
            "user_id": user_info["user_id"],
            "action": message.get("action"),
            "data": message.get("data"),
            "timestamp": datetime.now().isoformat()
        }, exclude_connection=connection_id)
    
    async def get_room_users(self, room_id: str) -> List[Dict]:
        """Get list of users in a room"""
        
        users = []
        if room_id in self.rooms:
            for connection_id in self.rooms[room_id]:
                if connection_id in self.user_info:
                    user_info = self.user_info[connection_id]
                    users.append({
                        "user_id": user_info["user_id"],
                        "connection_id": connection_id,
                        "connected_at": user_info["connected_at"],
                        "last_activity": user_info["last_activity"]
                    })
        
        return users
    
    def get_stats(self) -> Dict:
        """Get WebSocket statistics"""
        
        return {
            "active_connections": len(self.active_connections),
            "active_rooms": len(self.rooms),
            "total_users": len(set(info["user_id"] for info in self.user_info.values())),
            "rooms": {
                room_id: len(connections) 
                for room_id, connections in self.rooms.items()
            }
        }

# Global connection manager
connection_manager = ConnectionManager()

# WebSocket endpoint handler
async def websocket_endpoint(websocket: WebSocket, user_id: str, room_id: str = "general"):
    """WebSocket endpoint for real-time communication"""
    
    connection_id = await connection_manager.connect(websocket, user_id, room_id)
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle message
            await connection_manager.handle_message(connection_id, message)
            
    except WebSocketDisconnect:
        await connection_manager.disconnect(connection_id)
    except Exception as e:
        logger.error(f"WebSocket error for {connection_id}: {e}")
        await connection_manager.disconnect(connection_id)
