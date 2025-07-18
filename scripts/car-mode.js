// Car Mode System
class CarModeManager {
    constructor() {
        this.isVoiceActive = false;
        this.recognition = null;
        this.currentRoute = null;
        this.vehicleData = {
            fuel: 75,
            battery: 92,
            engineTemp: 'Normal',
            speed: 0,
            temperature: 72,
            volume: 50,
            isPlaying: false,
            currentTrack: null,
            source: 'spotify'
        };
        
        this.init();
    }

    async init() {
        try {
            this.updateDateTime();
            this.setupEventListeners();
            this.initializeVoiceRecognition();
            this.loadVehicleData();
            this.startStatusUpdates();
            this.updateWeather();
        } catch (error) {
            console.error('Car Mode initialization error:', error);
            this.showNotification('Failed to initialize car mode', 'error');
        }
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('voice-nav-btn')?.addEventListener('click', () => {
            this.startVoiceNavigation();
        });

        document.getElementById('search-destination')?.addEventListener('click', () => {
            this.searchDestination();
        });

        document.getElementById('destination-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchDestination();
            }
        });

        // Quick destinations
        document.querySelectorAll('.quick-dest-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const destination = btn.dataset.destination;
                this.navigateToDestination(destination);
            });
        });

        document.getElementById('cancel-route')?.addEventListener('click', () => {
            this.cancelRoute();
        });

        // Entertainment controls
        document.getElementById('play-pause')?.addEventListener('click', () => {
            this.togglePlayback();
        });

        document.getElementById('prev-track')?.addEventListener('click', () => {
            this.previousTrack();
        });

        document.getElementById('next-track')?.addEventListener('click', () => {
            this.nextTrack();
        });

        document.getElementById('volume-slider')?.addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });

        // Source selection
        document.querySelectorAll('.source-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchSource(btn.dataset.source);
            });
        });

        // Climate controls
        document.getElementById('temp-up')?.addEventListener('click', () => {
            this.adjustTemperature(1);
        });

        document.getElementById('temp-down')?.addEventListener('click', () => {
            this.adjustTemperature(-1);
        });

        document.querySelectorAll('.climate-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleClimateControl(btn.id);
            });
        });

        // AI Assistant
        document.getElementById('voice-activation')?.addEventListener('click', () => {
            this.toggleVoiceActivation();
        });

        document.getElementById('ai-send')?.addEventListener('click', () => {
            this.sendAICommand();
        });

        document.getElementById('ai-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendAICommand();
            }
        });

        // AI suggestions
        document.querySelectorAll('.ai-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                this.processAICommand(btn.dataset.command);
            });
        });

        // Emergency
        document.getElementById('emergency-btn')?.addEventListener('click', () => {
            this.openEmergencyModal();
        });

        // Modal controls
        document.getElementById('emergency-close')?.addEventListener('click', () => {
            this.closeModal('emergency-modal');
        });

        document.getElementById('navigation-close')?.addEventListener('click', () => {
            this.closeModal('navigation-modal');
        });

        // Emergency options
        document.querySelectorAll('.emergency-option').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleEmergencyAction(btn.dataset.action);
            });
        });

        // Settings
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.openSettings();
        });
    }

    updateDateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        const dateString = now.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });

        document.getElementById('current-time').textContent = timeString;
        document.getElementById('current-date').textContent = dateString;
    }

    async updateWeather() {
        try {
            // Mock weather data - integrate with weather API
            const weatherData = {
                temperature: 72,
                condition: 'sunny',
                icon: 'fas fa-sun'
            };

            document.getElementById('weather-temp').textContent = `${weatherData.temperature}°F`;
            
            const weatherIcon = document.querySelector('.weather-display i');
            weatherIcon.className = weatherData.icon;
        } catch (error) {
            console.error('Weather update error:', error);
        }
    }

    async searchDestination() {
        const input = document.getElementById('destination-input');
        const destination = input.value.trim();
        
        if (!destination) return;

        this.showNotification('Searching for destination...', 'info');
        
        try {
            // Mock navigation API call
            await this.simulateNavigation(destination);
            input.value = '';
        } catch (error) {
            console.error('Navigation error:', error);
            this.showNotification('Navigation failed', 'error');
        }
    }

    async navigateToDestination(destination) {
        this.showNotification(`Navigating to ${destination}...`, 'info');
        
        try {
            await this.simulateNavigation(destination);
        } catch (error) {
            console.error('Navigation error:', error);
            this.showNotification('Navigation failed', 'error');
        }
    }

    async simulateNavigation(destination) {
        // Simulate route calculation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.currentRoute = {
            destination: destination,
            time: Math.floor(Math.random() * 30) + 5, // 5-35 minutes
            distance: (Math.random() * 20 + 1).toFixed(1) // 1-21 miles
        };

        this.displayRoute();
        this.showNotification(`Route to ${destination} found`, 'success');
    }

    displayRoute() {
        if (!this.currentRoute) return;

        const routeElement = document.getElementById('current-route');
        const destinationText = document.getElementById('route-destination-text');
        const routeDetails = document.querySelector('.route-details');

        destinationText.textContent = this.currentRoute.destination;
        routeDetails.innerHTML = `
            <span class="route-time">${this.currentRoute.time} min</span>
            <span class="route-distance">${this.currentRoute.distance} miles</span>
        `;

        routeElement.style.display = 'flex';
    }

    cancelRoute() {
        this.currentRoute = null;
        document.getElementById('current-route').style.display = 'none';
        this.showNotification('Route cancelled', 'info');
    }

    togglePlayback() {
        this.vehicleData.isPlaying = !this.vehicleData.isPlaying;
        const playPauseBtn = document.getElementById('play-pause');
        const icon = playPauseBtn.querySelector('i');
        
        if (this.vehicleData.isPlaying) {
            icon.className = 'fas fa-pause';
            this.startPlayingTrack();
        } else {
            icon.className = 'fas fa-play';
            this.pauseTrack();
        }
    }

    startPlayingTrack() {
        // Mock track data
        const tracks = [
            { title: 'Highway Dreams', artist: 'Road Trip Band' },
            { title: 'City Lights', artist: 'Urban Sounds' },
            { title: 'Mountain Drive', artist: 'Nature Vibes' },
            { title: 'Sunset Boulevard', artist: 'Evening Mood' }
        ];

        if (!this.vehicleData.currentTrack) {
            this.vehicleData.currentTrack = tracks[Math.floor(Math.random() * tracks.length)];
        }

        document.getElementById('track-title').textContent = this.vehicleData.currentTrack.title;
        document.getElementById('track-artist').textContent = this.vehicleData.currentTrack.artist;
    }

    pauseTrack() {
        // Keep current track info but show paused state
    }

    previousTrack() {
        this.vehicleData.currentTrack = null;
        if (this.vehicleData.isPlaying) {
            this.startPlayingTrack();
        }
        this.showNotification('Previous track', 'info');
    }

    nextTrack() {
        this.vehicleData.currentTrack = null;
        if (this.vehicleData.isPlaying) {
            this.startPlayingTrack();
        }
        this.showNotification('Next track', 'info');
    }

    setVolume(volume) {
        this.vehicleData.volume = parseInt(volume);
        this.showNotification(`Volume: ${volume}%`, 'info');
    }

    switchSource(source) {
        this.vehicleData.source = source;
        
        // Update active source button
        document.querySelectorAll('.source-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-source="${source}"]`).classList.add('active');

        // Reset track info for new source
        this.vehicleData.currentTrack = null;
        this.vehicleData.isPlaying = false;
        
        document.getElementById('track-title').textContent = 'No music playing';
        document.getElementById('track-artist').textContent = `${source.charAt(0).toUpperCase() + source.slice(1)} selected`;
        
        const playPauseBtn = document.getElementById('play-pause');
        playPauseBtn.querySelector('i').className = 'fas fa-play';

        this.showNotification(`Switched to ${source}`, 'success');
    }

    adjustTemperature(change) {
        this.vehicleData.temperature += change;
        this.vehicleData.temperature = Math.max(60, Math.min(85, this.vehicleData.temperature));
        
        document.getElementById('climate-temp').textContent = this.vehicleData.temperature;
        this.showNotification(`Temperature: ${this.vehicleData.temperature}°F`, 'info');
    }

    toggleClimateControl(controlId) {
        // Remove active class from all climate buttons
        document.querySelectorAll('.climate-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to clicked button
        document.getElementById(controlId).classList.add('active');

        const controlNames = {
            'ac-btn': 'A/C',
            'heat-btn': 'Heat',
            'defrost-btn': 'Defrost',
            'auto-btn': 'Auto'
        };

        this.showNotification(`${controlNames[controlId]} activated`, 'success');
    }

    toggleVoiceActivation() {
        this.isVoiceActive = !this.isVoiceActive;
        const voiceBtn = document.getElementById('voice-activation');
        const voiceIndicator = document.getElementById('voice-indicator');

        if (this.isVoiceActive) {
            voiceBtn.classList.add('active');
            voiceIndicator.classList.add('active');
            this.startVoiceListening();
        } else {
            voiceBtn.classList.remove('active');
            voiceIndicator.classList.remove('active');
            this.stopVoiceListening();
        }
    }

    startVoiceListening() {
        if (this.recognition) {
            this.recognition.start();
            document.getElementById('ai-status').textContent = 'Listening for commands...';
        }
    }

    stopVoiceListening() {
        if (this.recognition) {
            this.recognition.stop();
            document.getElementById('ai-status').textContent = 'Ready to help with your drive';
        }
    }

    startVoiceNavigation() {
        this.showNotification('Voice navigation activated', 'info');
        this.toggleVoiceActivation();
    }

    sendAICommand() {
        const input = document.getElementById('ai-input');
        const command = input.value.trim();
        
        if (!command) return;

        this.processAICommand(command);
        input.value = '';
    }

    async processAICommand(command) {
        this.showNotification('Processing command...', 'info');
        document.getElementById('ai-status').textContent = 'Processing your request...';

        try {
            // Simulate AI processing
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simple command processing
            const lowerCommand = command.toLowerCase();
            
            if (lowerCommand.includes('navigate') || lowerCommand.includes('go to')) {
                const destination = this.extractDestination(command);
                if (destination) {
                    await this.navigateToDestination(destination);
                }
            } else if (lowerCommand.includes('play music') || lowerCommand.includes('play')) {
                if (!this.vehicleData.isPlaying) {
                    this.togglePlayback();
                }
            } else if (lowerCommand.includes('call')) {
                const contact = this.extractContact(command);
                this.makeCall(contact || 'home');
            } else if (lowerCommand.includes('weather')) {
                this.announceWeather();
            } else if (lowerCommand.includes('temperature')) {
                const temp = this.extractTemperature(command);
                if (temp) {
                    this.vehicleData.temperature = temp;
                    document.getElementById('climate-temp').textContent = temp;
                }
            } else {
                this.showNotification('Command not recognized', 'warning');
            }

            document.getElementById('ai-status').textContent = 'Ready to help with your drive';
        } catch (error) {
            console.error('AI command error:', error);
            this.showNotification('Failed to process command', 'error');
            document.getElementById('ai-status').textContent = 'Ready to help with your drive';
        }
    }

    extractDestination(command) {
        const patterns = [
            /navigate to (.+)/i,
            /go to (.+)/i,
            /drive to (.+)/i
        ];
        
        for (const pattern of patterns) {
            const match = command.match(pattern);
            if (match) return match[1].trim();
        }
        return null;
    }

    extractContact(command) {
        const match = command.match(/call (.+)/i);
        return match ? match[1].trim() : null;
    }

    extractTemperature(command) {
        const match = command.match(/(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    makeCall(contact) {
        this.showNotification(`Calling ${contact}...`, 'info');
        // Simulate call functionality
    }

    announceWeather() {
        this.showNotification('Current weather: 72°F, sunny conditions', 'info');
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
                this.toggleVoiceActivation(); // Turn off after command
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification('Voice recognition failed', 'error');
                this.toggleVoiceActivation();
            };

            this.recognition.onend = () => {
                if (this.isVoiceActive) {
                    this.toggleVoiceActivation();
                }
            };
        }
    }

    loadVehicleData() {
        // Update UI with vehicle data
        document.getElementById('fuel-level').textContent = `${this.vehicleData.fuel}%`;
        document.getElementById('battery-level').textContent = `${this.vehicleData.battery}%`;
        document.getElementById('engine-temp').textContent = this.vehicleData.engineTemp;
        document.getElementById('current-speed').textContent = `${this.vehicleData.speed} mph`;
        document.getElementById('climate-temp').textContent = this.vehicleData.temperature;
        document.getElementById('volume-slider').value = this.vehicleData.volume;
    }

    startStatusUpdates() {
        // Update time every minute
        setInterval(() => {
            this.updateDateTime();
        }, 60000);

        // Update weather every 30 minutes
        setInterval(() => {
            this.updateWeather();
        }, 1800000);

        // Simulate vehicle data updates
        setInterval(() => {
            this.updateVehicleStatus();
        }, 5000);
    }

    updateVehicleStatus() {
        // Simulate minor changes in vehicle status
        if (Math.random() < 0.1) { // 10% chance
            this.vehicleData.fuel = Math.max(0, this.vehicleData.fuel - 1);
            document.getElementById('fuel-level').textContent = `${this.vehicleData.fuel}%`;
        }
    }

    openEmergencyModal() {
        const modal = document.getElementById('emergency-modal');
        modal.classList.add('active');
    }

    handleEmergencyAction(action) {
        switch (action) {
            case 'call-911':
                this.showNotification('Calling 911...', 'warning');
                break;
            case 'roadside-assistance':
                this.showNotification('Contacting roadside assistance...', 'info');
                break;
            case 'share-location':
                this.showNotification('Location shared with emergency contacts', 'success');
                break;
            case 'emergency-contact':
                this.showNotification('Calling emergency contact...', 'info');
                break;
        }
        this.closeModal('emergency-modal');
    }

    openSettings() {
        this.showNotification('Settings panel coming soon', 'info');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `car-notification car-notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            zIndex: '10000',
            fontSize: '14px',
            maxWidth: '300px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)'
        });

        // Set background color based on type
        const colors = {
            success: 'rgba(76, 175, 80, 0.9)',
            error: 'rgba(244, 67, 54, 0.9)',
            warning: 'rgba(255, 152, 0, 0.9)',
            info: 'rgba(0, 212, 255, 0.9)'
        };
        notification.style.background = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize Car Mode Manager
const carModeManager = new CarModeManager();
