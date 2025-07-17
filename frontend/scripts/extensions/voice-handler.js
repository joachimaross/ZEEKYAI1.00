// Voice Handler Extension for Zeeky AI
class VoiceHandler {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSupported = this.checkSupport();
        this.voices = [];
        this.settings = {
            voice: null,
            rate: 1.0,
            pitch: 1.0,
            autoSpeak: true
        };
        
        this.init();
    }

    checkSupport() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    init() {
        if (!this.isSupported) {
            console.warn('Speech recognition not supported in this browser');
            return;
        }

        this.setupRecognition();
        this.loadVoices();
        this.loadSettings();
        this.setupEventListeners();
    }

    setupRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceButton(true);
            this.showVoiceIndicator();
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                this.handleVoiceInput(finalTranscript);
            }

            this.updateTranscript(interimTranscript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopListening();
            this.showNotification('Voice recognition error: ' + event.error, 'error');
        };

        this.recognition.onend = () => {
            this.stopListening();
        };
    }

    loadVoices() {
        const updateVoices = () => {
            this.voices = this.synthesis.getVoices();
            this.populateVoiceSelect();
        };

        updateVoices();
        this.synthesis.onvoiceschanged = updateVoices;
    }

    populateVoiceSelect() {
        const voiceSelect = document.getElementById('voice-select');
        if (!voiceSelect) return;

        voiceSelect.innerHTML = '';
        
        this.voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.default) {
                option.selected = true;
                this.settings.voice = voice;
            }
            voiceSelect.appendChild(option);
        });
    }

    loadSettings() {
        const saved = localStorage.getItem('zeeky_voice_settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.settings = { ...this.settings, ...settings };
                this.applySettings();
            } catch (e) {
                console.error('Failed to load voice settings:', e);
            }
        }
    }

    saveSettings() {
        localStorage.setItem('zeeky_voice_settings', JSON.stringify(this.settings));
    }

    applySettings() {
        const voiceSelect = document.getElementById('voice-select');
        const speedSlider = document.getElementById('voice-speed');
        const pitchSlider = document.getElementById('voice-pitch');
        const autoSpeakCheck = document.getElementById('auto-speak');
        const speedValue = document.getElementById('speed-value');
        const pitchValue = document.getElementById('pitch-value');

        if (voiceSelect && this.settings.voiceIndex !== undefined) {
            voiceSelect.value = this.settings.voiceIndex;
        }
        if (speedSlider) {
            speedSlider.value = this.settings.rate;
            if (speedValue) speedValue.textContent = this.settings.rate + 'x';
        }
        if (pitchSlider) {
            pitchSlider.value = this.settings.pitch;
            if (pitchValue) pitchValue.textContent = this.settings.pitch;
        }
        if (autoSpeakCheck) {
            autoSpeakCheck.checked = this.settings.autoSpeak;
        }
    }

    setupEventListeners() {
        // Voice input button
        const voiceInputBtn = document.getElementById('voice-input-btn');
        voiceInputBtn?.addEventListener('click', () => this.toggleListening());

        // Voice output button
        const voiceOutputBtn = document.getElementById('voice-output-btn');
        voiceOutputBtn?.addEventListener('click', () => this.toggleAutoSpeak());

        // Voice settings
        const voiceSelect = document.getElementById('voice-select');
        voiceSelect?.addEventListener('change', (e) => {
            this.settings.voiceIndex = parseInt(e.target.value);
            this.settings.voice = this.voices[this.settings.voiceIndex];
            this.saveSettings();
        });

        const speedSlider = document.getElementById('voice-speed');
        speedSlider?.addEventListener('input', (e) => {
            this.settings.rate = parseFloat(e.target.value);
            document.getElementById('speed-value').textContent = this.settings.rate + 'x';
            this.saveSettings();
        });

        const pitchSlider = document.getElementById('voice-pitch');
        pitchSlider?.addEventListener('input', (e) => {
            this.settings.pitch = parseFloat(e.target.value);
            document.getElementById('pitch-value').textContent = this.settings.pitch;
            this.saveSettings();
        });

        const autoSpeakCheck = document.getElementById('auto-speak');
        autoSpeakCheck?.addEventListener('change', (e) => {
            this.settings.autoSpeak = e.target.checked;
            this.saveSettings();
        });

        const testVoiceBtn = document.getElementById('test-voice');
        testVoiceBtn?.addEventListener('click', () => {
            this.speak('Hello! This is how I sound with the current voice settings.');
        });
    }

    toggleListening() {
        if (!this.isSupported) {
            this.showNotification('Voice recognition not supported in this browser', 'error');
            return;
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (!this.recognition || this.isListening) return;

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start voice recognition:', error);
            this.showNotification('Failed to start voice recognition', 'error');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.updateVoiceButton(false);
        this.hideVoiceIndicator();
    }

    handleVoiceInput(transcript) {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = transcript;
            chatInput.dispatchEvent(new Event('input'));
            
            // Auto-send if transcript ends with command words
            const autoSendWords = ['send', 'submit', 'go', 'enter'];
            const lastWord = transcript.trim().toLowerCase().split(' ').pop();
            
            if (autoSendWords.includes(lastWord)) {
                // Remove the command word and send
                chatInput.value = transcript.replace(new RegExp(lastWord + '$', 'i'), '').trim();
                document.getElementById('send-button')?.click();
            }
        }
    }

    speak(text) {
        if (!text || !this.synthesis) return;

        // Stop any current speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        if (this.settings.voice) {
            utterance.voice = this.settings.voice;
        }
        
        utterance.rate = this.settings.rate;
        utterance.pitch = this.settings.pitch;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            this.updateVoiceOutputButton(true);
        };

        utterance.onend = () => {
            this.updateVoiceOutputButton(false);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.updateVoiceOutputButton(false);
        };

        this.synthesis.speak(utterance);
    }

    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.updateVoiceOutputButton(false);
        }
    }

    toggleAutoSpeak() {
        this.settings.autoSpeak = !this.settings.autoSpeak;
        this.saveSettings();
        this.updateVoiceOutputButton();
        
        const message = this.settings.autoSpeak ? 'Auto-speak enabled' : 'Auto-speak disabled';
        this.showNotification(message, 'info');
    }

    updateVoiceButton(isListening) {
        const btn = document.getElementById('voice-input-btn');
        if (!btn) return;

        if (isListening) {
            btn.classList.add('active');
            btn.title = 'Stop listening';
            btn.innerHTML = '<i class="fas fa-stop"></i>';
        } else {
            btn.classList.remove('active');
            btn.title = 'Voice input';
            btn.innerHTML = '<i class="fas fa-microphone"></i>';
        }
    }

    updateVoiceOutputButton(isSpeaking) {
        const btn = document.getElementById('voice-output-btn');
        if (!btn) return;

        if (isSpeaking) {
            btn.classList.add('active');
            btn.title = 'Stop speaking';
            btn.innerHTML = '<i class="fas fa-stop"></i>';
        } else {
            btn.classList.toggle('active', this.settings.autoSpeak);
            btn.title = this.settings.autoSpeak ? 'Auto-speak enabled' : 'Auto-speak disabled';
            btn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }

    showVoiceIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'voice-indicator';
        indicator.className = 'voice-recording';
        indicator.innerHTML = `
            <i class="fas fa-microphone"></i>
            <span>Listening...</span>
            <div class="loading"></div>
        `;
        
        const container = document.getElementById('chat-messages');
        if (container) {
            container.appendChild(indicator);
            container.scrollTop = container.scrollHeight;
        }
    }

    hideVoiceIndicator() {
        const indicator = document.getElementById('voice-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    updateTranscript(transcript) {
        const chatInput = document.getElementById('chat-input');
        if (chatInput && transcript) {
            chatInput.value = transcript;
        }
    }

    showNotification(message, type) {
        if (window.ZeekyUtils) {
            window.ZeekyUtils.showNotification(message, type);
        }
    }

    // Public API for other components
    speakResponse(text) {
        if (this.settings.autoSpeak && text) {
            this.speak(text);
        }
    }

    isCurrentlySpeaking() {
        return this.synthesis && this.synthesis.speaking;
    }

    isCurrentlyListening() {
        return this.isListening;
    }
}

// Initialize voice handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.voiceHandler = new VoiceHandler();
});
