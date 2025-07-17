// Smart Home Control System
class SmartHomeManager {
    constructor() {
        this.devices = [];
        this.rooms = {};
        this.currentCategory = 'all';
        this.isVoiceActive = false;
        this.recognition = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadDevices();
            this.setupEventListeners();
            this.renderDevices();
            this.initializeVoiceRecognition();
            this.startStatusUpdates();
        } catch (error) {
            console.error('Smart Home initialization error:', error);
            this.showNotification('Failed to initialize smart home system', 'error');
        }
    }

    async loadDevices() {
        try {
            // Load devices from backend API
            const response = await fetch('/api/smart-home/devices');
            const data = await response.json();
            
            this.devices = [
                // Living Room
                {
                    id: 'living_light_main',
                    name: 'Main Living Light',
                    type: 'light',
                    room: 'living-room',
                    status: 'on',
                    properties: { brightness: 75, color: '#FFFFFF', temperature: 3000 },
                    icon: 'fas fa-lightbulb'
                },
                {
                    id: 'living_tv',
                    name: 'Smart TV',
                    type: 'entertainment',
                    room: 'living-room',
                    status: 'off',
                    properties: { volume: 25, channel: 'Netflix', input: 'HDMI1' },
                    icon: 'fas fa-tv'
                },
                {
                    id: 'living_speaker',
                    name: 'Living Room Speaker',
                    type: 'entertainment',
                    room: 'living-room',
                    status: 'ready',
                    properties: { volume: 50, playing: false, source: 'Spotify' },
                    icon: 'fas fa-volume-up'
                },

                // Bedroom
                {
                    id: 'bedroom_light',
                    name: 'Bedroom Light',
                    type: 'light',
                    room: 'bedroom',
                    status: 'off',
                    properties: { brightness: 100, color: '#FFFFFF', temperature: 2700 },
                    icon: 'fas fa-lightbulb'
                },
                {
                    id: 'bedroom_fan',
                    name: 'Ceiling Fan',
                    type: 'climate',
                    room: 'bedroom',
                    status: 'off',
                    properties: { speed: 0, direction: 'forward' },
                    icon: 'fas fa-fan'
                },

                // Kitchen
                {
                    id: 'kitchen_light',
                    name: 'Kitchen Light',
                    type: 'light',
                    room: 'kitchen',
                    status: 'on',
                    properties: { brightness: 90, color: '#FFFFFF', temperature: 4000 },
                    icon: 'fas fa-lightbulb'
                },
                {
                    id: 'kitchen_coffee',
                    name: 'Smart Coffee Maker',
                    type: 'appliances',
                    room: 'kitchen',
                    status: 'ready',
                    properties: { temperature: 195, strength: 'medium', timer: null },
                    icon: 'fas fa-coffee'
                },
                {
                    id: 'kitchen_fridge',
                    name: 'Smart Refrigerator',
                    type: 'appliances',
                    room: 'kitchen',
                    status: 'on',
                    properties: { temperature: 38, door_open: false, filter_status: 'good' },
                    icon: 'fas fa-snowflake'
                },

                // Climate Control
                {
                    id: 'thermostat_main',
                    name: 'Main Thermostat',
                    type: 'climate',
                    room: 'hallway',
                    status: 'auto',
                    properties: { temperature: 72, target_temperature: 72, mode: 'auto', humidity: 45 },
                    icon: 'fas fa-thermometer-half'
                },

                // Security
                {
                    id: 'front_door_lock',
                    name: 'Front Door Lock',
                    type: 'security',
                    room: 'entrance',
                    status: 'locked',
                    properties: { battery: 85, auto_lock: true },
                    icon: 'fas fa-lock'
                },
                {
                    id: 'security_camera_front',
                    name: 'Front Door Camera',
                    type: 'security',
                    room: 'entrance',
                    status: 'active',
                    properties: { recording: true, motion_detection: true, night_vision: true },
                    icon: 'fas fa-video'
                },
                {
                    id: 'garage_door',
                    name: 'Garage Door',
                    type: 'security',
                    room: 'garage',
                    status: 'closed',
                    properties: { battery: 92, auto_close: true },
                    icon: 'fas fa-warehouse'
                },

                // Outdoor
                {
                    id: 'outdoor_lights',
                    name: 'Outdoor Lights',
                    type: 'light',
                    room: 'outdoor',
                    status: 'off',
                    properties: { brightness: 100, color: '#FFFFFF', motion_sensor: true },
                    icon: 'fas fa-lightbulb'
                },
                {
                    id: 'sprinkler_system',
                    name: 'Sprinkler System',
                    type: 'appliances',
                    room: 'outdoor',
                    status: 'off',
                    properties: { schedule: '6:00 AM', duration: 30, zones: 4 },
                    icon: 'fas fa-tint'
                }
            ];

            this.updateRoomCounts();
            this.updateHomeStatus();
            
        } catch (error) {
            console.error('Error loading devices:', error);
            this.showNotification('Failed to load smart home devices', 'error');
        }
    }

    setupEventListeners() {
        // Back button
        document.getElementById('back-btn')?.addEventListener('click', () => {
            window.history.back();
        });

        // Voice control
        document.getElementById('voice-control-btn')?.addEventListener('click', () => {
            this.toggleVoiceControl();
        });

        // Settings
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.openSettings();
        });

        // Room cards
        document.querySelectorAll('.room-card').forEach(card => {
            card.addEventListener('click', () => {
                const room = card.dataset.room;
                this.filterByRoom(room);
            });
        });

        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.category;
                this.switchCategory(category);
            });
        });

        // AI command input
        const aiInput = document.getElementById('ai-command-input');
        const sendBtn = document.getElementById('send-command-btn');
        const voiceBtn = document.getElementById('voice-input-btn');

        sendBtn?.addEventListener('click', () => {
            this.processAICommand(aiInput.value);
            aiInput.value = '';
        });

        aiInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processAICommand(aiInput.value);
                aiInput.value = '';
            }
        });

        voiceBtn?.addEventListener('click', () => {
            this.startVoiceInput();
        });

        // Suggestion chips
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const command = chip.dataset.command;
                this.processAICommand(command);
            });
        });

        // Emergency button
        document.getElementById('emergency-btn')?.addEventListener('click', () => {
            this.openEmergencyModal();
        });

        // Modal close buttons
        document.getElementById('device-modal-close')?.addEventListener('click', () => {
            this.closeModal('device-modal');
        });

        document.getElementById('emergency-modal-close')?.addEventListener('click', () => {
            this.closeModal('emergency-modal');
        });

        // Emergency actions
        document.querySelectorAll('.emergency-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.executeEmergencyAction(action);
            });
        });
    }

    renderDevices() {
        const devicesGrid = document.getElementById('devices-grid');
        if (!devicesGrid) return;

        const filteredDevices = this.getFilteredDevices();
        
        devicesGrid.innerHTML = filteredDevices.map(device => `
            <div class="device-card" data-device-id="${device.id}">
                <div class="device-header">
                    <div class="device-info">
                        <div class="device-icon">
                            <i class="${device.icon}"></i>
                        </div>
                        <div class="device-details">
                            <h4>${device.name}</h4>
                            <p>${this.getRoomDisplayName(device.room)} • ${device.type}</p>
                        </div>
                    </div>
                    <div class="device-toggle ${device.status === 'on' || device.status === 'active' || device.status === 'locked' ? 'active' : ''}" 
                         onclick="smartHomeManager.toggleDevice('${device.id}')">
                    </div>
                </div>
                <div class="device-controls">
                    ${this.renderDeviceControls(device)}
                </div>
            </div>
        `).join('');

        // Add click listeners for device cards
        document.querySelectorAll('.device-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.device-toggle') && !e.target.closest('.device-controls')) {
                    const deviceId = card.dataset.deviceId;
                    this.openDeviceModal(deviceId);
                }
            });
        });
    }

    renderDeviceControls(device) {
        let controls = '';
        
        switch (device.type) {
            case 'light':
                controls = `
                    <div class="control-slider">
                        <label>Brightness</label>
                        <input type="range" class="slider" min="0" max="100" 
                               value="${device.properties.brightness}" 
                               onchange="smartHomeManager.updateDeviceProperty('${device.id}', 'brightness', this.value)">
                        <span class="control-value">${device.properties.brightness}%</span>
                    </div>
                `;
                break;
            case 'climate':
                if (device.id === 'thermostat_main') {
                    controls = `
                        <div class="control-slider">
                            <label>Temperature</label>
                            <input type="range" class="slider" min="60" max="85" 
                                   value="${device.properties.target_temperature}" 
                                   onchange="smartHomeManager.updateDeviceProperty('${device.id}', 'target_temperature', this.value)">
                            <span class="control-value">${device.properties.target_temperature}°F</span>
                        </div>
                    `;
                } else if (device.id === 'bedroom_fan') {
                    controls = `
                        <div class="control-slider">
                            <label>Speed</label>
                            <input type="range" class="slider" min="0" max="5" 
                                   value="${device.properties.speed}" 
                                   onchange="smartHomeManager.updateDeviceProperty('${device.id}', 'speed', this.value)">
                            <span class="control-value">${device.properties.speed}</span>
                        </div>
                    `;
                }
                break;
            case 'entertainment':
                if (device.properties.volume !== undefined) {
                    controls = `
                        <div class="control-slider">
                            <label>Volume</label>
                            <input type="range" class="slider" min="0" max="100" 
                                   value="${device.properties.volume}" 
                                   onchange="smartHomeManager.updateDeviceProperty('${device.id}', 'volume', this.value)">
                            <span class="control-value">${device.properties.volume}%</span>
                        </div>
                    `;
                }
                break;
        }
        
        return controls;
    }

    getFilteredDevices() {
        return this.devices.filter(device => {
            if (this.currentCategory === 'all') return true;
            return device.type === this.currentCategory;
        });
    }

    switchCategory(category) {
        this.currentCategory = category;
        
        // Update active tab
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
        
        this.renderDevices();
    }

    async toggleDevice(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        if (!device) return;

        try {
            // Toggle device status
            const newStatus = this.getToggledStatus(device);
            
            // Send command to backend
            const response = await fetch('/api/smart-home/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    device_id: deviceId,
                    action: 'toggle',
                    value: newStatus
                })
            });

            if (response.ok) {
                device.status = newStatus;
                this.renderDevices();
                this.updateHomeStatus();
                this.showNotification(`${device.name} ${newStatus}`, 'success');
            }
        } catch (error) {
            console.error('Error toggling device:', error);
            this.showNotification('Failed to control device', 'error');
        }
    }

    getToggledStatus(device) {
        switch (device.status) {
            case 'on': return 'off';
            case 'off': return 'on';
            case 'active': return 'inactive';
            case 'inactive': return 'active';
            case 'locked': return 'unlocked';
            case 'unlocked': return 'locked';
            case 'open': return 'closed';
            case 'closed': return 'open';
            default: return 'on';
        }
    }

    async updateDeviceProperty(deviceId, property, value) {
        const device = this.devices.find(d => d.id === deviceId);
        if (!device) return;

        try {
            const response = await fetch('/api/smart-home/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    device_id: deviceId,
                    action: 'set_property',
                    property: property,
                    value: value
                })
            });

            if (response.ok) {
                device.properties[property] = parseInt(value);
                this.showNotification(`${device.name} ${property} set to ${value}`, 'success');
            }
        } catch (error) {
            console.error('Error updating device property:', error);
            this.showNotification('Failed to update device', 'error');
        }
    }

    async processAICommand(command) {
        if (!command.trim()) return;

        this.showNotification('Processing command...', 'info');

        try {
            // Send command to AI backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Smart home command: ${command}`,
                    personality: 'smart_home_assistant',
                    context: 'smart_home'
                })
            });

            const data = await response.json();
            
            // Execute the command based on AI interpretation
            await this.executeSmartHomeCommand(command);
            
            this.showNotification('Command executed successfully', 'success');
        } catch (error) {
            console.error('Error processing AI command:', error);
            this.showNotification('Failed to process command', 'error');
        }
    }

    async executeSmartHomeCommand(command) {
        const lowerCommand = command.toLowerCase();
        
        // Simple command parsing (can be enhanced with NLP)
        if (lowerCommand.includes('turn off all lights')) {
            await this.turnOffAllLights();
        } else if (lowerCommand.includes('turn on all lights')) {
            await this.turnOnAllLights();
        } else if (lowerCommand.includes('lock all doors')) {
            await this.lockAllDoors();
        } else if (lowerCommand.includes('set temperature')) {
            const temp = lowerCommand.match(/\d+/);
            if (temp) {
                await this.setTemperature(parseInt(temp[0]));
            }
        } else if (lowerCommand.includes('goodnight')) {
            await this.executeGoodnightRoutine();
        }
    }

    async turnOffAllLights() {
        const lights = this.devices.filter(d => d.type === 'light');
        for (const light of lights) {
            if (light.status === 'on') {
                await this.toggleDevice(light.id);
            }
        }
    }

    async turnOnAllLights() {
        const lights = this.devices.filter(d => d.type === 'light');
        for (const light of lights) {
            if (light.status === 'off') {
                await this.toggleDevice(light.id);
            }
        }
    }

    async lockAllDoors() {
        const locks = this.devices.filter(d => d.type === 'security' && d.name.includes('Lock'));
        for (const lock of locks) {
            if (lock.status === 'unlocked') {
                await this.toggleDevice(lock.id);
            }
        }
    }

    async setTemperature(temp) {
        const thermostat = this.devices.find(d => d.id === 'thermostat_main');
        if (thermostat) {
            await this.updateDeviceProperty(thermostat.id, 'target_temperature', temp);
        }
    }

    async executeGoodnightRoutine() {
        await this.turnOffAllLights();
        await this.lockAllDoors();
        await this.setTemperature(68);
        this.showNotification('Goodnight routine executed', 'success');
    }

    updateRoomCounts() {
        document.querySelectorAll('.room-card').forEach(card => {
            const room = card.dataset.room;
            const deviceCount = this.devices.filter(d => d.room === room).length;
            const statusElement = card.querySelector('.room-status');
            if (statusElement) {
                statusElement.textContent = `${deviceCount} device${deviceCount !== 1 ? 's' : ''}`;
            }
        });
    }

    updateHomeStatus() {
        const lightsOn = this.devices.filter(d => d.type === 'light' && d.status === 'on').length;
        const currentTemp = this.devices.find(d => d.id === 'thermostat_main')?.properties.temperature || 72;
        const securityArmed = this.devices.some(d => d.type === 'security' && d.status === 'active');

        document.getElementById('lights-on').textContent = `${lightsOn} on`;
        document.getElementById('current-temp').textContent = `${currentTemp}°F`;
        document.getElementById('security-status').textContent = securityArmed ? 'Armed' : 'Disarmed';
    }

    getRoomDisplayName(room) {
        const roomNames = {
            'living-room': 'Living Room',
            'bedroom': 'Bedroom',
            'kitchen': 'Kitchen',
            'bathroom': 'Bathroom',
            'garage': 'Garage',
            'outdoor': 'Outdoor',
            'hallway': 'Hallway',
            'entrance': 'Entrance'
        };
        return roomNames[room] || room;
    }

    openDeviceModal(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        if (!device) return;

        const modal = document.getElementById('device-modal');
        const title = document.getElementById('device-modal-title');
        const body = document.getElementById('device-modal-body');

        title.textContent = device.name;
        body.innerHTML = `
            <div class="device-control-section">
                <h4>Device Information</h4>
                <p><strong>Type:</strong> ${device.type}</p>
                <p><strong>Room:</strong> ${this.getRoomDisplayName(device.room)}</p>
                <p><strong>Status:</strong> ${device.status}</p>
            </div>
            <div class="device-control-section">
                <h4>Controls</h4>
                ${this.renderDeviceControls(device)}
            </div>
        `;

        modal.classList.add('active');
    }

    openEmergencyModal() {
        const modal = document.getElementById('emergency-modal');
        modal.classList.add('active');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
    }

    async executeEmergencyAction(action) {
        switch (action) {
            case 'panic':
                await this.turnOnAllLights();
                await this.lockAllDoors();
                this.showNotification('Panic mode activated', 'warning');
                break;
            case 'lockdown':
                await this.lockAllDoors();
                await this.turnOffAllLights();
                this.showNotification('Lockdown mode activated', 'warning');
                break;
            case 'all-lights-on':
                await this.turnOnAllLights();
                this.showNotification('All lights turned on', 'success');
                break;
            case 'call-emergency':
                this.showNotification('Emergency services contacted', 'warning');
                break;
        }
        this.closeModal('emergency-modal');
    }

    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const command = event.results[0][0].transcript;
                this.processAICommand(command);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification('Voice recognition failed', 'error');
            };
        }
    }

    startVoiceInput() {
        if (this.recognition) {
            this.recognition.start();
            this.showNotification('Listening...', 'info');
        } else {
            this.showNotification('Voice recognition not supported', 'error');
        }
    }

    toggleVoiceControl() {
        this.isVoiceActive = !this.isVoiceActive;
        const btn = document.getElementById('voice-control-btn');
        
        if (this.isVoiceActive) {
            btn.style.color = '#4CAF50';
            this.showNotification('Voice control activated', 'success');
        } else {
            btn.style.color = '';
            this.showNotification('Voice control deactivated', 'info');
        }
    }

    openSettings() {
        this.showNotification('Settings panel coming soon', 'info');
    }

    startStatusUpdates() {
        // Update device status every 30 seconds
        setInterval(() => {
            this.updateHomeStatus();
        }, 30000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            zIndex: '10000',
            fontSize: '14px',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        });

        // Set background color based on type
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800',
            info: '#2196F3'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize Smart Home Manager
const smartHomeManager = new SmartHomeManager();
