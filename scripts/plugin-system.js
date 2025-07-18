// Advanced Plugin System for Zeeky AI
// Extensible architecture for third-party integrations and custom tools

class PluginSystem {
    constructor() {
        this.plugins = new Map();
        this.hooks = new Map();
        this.middleware = [];
        this.registry = {
            official: new Map(),
            community: new Map(),
            custom: new Map()
        };
        this.sandboxes = new Map();
        this.init();
    }

    init() {
        this.setupCoreHooks();
        this.loadOfficialPlugins();
        this.createPluginUI();
        this.initializeSandbox();
        console.log('🔌 Plugin System initialized with extensible architecture');
    }

    // Core Plugin Management
    async installPlugin(pluginData, source = 'custom') {
        try {
            // Validate plugin
            const validation = await this.validatePlugin(pluginData);
            if (!validation.valid) {
                throw new Error(`Plugin validation failed: ${validation.errors.join(', ')}`);
            }

            // Create sandbox for plugin
            const sandbox = this.createPluginSandbox(pluginData.id);
            
            // Initialize plugin
            const plugin = await this.initializePlugin(pluginData, sandbox);
            
            // Register plugin
            this.plugins.set(pluginData.id, plugin);
            this.registry[source].set(pluginData.id, pluginData);
            
            // Execute plugin hooks
            await this.executeHook('plugin:installed', { plugin, pluginData });
            
            // Save to storage
            this.savePluginRegistry();
            
            console.log(`✅ Plugin installed: ${pluginData.name}`);
            return { success: true, plugin };

        } catch (error) {
            console.error('Plugin installation failed:', error);
            return { success: false, error: error.message };
        }
    }

    async uninstallPlugin(pluginId) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                throw new Error('Plugin not found');
            }

            // Execute cleanup hooks
            await this.executeHook('plugin:uninstalling', { plugin });
            
            // Cleanup plugin
            if (plugin.cleanup) {
                await plugin.cleanup();
            }
            
            // Remove from sandbox
            this.destroyPluginSandbox(pluginId);
            
            // Unregister plugin
            this.plugins.delete(pluginId);
            Object.values(this.registry).forEach(registry => registry.delete(pluginId));
            
            // Save changes
            this.savePluginRegistry();
            
            console.log(`🗑️ Plugin uninstalled: ${pluginId}`);
            return { success: true };

        } catch (error) {
            console.error('Plugin uninstallation failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Plugin Validation
    async validatePlugin(pluginData) {
        const errors = [];
        
        // Required fields
        if (!pluginData.id) errors.push('Missing plugin ID');
        if (!pluginData.name) errors.push('Missing plugin name');
        if (!pluginData.version) errors.push('Missing plugin version');
        if (!pluginData.main) errors.push('Missing main entry point');
        
        // Security checks
        if (pluginData.permissions && !Array.isArray(pluginData.permissions)) {
            errors.push('Invalid permissions format');
        }
        
        // API compatibility
        if (pluginData.apiVersion && !this.isCompatibleApiVersion(pluginData.apiVersion)) {
            errors.push('Incompatible API version');
        }
        
        // Code validation
        if (pluginData.code) {
            const codeValidation = await this.validatePluginCode(pluginData.code);
            if (!codeValidation.valid) {
                errors.push(...codeValidation.errors);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    async validatePluginCode(code) {
        const errors = [];
        const dangerousPatterns = [
            /eval\s*\(/,
            /Function\s*\(/,
            /document\.write/,
            /innerHTML\s*=/,
            /localStorage\.clear/,
            /sessionStorage\.clear/,
            /window\.location/,
            /XMLHttpRequest/,
            /fetch\s*\(/
        ];
        
        dangerousPatterns.forEach(pattern => {
            if (pattern.test(code)) {
                errors.push(`Potentially dangerous code pattern detected: ${pattern}`);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Plugin Sandbox
    createPluginSandbox(pluginId) {
        const sandbox = {
            id: pluginId,
            api: this.createSandboxAPI(),
            globals: new Map(),
            permissions: new Set(),
            resources: new Set()
        };
        
        this.sandboxes.set(pluginId, sandbox);
        return sandbox;
    }

    createSandboxAPI() {
        return {
            // Safe API methods for plugins
            log: (...args) => console.log('[Plugin]', ...args),
            error: (...args) => console.error('[Plugin]', ...args),
            
            // Zeeky AI integration
            addTool: (tool) => this.addPluginTool(tool),
            addPersonality: (personality) => this.addPluginPersonality(personality),
            addCommand: (command) => this.addPluginCommand(command),
            
            // UI integration
            addMenuItem: (item) => this.addPluginMenuItem(item),
            showNotification: (message, type) => this.showPluginNotification(message, type),
            
            // Data access (with permissions)
            getUserData: () => this.getPluginUserData(),
            setUserData: (key, value) => this.setPluginUserData(key, value),
            
            // Event system
            on: (event, handler) => this.addPluginEventListener(event, handler),
            emit: (event, data) => this.emitPluginEvent(event, data),
            
            // HTTP requests (sandboxed)
            request: (options) => this.makePluginRequest(options)
        };
    }

    destroyPluginSandbox(pluginId) {
        const sandbox = this.sandboxes.get(pluginId);
        if (sandbox) {
            // Cleanup resources
            sandbox.resources.forEach(resource => {
                if (resource.cleanup) resource.cleanup();
            });
            
            this.sandboxes.delete(pluginId);
        }
    }

    // Official Plugins
    loadOfficialPlugins() {
        const officialPlugins = [
            {
                id: 'weather-plugin',
                name: 'Weather Information',
                version: '1.0.0',
                description: 'Get current weather and forecasts',
                author: 'Zeeky AI Team',
                permissions: ['network'],
                main: this.createWeatherPlugin.bind(this)
            },
            {
                id: 'calculator-plugin',
                name: 'Advanced Calculator',
                version: '1.0.0',
                description: 'Mathematical calculations and expressions',
                author: 'Zeeky AI Team',
                permissions: [],
                main: this.createCalculatorPlugin.bind(this)
            },
            {
                id: 'translator-plugin',
                name: 'Language Translator',
                version: '1.0.0',
                description: 'Translate text between languages',
                author: 'Zeeky AI Team',
                permissions: ['network'],
                main: this.createTranslatorPlugin.bind(this)
            },
            {
                id: 'qr-generator-plugin',
                name: 'QR Code Generator',
                version: '1.0.0',
                description: 'Generate QR codes for text and URLs',
                author: 'Zeeky AI Team',
                permissions: [],
                main: this.createQRGeneratorPlugin.bind(this)
            }
        ];

        officialPlugins.forEach(plugin => {
            this.installPlugin(plugin, 'official');
        });
    }

    // Official Plugin Implementations
    createWeatherPlugin() {
        return {
            name: 'Weather Plugin',
            tools: [{
                name: 'get_weather',
                description: 'Get current weather for a location',
                parameters: {
                    type: 'object',
                    properties: {
                        location: { type: 'string', description: 'City name or coordinates' }
                    }
                },
                function: async (params) => {
                    // Mock weather data
                    return {
                        location: params.location,
                        temperature: Math.round(Math.random() * 30 + 10),
                        condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
                        humidity: Math.round(Math.random() * 100),
                        windSpeed: Math.round(Math.random() * 20)
                    };
                }
            }],
            commands: [{
                name: 'weather',
                description: 'Get weather information',
                handler: async (args) => {
                    const location = args.join(' ') || 'current location';
                    const weather = await this.tools[0].function({ location });
                    return `Weather in ${weather.location}: ${weather.temperature}°C, ${weather.condition}`;
                }
            }]
        };
    }

    createCalculatorPlugin() {
        return {
            name: 'Calculator Plugin',
            tools: [{
                name: 'calculate',
                description: 'Perform mathematical calculations',
                parameters: {
                    type: 'object',
                    properties: {
                        expression: { type: 'string', description: 'Mathematical expression' }
                    }
                },
                function: async (params) => {
                    try {
                        // Safe evaluation (in production, use a proper math parser)
                        const result = Function(`"use strict"; return (${params.expression})`)();
                        return { result, expression: params.expression };
                    } catch (error) {
                        return { error: 'Invalid mathematical expression' };
                    }
                }
            }],
            commands: [{
                name: 'calc',
                description: 'Calculate mathematical expressions',
                handler: async (args) => {
                    const expression = args.join(' ');
                    const result = await this.tools[0].function({ expression });
                    return result.error ? result.error : `${expression} = ${result.result}`;
                }
            }]
        };
    }

    createTranslatorPlugin() {
        return {
            name: 'Translator Plugin',
            tools: [{
                name: 'translate',
                description: 'Translate text between languages',
                parameters: {
                    type: 'object',
                    properties: {
                        text: { type: 'string', description: 'Text to translate' },
                        from: { type: 'string', description: 'Source language' },
                        to: { type: 'string', description: 'Target language' }
                    }
                },
                function: async (params) => {
                    // Mock translation
                    return {
                        originalText: params.text,
                        translatedText: `[Translated from ${params.from} to ${params.to}] ${params.text}`,
                        fromLanguage: params.from,
                        toLanguage: params.to
                    };
                }
            }]
        };
    }

    createQRGeneratorPlugin() {
        return {
            name: 'QR Generator Plugin',
            tools: [{
                name: 'generate_qr',
                description: 'Generate QR code for text or URL',
                parameters: {
                    type: 'object',
                    properties: {
                        text: { type: 'string', description: 'Text or URL to encode' },
                        size: { type: 'number', description: 'QR code size' }
                    }
                },
                function: async (params) => {
                    const size = params.size || 200;
                    return {
                        text: params.text,
                        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(params.text)}`,
                        size: size
                    };
                }
            }]
        };
    }

    // Hook System
    setupCoreHooks() {
        this.hooks.set('message:before', []);
        this.hooks.set('message:after', []);
        this.hooks.set('plugin:installed', []);
        this.hooks.set('plugin:uninstalling', []);
        this.hooks.set('tool:executed', []);
        this.hooks.set('ui:render', []);
    }

    addHook(hookName, callback) {
        if (!this.hooks.has(hookName)) {
            this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName).push(callback);
    }

    async executeHook(hookName, data) {
        const callbacks = this.hooks.get(hookName) || [];
        for (const callback of callbacks) {
            try {
                await callback(data);
            } catch (error) {
                console.error(`Hook execution failed for ${hookName}:`, error);
            }
        }
    }

    // Plugin Integration Methods
    addPluginTool(tool) {
        if (window.advancedAI) {
            window.advancedAI.tools.set(tool.name, tool);
        }
    }

    addPluginPersonality(personality) {
        if (window.aiPersonalitiesManager) {
            window.aiPersonalitiesManager.addCustomPersonality(personality);
        }
    }

    addPluginCommand(command) {
        // Add command to command system
        console.log('Plugin command added:', command.name);
    }

    // UI Integration
    createPluginUI() {
        const pluginPanel = document.createElement('div');
        pluginPanel.id = 'plugin-panel';
        pluginPanel.className = 'plugin-panel';
        pluginPanel.innerHTML = `
            <div class="plugin-header">
                <h3>🔌 Plugins</h3>
                <button class="plugin-store-btn" onclick="window.pluginSystem.showPluginStore()">
                    <i class="fas fa-store"></i> Store
                </button>
            </div>
            <div class="plugin-list" id="plugin-list">
                ${this.renderPluginList()}
            </div>
        `;

        // Add to sidebar
        const sidebar = document.querySelector('.sidebar, .dashboard-nav');
        if (sidebar) {
            sidebar.appendChild(pluginPanel);
        }
    }

    renderPluginList() {
        let html = '';
        
        this.plugins.forEach((plugin, id) => {
            const pluginData = this.getPluginData(id);
            html += `
                <div class="plugin-item" data-plugin="${id}">
                    <div class="plugin-info">
                        <div class="plugin-name">${pluginData.name}</div>
                        <div class="plugin-version">v${pluginData.version}</div>
                    </div>
                    <div class="plugin-actions">
                        <button class="plugin-toggle ${plugin.enabled ? 'enabled' : 'disabled'}" 
                                onclick="window.pluginSystem.togglePlugin('${id}')">
                            <i class="fas fa-${plugin.enabled ? 'toggle-on' : 'toggle-off'}"></i>
                        </button>
                        <button class="plugin-settings" onclick="window.pluginSystem.showPluginSettings('${id}')">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        return html || '<div class="no-plugins">No plugins installed</div>';
    }

    // Utility Methods
    getPluginData(pluginId) {
        for (const registry of Object.values(this.registry)) {
            if (registry.has(pluginId)) {
                return registry.get(pluginId);
            }
        }
        return null;
    }

    isCompatibleApiVersion(version) {
        // Simple version compatibility check
        const currentVersion = '1.0.0';
        return version === currentVersion;
    }

    savePluginRegistry() {
        const registryData = {
            custom: Array.from(this.registry.custom.entries()),
            community: Array.from(this.registry.community.entries())
        };
        localStorage.setItem('zeeky_plugin_registry', JSON.stringify(registryData));
    }

    loadPluginRegistry() {
        const stored = localStorage.getItem('zeeky_plugin_registry');
        if (stored) {
            const registryData = JSON.parse(stored);
            this.registry.custom = new Map(registryData.custom || []);
            this.registry.community = new Map(registryData.community || []);
        }
    }

    // Public API
    getInstalledPlugins() {
        return Array.from(this.plugins.keys());
    }

    getPluginInfo(pluginId) {
        return {
            plugin: this.plugins.get(pluginId),
            data: this.getPluginData(pluginId),
            sandbox: this.sandboxes.get(pluginId)
        };
    }

    async initializePlugin(pluginData, sandbox) {
        const plugin = await pluginData.main();
        plugin.id = pluginData.id;
        plugin.enabled = true;
        plugin.sandbox = sandbox;
        
        // Register plugin tools
        if (plugin.tools) {
            plugin.tools.forEach(tool => this.addPluginTool(tool));
        }
        
        // Register plugin commands
        if (plugin.commands) {
            plugin.commands.forEach(command => this.addPluginCommand(command));
        }
        
        return plugin;
    }
}

// Initialize Plugin System
document.addEventListener('DOMContentLoaded', () => {
    window.pluginSystem = new PluginSystem();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PluginSystem;
}
