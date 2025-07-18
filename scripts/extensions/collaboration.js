// Real-time Collaboration Extension for Zeeky AI
class CollaborationManager {
    constructor() {
        this.rooms = new Map();
        this.currentRoom = null;
        this.participants = new Map();
        this.isHost = false;
        this.userId = this.generateUserId();
        this.userName = localStorage.getItem('zeeky_username') || 'Anonymous User';
        
        // WebRTC for real-time communication
        this.peerConnections = new Map();
        this.dataChannels = new Map();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadRooms();
        this.setupWebRTC();
    }

    setupEventListeners() {
        // Collaboration navigation
        const collaborationNav = document.getElementById('collaboration-nav');
        collaborationNav?.addEventListener('click', () => this.openCollaborationModal());

        // Collaboration action card
        const collaborationActionCard = document.querySelector('[data-action="collaboration"]');
        collaborationActionCard?.addEventListener('click', () => this.openCollaborationModal());

        // Collaboration modal
        const collaborationBtn = document.getElementById('collaboration-btn');
        collaborationBtn?.addEventListener('click', () => this.openCollaborationModal());

        // Room creation
        const createRoomBtn = document.getElementById('create-room');
        createRoomBtn?.addEventListener('click', () => this.createRoom());

        // Share link
        const copyShareBtn = document.getElementById('copy-share-link');
        copyShareBtn?.addEventListener('click', () => this.copyShareLink());

        // Microsoft Office integration
        const officeIntegrationBtn = document.getElementById('office-integration');
        officeIntegrationBtn?.addEventListener('click', () => this.initializeOfficeIntegration());

        // Team workspace
        const teamWorkspaceBtn = document.getElementById('team-workspace');
        teamWorkspaceBtn?.addEventListener('click', () => this.openTeamWorkspace());

        // Collaboration tabs
        document.querySelectorAll('.collab-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchCollabTab(tab.dataset.tab));
        });

        // Modal close
        const collaborationClose = document.getElementById('collaboration-close');
        collaborationClose?.addEventListener('click', () => this.closeCollaborationModal());
    }

    setupWebRTC() {
        // Initialize WebRTC configuration
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    openCollaborationModal() {
        const modal = document.getElementById('collaboration-modal');
        if (modal) {
            modal.classList.add('active');
            this.updateRoomsList();
            this.updateParticipantsList();

            // Track modal open
            if (window.analyticsManager) {
                window.analyticsManager.trackUserAction('collaboration_modal_opened');
            }
        }
    }

    closeCollaborationModal() {
        const modal = document.getElementById('collaboration-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Microsoft Office Integration
    async initializeOfficeIntegration() {
        try {
            this.showNotification('Initializing Microsoft Office integration...', 'info');

            // Check if Office.js is available
            if (typeof Office !== 'undefined') {
                await this.setupOfficeAddIn();
            } else {
                // Fallback: Open Office Online integration
                await this.openOfficeOnlineIntegration();
            }

            this.showNotification('Office integration ready!', 'success');
        } catch (error) {
            console.error('Office integration error:', error);
            this.showNotification('Office integration failed. Using web-based collaboration.', 'warning');
            this.openTeamWorkspace();
        }
    }

    async setupOfficeAddIn() {
        // Office Add-in integration for Word, Excel, PowerPoint
        if (typeof Office !== 'undefined') {
            Office.onReady((info) => {
                if (info.host === Office.HostType.Word) {
                    this.setupWordIntegration();
                } else if (info.host === Office.HostType.Excel) {
                    this.setupExcelIntegration();
                } else if (info.host === Office.HostType.PowerPoint) {
                    this.setupPowerPointIntegration();
                }
            });
        }
    }

    async openOfficeOnlineIntegration() {
        // Open Office Online with collaboration features
        const officeUrl = 'https://office.com';
        const collaborationParams = {
            source: 'zeeky-ai',
            collaboration: 'enabled',
            ai_assistant: 'true'
        };

        const params = new URLSearchParams(collaborationParams);
        const fullUrl = `${officeUrl}?${params.toString()}`;

        window.open(fullUrl, '_blank', 'width=1200,height=800');
    }

    // Team Workspace
    openTeamWorkspace() {
        // Create or open team workspace interface
        this.createTeamWorkspaceInterface();
        this.switchCollabTab('workspace');
    }

    createTeamWorkspaceInterface() {
        const workspacePanel = document.getElementById('workspace-panel');
        if (!workspacePanel) return;

        workspacePanel.innerHTML = `
            <div class="team-workspace">
                <div class="workspace-header">
                    <h3><i class="fas fa-users"></i> Team Workspace</h3>
                    <div class="workspace-tools">
                        <button class="tool-btn" id="add-document">
                            <i class="fas fa-file-plus"></i> New Document
                        </button>
                        <button class="tool-btn" id="add-spreadsheet">
                            <i class="fas fa-table"></i> New Spreadsheet
                        </button>
                        <button class="tool-btn" id="add-presentation">
                            <i class="fas fa-presentation"></i> New Presentation
                        </button>
                        <button class="tool-btn" id="office-integration">
                            <i class="fab fa-microsoft"></i> Office Integration
                        </button>
                    </div>
                </div>

                <div class="workspace-content">
                    <div class="workspace-sidebar">
                        <div class="team-members">
                            <h4>Team Members</h4>
                            <div class="members-list" id="team-members-list">
                                <!-- Team members will be populated here -->
                            </div>
                        </div>

                        <div class="shared-documents">
                            <h4>Shared Documents</h4>
                            <div class="documents-list" id="shared-documents-list">
                                <!-- Shared documents will be populated here -->
                            </div>
                        </div>
                    </div>

                    <div class="workspace-main">
                        <div class="ai-collaboration-panel">
                            <h4><i class="fas fa-robot"></i> AI Team Assistant</h4>
                            <div class="ai-suggestions" id="ai-suggestions">
                                <div class="suggestion-card">
                                    <i class="fas fa-lightbulb"></i>
                                    <p>Ask Zeeky AI to help with document review, content generation, or team coordination.</p>
                                </div>
                            </div>
                            <div class="ai-chat-input">
                                <input type="text" placeholder="Ask AI to help your team..." id="team-ai-input">
                                <button class="send-btn" id="team-ai-send">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>

                        <div class="collaboration-features">
                            <h4>Collaboration Features</h4>
                            <div class="feature-grid">
                                <div class="feature-card" data-feature="real-time-editing">
                                    <i class="fas fa-edit"></i>
                                    <h5>Real-time Editing</h5>
                                    <p>Collaborate on documents simultaneously</p>
                                </div>
                                <div class="feature-card" data-feature="version-control">
                                    <i class="fas fa-code-branch"></i>
                                    <h5>Version Control</h5>
                                    <p>Track changes and manage versions</p>
                                </div>
                                <div class="feature-card" data-feature="ai-assistance">
                                    <i class="fas fa-robot"></i>
                                    <h5>AI Assistance</h5>
                                    <p>Get AI help with content and tasks</p>
                                </div>
                                <div class="feature-card" data-feature="team-chat">
                                    <i class="fas fa-comments"></i>
                                    <h5>Team Chat</h5>
                                    <p>Communicate with team members</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupWorkspaceEventListeners();
        this.loadTeamMembers();
        this.loadSharedDocuments();
    }

    setupWorkspaceEventListeners() {
        // Office integration button
        const officeIntegrationBtn = document.getElementById('office-integration');
        officeIntegrationBtn?.addEventListener('click', () => this.initializeOfficeIntegration());

        // Team AI input
        const teamAiInput = document.getElementById('team-ai-input');
        const teamAiSend = document.getElementById('team-ai-send');

        teamAiSend?.addEventListener('click', () => this.handleTeamAiQuery());
        teamAiInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleTeamAiQuery();
            }
        });

        // Document creation buttons
        document.getElementById('add-document')?.addEventListener('click', () => this.createDocument('document'));
        document.getElementById('add-spreadsheet')?.addEventListener('click', () => this.createDocument('spreadsheet'));
        document.getElementById('add-presentation')?.addEventListener('click', () => this.createDocument('presentation'));
    }

    async handleTeamAiQuery() {
        const input = document.getElementById('team-ai-input');
        const query = input.value.trim();

        if (!query) return;

        // Add query to AI suggestions
        const suggestionsContainer = document.getElementById('ai-suggestions');
        const queryElement = document.createElement('div');
        queryElement.className = 'ai-query';
        queryElement.innerHTML = `
            <div class="query-text"><strong>Team:</strong> ${query}</div>
            <div class="ai-response">Processing team request...</div>
        `;
        suggestionsContainer.appendChild(queryElement);

        // Clear input
        input.value = '';

        // Simulate AI response (integrate with main AI system)
        setTimeout(() => {
            const responseElement = queryElement.querySelector('.ai-response');
            responseElement.innerHTML = `<strong>Zeeky AI:</strong> I'll help your team with "${query}". Let me coordinate the necessary resources and provide suggestions.`;
        }, 1000);
    }

    switchCollabTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.collab-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update panels
        document.querySelectorAll('.collab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });
    }

    async createRoom() {
        const roomNameInput = document.getElementById('room-name');
        const roomName = roomNameInput.value.trim();
        
        if (!roomName) {
            this.showNotification('Please enter a room name', 'error');
            return;
        }

        const roomId = this.generateRoomId();
        const room = {
            id: roomId,
            name: roomName,
            host: this.userId,
            participants: [this.userId],
            created: Date.now(),
            settings: {
                allowEditing: document.getElementById('allow-editing')?.checked || true,
                requireApproval: document.getElementById('require-approval')?.checked || false
            }
        };

        this.rooms.set(roomId, room);
        this.currentRoom = roomId;
        this.isHost = true;

        // Generate share URL
        const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        document.getElementById('share-url').value = shareUrl;

        this.updateRoomsList();
        this.showNotification(`Room "${roomName}" created successfully!`, 'success');
        
        // Switch to share tab
        this.switchCollabTab('share');

        // Track room creation
        if (window.analyticsManager) {
            window.analyticsManager.trackUserAction('room_created', roomId);
        }

        roomNameInput.value = '';
    }

    generateRoomId() {
        return 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async joinRoom(roomId) {
        try {
            // In a real implementation, this would connect to a signaling server
            // For demo purposes, we'll simulate joining
            
            const room = this.rooms.get(roomId);
            if (!room) {
                this.showNotification('Room not found', 'error');
                return;
            }

            if (room.settings.requireApproval && room.host !== this.userId) {
                this.showNotification('Waiting for host approval...', 'info');
                // In real implementation, send join request to host
                return;
            }

            room.participants.push(this.userId);
            this.currentRoom = roomId;
            this.isHost = false;

            this.showNotification(`Joined room "${room.name}"`, 'success');
            this.updateParticipantsList();

            // Track room join
            if (window.analyticsManager) {
                window.analyticsManager.trackUserAction('room_joined', roomId);
            }

        } catch (error) {
            console.error('Failed to join room:', error);
            this.showNotification('Failed to join room', 'error');
        }
    }

    leaveRoom() {
        if (!this.currentRoom) return;

        const room = this.rooms.get(this.currentRoom);
        if (room) {
            room.participants = room.participants.filter(id => id !== this.userId);
            
            if (room.participants.length === 0 || this.isHost) {
                this.rooms.delete(this.currentRoom);
            }
        }

        // Close all peer connections
        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();
        this.dataChannels.clear();

        this.currentRoom = null;
        this.isHost = false;

        this.updateRoomsList();
        this.updateParticipantsList();
        this.showNotification('Left the room', 'info');
    }

    copyShareLink() {
        const shareUrl = document.getElementById('share-url');
        if (shareUrl && shareUrl.value) {
            navigator.clipboard.writeText(shareUrl.value).then(() => {
                this.showNotification('Share link copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Failed to copy link', 'error');
            });
        }
    }

    updateRoomsList() {
        const roomsList = document.getElementById('rooms-list');
        if (!roomsList) return;

        roomsList.innerHTML = '';

        if (this.rooms.size === 0) {
            roomsList.innerHTML = '<p class="no-rooms">No active rooms</p>';
            return;
        }

        this.rooms.forEach((room, roomId) => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            
            const isCurrentRoom = roomId === this.currentRoom;
            if (isCurrentRoom) {
                roomCard.classList.add('current-room');
            }

            roomCard.innerHTML = `
                <div class="room-info">
                    <h4>${room.name}</h4>
                    <p>${room.participants.length} participant(s) • Created ${this.formatTime(room.created)}</p>
                </div>
                <div class="room-actions">
                    ${isCurrentRoom ? 
                        '<button class="btn-danger" onclick="collaborationManager.leaveRoom()">Leave</button>' :
                        `<button class="btn-primary" onclick="collaborationManager.joinRoom('${roomId}')">Join</button>`
                    }
                </div>
            `;

            roomsList.appendChild(roomCard);
        });
    }

    updateParticipantsList() {
        const participantCards = document.getElementById('participant-cards');
        if (!participantCards) return;

        participantCards.innerHTML = '';

        if (!this.currentRoom) {
            participantCards.innerHTML = '<p class="no-participants">Not in a room</p>';
            return;
        }

        const room = this.rooms.get(this.currentRoom);
        if (!room) return;

        room.participants.forEach(participantId => {
            const participantCard = document.createElement('div');
            participantCard.className = 'participant-card';
            
            const isHost = participantId === room.host;
            const isCurrentUser = participantId === this.userId;
            
            participantCard.innerHTML = `
                <div class="participant-avatar">
                    <i class="fas ${isHost ? 'fa-crown' : 'fa-user'}"></i>
                </div>
                <h4>${isCurrentUser ? 'You' : this.getParticipantName(participantId)}</h4>
                <p>${isHost ? 'Host' : 'Participant'}</p>
                <div class="participant-status">
                    <span class="status-indicator online"></span>
                    Online
                </div>
            `;

            participantCards.appendChild(participantCard);
        });
    }

    getParticipantName(participantId) {
        // In a real implementation, this would fetch user names from a server
        return `User ${participantId.slice(-4)}`;
    }

    // Real-time message synchronization
    broadcastMessage(message) {
        if (!this.currentRoom) return;

        const messageData = {
            type: 'chat_message',
            roomId: this.currentRoom,
            userId: this.userId,
            userName: this.userName,
            message: message,
            timestamp: Date.now()
        };

        // Broadcast to all connected peers
        this.dataChannels.forEach(channel => {
            if (channel.readyState === 'open') {
                channel.send(JSON.stringify(messageData));
            }
        });
    }

    // Real-time cursor/typing indicators
    broadcastTypingStatus(isTyping) {
        if (!this.currentRoom) return;

        const typingData = {
            type: 'typing_status',
            roomId: this.currentRoom,
            userId: this.userId,
            userName: this.userName,
            isTyping: isTyping,
            timestamp: Date.now()
        };

        this.dataChannels.forEach(channel => {
            if (channel.readyState === 'open') {
                channel.send(JSON.stringify(typingData));
            }
        });
    }

    // Handle incoming real-time data
    handleIncomingData(data) {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'chat_message':
                    this.handleIncomingMessage(message);
                    break;
                case 'typing_status':
                    this.handleTypingStatus(message);
                    break;
                case 'cursor_position':
                    this.handleCursorPosition(message);
                    break;
            }
        } catch (error) {
            console.error('Failed to handle incoming data:', error);
        }
    }

    handleIncomingMessage(messageData) {
        // Add collaborative message indicator
        if (window.zeekyAI && messageData.userId !== this.userId) {
            const collaborativeMessage = `👥 **${messageData.userName}**: ${messageData.message}`;
            window.zeekyAI.addBotMessage(collaborativeMessage);
        }
    }

    handleTypingStatus(statusData) {
        const typingStatus = document.getElementById('typing-status');
        if (typingStatus && statusData.userId !== this.userId) {
            if (statusData.isTyping) {
                typingStatus.textContent = `${statusData.userName} is typing...`;
                typingStatus.style.display = 'block';
            } else {
                typingStatus.style.display = 'none';
            }
        }
    }

    // Utility methods
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    loadRooms() {
        // In a real implementation, this would load from a server
        // For demo purposes, we'll use localStorage
        const saved = localStorage.getItem('zeeky_collaboration_rooms');
        if (saved) {
            try {
                const roomsData = JSON.parse(saved);
                this.rooms = new Map(roomsData);
            } catch (e) {
                console.error('Failed to load rooms:', e);
            }
        }
    }

    saveRooms() {
        localStorage.setItem('zeeky_collaboration_rooms', JSON.stringify([...this.rooms]));
    }

    showNotification(message, type) {
        if (window.ZeekyUtils) {
            window.ZeekyUtils.showNotification(message, type);
        }
    }

    // Public API
    getCurrentRoom() {
        return this.currentRoom ? this.rooms.get(this.currentRoom) : null;
    }

    isInRoom() {
        return this.currentRoom !== null;
    }

    getParticipantCount() {
        const room = this.getCurrentRoom();
        return room ? room.participants.length : 0;
    }
}

// Initialize collaboration manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.collaborationManager = new CollaborationManager();
});
