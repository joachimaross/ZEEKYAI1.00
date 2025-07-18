/**
 * Zeeky AI WebSocket Client
 * Real-time communication for collaboration and live features
 */

class ZeekyWebSocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.userId = 'user_' + Math.random().toString(36).substr(2, 9);
        this.roomId = 'general';
        this.connectionId = null;
        
        // Event handlers
        this.onMessage = null;
        this.onConnect = null;
        this.onDisconnect = null;
        this.onError = null;
        
        // Message queue for offline messages
        this.messageQueue = [];
        
        // Typing indicator
        this.typingTimeout = null;
        this.isTyping = false;
    }
    
    connect(userId = null, roomId = 'general') {
        if (userId) this.userId = userId;
        if (roomId) this.roomId = roomId;
        
        try {
            // Determine WebSocket URL
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host;
            const wsUrl = `${protocol}//${host}/ws/${this.userId}/${this.roomId}`;
            
            console.log('🔌 Connecting to WebSocket:', wsUrl);
            
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = (event) => {
                console.log('✅ WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                
                // Send queued messages
                this.sendQueuedMessages();
                
                if (this.onConnect) {
                    this.onConnect(event);
                }
                
                this.showConnectionStatus('Connected', 'success');
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.socket.onclose = (event) => {
                console.log('🔌 WebSocket disconnected');
                this.isConnected = false;
                this.connectionId = null;
                
                if (this.onDisconnect) {
                    this.onDisconnect(event);
                }
                
                this.showConnectionStatus('Disconnected', 'error');
                
                // Attempt to reconnect
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                }
            };
            
            this.socket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                
                if (this.onError) {
                    this.onError(error);
                }
                
                this.showConnectionStatus('Connection Error', 'error');
            };
            
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.showConnectionStatus('Connection Failed', 'error');
        }
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isConnected = false;
        this.connectionId = null;
    }
    
    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
        
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.showConnectionStatus(`Reconnecting in ${delay/1000}s...`, 'warning');
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }
    
    sendMessage(type, data = {}) {
        const message = {
            type: type,
            timestamp: new Date().toISOString(),
            ...data
        };
        
        if (this.isConnected && this.socket) {
            try {
                this.socket.send(JSON.stringify(message));
                return true;
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
                this.queueMessage(message);
                return false;
            }
        } else {
            this.queueMessage(message);
            return false;
        }
    }
    
    queueMessage(message) {
        this.messageQueue.push(message);
        
        // Limit queue size
        if (this.messageQueue.length > 50) {
            this.messageQueue.shift();
        }
    }
    
    sendQueuedMessages() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.socket.send(JSON.stringify(message));
        }
    }
    
    handleMessage(message) {
        console.log('📨 Received WebSocket message:', message);
        
        switch (message.type) {
            case 'welcome':
                this.connectionId = message.connection_id;
                this.handleWelcome(message);
                break;
                
            case 'chat_message':
                this.handleChatMessage(message);
                break;
                
            case 'ai_response':
                this.handleAIResponse(message);
                break;
                
            case 'user_joined':
                this.handleUserJoined(message);
                break;
                
            case 'user_left':
                this.handleUserLeft(message);
                break;
                
            case 'typing_update':
                this.handleTypingUpdate(message);
                break;
                
            case 'collaboration_action':
                this.handleCollaborationAction(message);
                break;
                
            case 'room_changed':
                this.handleRoomChanged(message);
                break;
                
            default:
                console.log('Unknown message type:', message.type);
        }
        
        // Call custom message handler
        if (this.onMessage) {
            this.onMessage(message);
        }
    }
    
    handleWelcome(message) {
        console.log('👋 Welcome to room:', message.room_id);
        this.updateRoomInfo(message.room_users);
        this.displayRecentMessages(message.recent_messages);
    }
    
    handleChatMessage(message) {
        this.displayChatMessage(message);
    }
    
    handleAIResponse(message) {
        this.displayAIResponse(message);
    }
    
    handleUserJoined(message) {
        this.showNotification(`${message.user_id} joined the room`, 'info');
        this.updateRoomInfo(message.room_users);
    }
    
    handleUserLeft(message) {
        this.showNotification(`${message.user_id} left the room`, 'info');
        this.updateRoomInfo(message.room_users);
    }
    
    handleTypingUpdate(message) {
        this.updateTypingIndicator(message.typing_users);
    }
    
    handleCollaborationAction(message) {
        // Handle real-time collaboration actions
        console.log('Collaboration action:', message);
    }
    
    handleRoomChanged(message) {
        this.roomId = message.room_id;
        this.updateRoomInfo(message.room_users);
        this.displayRecentMessages(message.recent_messages);
    }
    
    // Chat methods
    sendChatMessage(content) {
        return this.sendMessage('chat_message', { content });
    }
    
    sendAIRequest(content, personality = 'default') {
        const requestId = 'req_' + Math.random().toString(36).substr(2, 9);
        return this.sendMessage('ai_request', { 
            content, 
            personality, 
            request_id: requestId 
        });
    }
    
    joinRoom(roomId) {
        return this.sendMessage('join_room', { room_id: roomId });
    }
    
    startTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.sendMessage('typing_start');
        }
        
        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        // Stop typing after 3 seconds of inactivity
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 3000);
    }
    
    stopTyping() {
        if (this.isTyping) {
            this.isTyping = false;
            this.sendMessage('typing_stop');
        }
        
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
    }
    
    // UI update methods
    displayChatMessage(message) {
        if (window.modernUI && window.modernUI.addMessageToDOM) {
            window.modernUI.addMessageToDOM('user', message.content);
        }
    }
    
    displayAIResponse(message) {
        if (window.modernUI && window.modernUI.addMessageToDOM) {
            window.modernUI.addMessageToDOM('bot', message.content);
        }
    }
    
    displayRecentMessages(messages) {
        if (messages && messages.length > 0) {
            messages.forEach(message => {
                if (message.type === 'chat_message') {
                    this.displayChatMessage(message);
                } else if (message.type === 'ai_response') {
                    this.displayAIResponse(message);
                }
            });
        }
    }
    
    updateRoomInfo(users) {
        // Update room user list in UI
        console.log('Room users:', users);
    }
    
    updateTypingIndicator(typingUsers) {
        // Update typing indicator in UI
        if (typingUsers && typingUsers.length > 0) {
            console.log('Users typing:', typingUsers);
        }
    }
    
    showConnectionStatus(status, type) {
        // Show connection status in UI
        console.log(`Connection status: ${status} (${type})`);
        
        // You can integrate this with your UI notification system
        if (window.modernUI && window.modernUI.showToast) {
            if (type === 'success') {
                window.modernUI.showToast(`🔌 ${status}`);
            } else if (type === 'error') {
                window.modernUI.showToast(`❌ ${status}`);
            } else if (type === 'warning') {
                window.modernUI.showToast(`⚠️ ${status}`);
            }
        }
    }
    
    showNotification(message, type) {
        console.log(`Notification: ${message} (${type})`);
        
        if (window.modernUI && window.modernUI.showToast) {
            window.modernUI.showToast(message);
        }
    }
    
    // Utility methods
    getConnectionInfo() {
        return {
            isConnected: this.isConnected,
            userId: this.userId,
            roomId: this.roomId,
            connectionId: this.connectionId,
            reconnectAttempts: this.reconnectAttempts
        };
    }
    
    setEventHandlers(handlers) {
        this.onMessage = handlers.onMessage || null;
        this.onConnect = handlers.onConnect || null;
        this.onDisconnect = handlers.onDisconnect || null;
        this.onError = handlers.onError || null;
    }
}

// Global WebSocket client instance
window.zeekyWS = new ZeekyWebSocketClient();

// Auto-connect when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Connect with a small delay to ensure other scripts are loaded
    setTimeout(() => {
        window.zeekyWS.connect();
    }, 1000);
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.zeekyWS) {
        window.zeekyWS.disconnect();
    }
});
