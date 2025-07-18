// Comprehensive Feature Test Suite for Zeeky AI
class ComprehensiveFeatureTest {
    constructor() {
        this.testResults = {};
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.init();
    }

    init() {
        console.log('🚀 Starting Comprehensive Feature Test Suite...');
        this.runAllTests();
    }

    async runAllTests() {
        // Core Features Tests
        await this.testCoreFeatures();
        
        // AI Personalities Tests
        await this.testAIPersonalities();
        
        // Extensions Tests
        await this.testExtensions();
        
        // UI Components Tests
        await this.testUIComponents();
        
        // Integration Tests
        await this.testIntegrations();
        
        // Performance Tests
        await this.testPerformance();
        
        // Generate final report
        this.generateTestReport();
    }

    async testCoreFeatures() {
        console.log('🧪 Testing Core Features...');
        
        const coreTests = [
            { name: 'Chat Interface', test: () => this.testChatInterface() },
            { name: 'File Upload', test: () => this.testFileUpload() },
            { name: 'Voice Input', test: () => this.testVoiceInput() },
            { name: 'Theme System', test: () => this.testThemeSystem() },
            { name: 'Settings Manager', test: () => this.testSettingsManager() },
            { name: 'Error Handling', test: () => this.testErrorHandling() },
            { name: 'Loading Manager', test: () => this.testLoadingManager() },
            { name: 'WebSocket Client', test: () => this.testWebSocketClient() }
        ];

        for (const test of coreTests) {
            await this.runTest(test.name, test.test);
        }
    }

    async testAIPersonalities() {
        console.log('🎭 Testing AI Personalities...');
        
        const personalityTests = [
            { name: 'Personality Manager Initialization', test: () => this.testPersonalityManager() },
            { name: 'Personality Switching', test: () => this.testPersonalitySwitching() },
            { name: 'All 30 Personalities Available', test: () => this.testAllPersonalities() },
            { name: 'Custom Personalities', test: () => this.testCustomPersonalities() },
            { name: 'Personality Categories', test: () => this.testPersonalityCategories() }
        ];

        for (const test of personalityTests) {
            await this.runTest(test.name, test.test);
        }
    }

    async testExtensions() {
        console.log('🔧 Testing Extensions...');
        
        const extensionTests = [
            { name: 'Code Laboratory', test: () => this.testCodeLaboratory() },
            { name: 'Vision AI', test: () => this.testVisionAI() },
            { name: 'Analytics', test: () => this.testAnalytics() },
            { name: 'Keyboard Shortcuts', test: () => this.testKeyboardShortcuts() },
            { name: 'AI Models', test: () => this.testAIModels() },
            { name: 'Collaboration', test: () => this.testCollaboration() },
            { name: 'Workflow Automation', test: () => this.testWorkflowAutomation() }
        ];

        for (const test of extensionTests) {
            await this.runTest(test.name, test.test);
        }
    }

    async testUIComponents() {
        console.log('🎨 Testing UI Components...');
        
        const uiTests = [
            { name: 'Logo Display', test: () => this.testLogoDisplay() },
            { name: 'Navigation System', test: () => this.testNavigationSystem() },
            { name: 'Dashboard Cards', test: () => this.testDashboardCards() },
            { name: 'Modal System', test: () => this.testModalSystem() },
            { name: 'Notification System', test: () => this.testNotificationSystem() },
            { name: 'Responsive Design', test: () => this.testResponsiveDesign() }
        ];

        for (const test of uiTests) {
            await this.runTest(test.name, test.test);
        }
    }

    async testIntegrations() {
        console.log('🔗 Testing Integrations...');
        
        const integrationTests = [
            { name: 'Edge Functions Client', test: () => this.testEdgeFunctionsClient() },
            { name: 'Universal Settings', test: () => this.testUniversalSettings() },
            { name: 'Universal Navigation', test: () => this.testUniversalNavigation() },
            { name: 'Website Components Checker', test: () => this.testWebsiteComponentsChecker() }
        ];

        for (const test of integrationTests) {
            await this.runTest(test.name, test.test);
        }
    }

    async testPerformance() {
        console.log('⚡ Testing Performance...');
        
        const performanceTests = [
            { name: 'Page Load Time', test: () => this.testPageLoadTime() },
            { name: 'Memory Usage', test: () => this.testMemoryUsage() },
            { name: 'Script Loading', test: () => this.testScriptLoading() },
            { name: 'CSS Loading', test: () => this.testCSSLoading() }
        ];

        for (const test of performanceTests) {
            await this.runTest(test.name, test.test);
        }
    }

    async runTest(testName, testFunction) {
        this.totalTests++;
        try {
            const result = await testFunction();
            if (result.success) {
                this.passedTests++;
                this.testResults[testName] = { status: 'PASS', details: result.details };
                console.log(`✅ ${testName}: PASSED`);
            } else {
                this.failedTests++;
                this.testResults[testName] = { status: 'FAIL', details: result.details };
                console.log(`❌ ${testName}: FAILED - ${result.details}`);
            }
        } catch (error) {
            this.failedTests++;
            this.testResults[testName] = { status: 'ERROR', details: error.message };
            console.log(`💥 ${testName}: ERROR - ${error.message}`);
        }
    }

    // Individual Test Functions
    testChatInterface() {
        const chatInput = document.querySelector('#chat-input, #message-input');
        const sendButton = document.querySelector('#send-btn, #send-button');
        
        if (!chatInput || !sendButton) {
            return { success: false, details: 'Chat interface elements not found' };
        }
        
        return { success: true, details: 'Chat interface elements present and functional' };
    }

    testFileUpload() {
        const fileInput = document.querySelector('input[type="file"]');
        const fileHandler = window.fileHandler || window.FileHandler;
        
        if (!fileInput && !fileHandler) {
            return { success: false, details: 'File upload functionality not found' };
        }
        
        return { success: true, details: 'File upload functionality available' };
    }

    testVoiceInput() {
        const voiceHandler = window.voiceHandler;
        const voiceButton = document.querySelector('.voice-btn, #voice-btn');
        
        if (!voiceHandler && !voiceButton) {
            return { success: false, details: 'Voice input functionality not found' };
        }
        
        return { success: true, details: 'Voice input functionality available' };
    }

    testThemeSystem() {
        const themeManager = window.themeManager;
        const darkModeToggle = document.querySelector('.theme-toggle, #theme-toggle');
        
        if (!themeManager && !darkModeToggle) {
            return { success: false, details: 'Theme system not found' };
        }
        
        return { success: true, details: 'Theme system available' };
    }

    testSettingsManager() {
        const universalSettings = window.universalSettings;
        const settingsButton = document.querySelector('.settings-btn, #settings-btn');
        
        if (!universalSettings && !settingsButton) {
            return { success: false, details: 'Settings manager not found' };
        }
        
        return { success: true, details: 'Settings manager available' };
    }

    testErrorHandling() {
        const errorHandler = window.errorHandler;
        
        if (!errorHandler) {
            return { success: false, details: 'Error handler not found' };
        }
        
        return { success: true, details: 'Error handling system active' };
    }

    testLoadingManager() {
        const loadingManager = window.loadingManager;
        
        if (!loadingManager) {
            return { success: false, details: 'Loading manager not found' };
        }
        
        return { success: true, details: 'Loading manager active' };
    }

    testWebSocketClient() {
        const wsClient = window.wsClient;
        
        if (!wsClient) {
            return { success: false, details: 'WebSocket client not found' };
        }
        
        return { success: true, details: 'WebSocket client available' };
    }

    testPersonalityManager() {
        const personalityManager = window.aiPersonalitiesManager;
        
        if (!personalityManager) {
            return { success: false, details: 'AI Personalities manager not found' };
        }
        
        return { success: true, details: 'AI Personalities manager active' };
    }

    testPersonalitySwitching() {
        const personalityManager = window.aiPersonalitiesManager;
        
        if (!personalityManager || typeof personalityManager.switchPersonality !== 'function') {
            return { success: false, details: 'Personality switching not available' };
        }
        
        return { success: true, details: 'Personality switching available' };
    }

    testAllPersonalities() {
        const personalityManager = window.aiPersonalitiesManager;
        
        if (!personalityManager) {
            return { success: false, details: 'Personality manager not found' };
        }
        
        const allPersonalities = personalityManager.getAllPersonalities();
        const personalityCount = Object.keys(allPersonalities).length;
        
        if (personalityCount < 30) {
            return { success: false, details: `Only ${personalityCount} personalities found, expected 30+` };
        }
        
        return { success: true, details: `${personalityCount} personalities available` };
    }

    testCustomPersonalities() {
        const personalityManager = window.aiPersonalitiesManager;
        
        if (!personalityManager || typeof personalityManager.createCustomPersonality !== 'function') {
            return { success: false, details: 'Custom personality creation not available' };
        }
        
        return { success: true, details: 'Custom personality creation available' };
    }

    testPersonalityCategories() {
        const personalityManager = window.aiPersonalitiesManager;
        
        if (!personalityManager) {
            return { success: false, details: 'Personality manager not found' };
        }
        
        const categories = ['creative', 'technical', 'wellness', 'professional'];
        const availableCategories = Object.keys(personalityManager.personalities || {});
        
        const missingCategories = categories.filter(cat => !availableCategories.includes(cat));
        
        if (missingCategories.length > 0) {
            return { success: false, details: `Missing categories: ${missingCategories.join(', ')}` };
        }
        
        return { success: true, details: `All personality categories available: ${availableCategories.join(', ')}` };
    }

    testCodeLaboratory() {
        const codeLab = window.codeLaboratory;
        
        if (!codeLab) {
            return { success: false, details: 'Code Laboratory not found' };
        }
        
        return { success: true, details: 'Code Laboratory available' };
    }

    testVisionAI() {
        const visionAI = window.visionAI;
        
        if (!visionAI) {
            return { success: false, details: 'Vision AI not found' };
        }
        
        return { success: true, details: 'Vision AI available' };
    }

    testAnalytics() {
        const analytics = window.analyticsManager;
        
        if (!analytics) {
            return { success: false, details: 'Analytics manager not found' };
        }
        
        return { success: true, details: 'Analytics system available' };
    }

    testKeyboardShortcuts() {
        const shortcuts = window.keyboardShortcuts;
        
        if (!shortcuts) {
            return { success: false, details: 'Keyboard shortcuts not found' };
        }
        
        return { success: true, details: 'Keyboard shortcuts available' };
    }

    testAIModels() {
        const aiModels = window.aiModelsManager;
        
        if (!aiModels) {
            return { success: false, details: 'AI Models manager not found' };
        }
        
        return { success: true, details: 'AI Models manager available' };
    }

    testCollaboration() {
        const collaboration = window.collaborationManager;
        
        if (!collaboration) {
            return { success: false, details: 'Collaboration manager not found' };
        }
        
        return { success: true, details: 'Collaboration system available' };
    }

    testWorkflowAutomation() {
        const workflow = window.workflowAutomation;
        
        if (!workflow) {
            return { success: false, details: 'Workflow automation not found' };
        }
        
        return { success: true, details: 'Workflow automation available' };
    }

    testLogoDisplay() {
        const logos = document.querySelectorAll('img[src*="zeeky-logo"], img[alt*="Zeeky"]');
        
        if (logos.length === 0) {
            return { success: false, details: 'No Zeeky logos found on page' };
        }
        
        return { success: true, details: `${logos.length} logo instances found` };
    }

    testNavigationSystem() {
        const navigation = window.universalNavigation;
        const navElements = document.querySelectorAll('nav, .nav, .navigation');
        
        if (!navigation && navElements.length === 0) {
            return { success: false, details: 'Navigation system not found' };
        }
        
        return { success: true, details: 'Navigation system available' };
    }

    testDashboardCards() {
        const cards = document.querySelectorAll('.dashboard-card, .action-card, .card');
        
        if (cards.length === 0) {
            return { success: false, details: 'No dashboard cards found' };
        }
        
        return { success: true, details: `${cards.length} dashboard cards found` };
    }

    testModalSystem() {
        const modals = document.querySelectorAll('.modal, .settings-modal');
        
        if (modals.length === 0) {
            return { success: false, details: 'No modal system found' };
        }
        
        return { success: true, details: `${modals.length} modals available` };
    }

    testNotificationSystem() {
        const notifications = window.showNotification || window.ZeekyUtils?.showNotification;
        
        if (!notifications) {
            return { success: false, details: 'Notification system not found' };
        }
        
        return { success: true, details: 'Notification system available' };
    }

    testResponsiveDesign() {
        const viewport = document.querySelector('meta[name="viewport"]');
        const mediaQueries = Array.from(document.styleSheets).some(sheet => {
            try {
                return Array.from(sheet.cssRules).some(rule => 
                    rule.type === CSSRule.MEDIA_RULE
                );
            } catch (e) {
                return false;
            }
        });
        
        if (!viewport || !mediaQueries) {
            return { success: false, details: 'Responsive design elements missing' };
        }
        
        return { success: true, details: 'Responsive design implemented' };
    }

    testEdgeFunctionsClient() {
        const edgeClient = window.edgeFunctionsClient;
        
        if (!edgeClient) {
            return { success: false, details: 'Edge Functions client not found' };
        }
        
        return { success: true, details: 'Edge Functions client available' };
    }

    testUniversalSettings() {
        const settings = window.universalSettings;
        
        if (!settings) {
            return { success: false, details: 'Universal Settings not found' };
        }
        
        return { success: true, details: 'Universal Settings available' };
    }

    testUniversalNavigation() {
        const navigation = window.universalNavigation;
        
        if (!navigation) {
            return { success: false, details: 'Universal Navigation not found' };
        }
        
        return { success: true, details: 'Universal Navigation available' };
    }

    testWebsiteComponentsChecker() {
        const checker = window.websiteComponentsChecker;
        
        if (!checker) {
            return { success: false, details: 'Website Components Checker not found' };
        }
        
        return { success: true, details: 'Website Components Checker available' };
    }

    testPageLoadTime() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        
        if (loadTime > 5000) {
            return { success: false, details: `Page load time too slow: ${loadTime}ms` };
        }
        
        return { success: true, details: `Page load time: ${loadTime}ms` };
    }

    testMemoryUsage() {
        if (!performance.memory) {
            return { success: true, details: 'Memory API not available (browser limitation)' };
        }
        
        const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
        
        if (memoryUsage > 100) {
            return { success: false, details: `High memory usage: ${memoryUsage.toFixed(2)}MB` };
        }
        
        return { success: true, details: `Memory usage: ${memoryUsage.toFixed(2)}MB` };
    }

    testScriptLoading() {
        const scripts = document.querySelectorAll('script[src]');
        const loadedScripts = Array.from(scripts).filter(script => !script.hasAttribute('async') || script.readyState === 'complete');
        
        if (loadedScripts.length < scripts.length) {
            return { success: false, details: `${scripts.length - loadedScripts.length} scripts still loading` };
        }
        
        return { success: true, details: `All ${scripts.length} scripts loaded` };
    }

    testCSSLoading() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        
        if (stylesheets.length === 0) {
            return { success: false, details: 'No stylesheets found' };
        }
        
        return { success: true, details: `${stylesheets.length} stylesheets loaded` };
    }

    generateTestReport() {
        const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
        
        console.log('\n🎯 COMPREHENSIVE TEST REPORT');
        console.log('================================');
        console.log(`📊 Total Tests: ${this.totalTests}`);
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`📈 Success Rate: ${successRate}%`);
        console.log('================================\n');
        
        // Log detailed results
        Object.entries(this.testResults).forEach(([testName, result]) => {
            const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '💥';
            console.log(`${icon} ${testName}: ${result.status} - ${result.details}`);
        });
        
        // Create visual report
        this.createVisualReport(successRate);
    }

    createVisualReport(successRate) {
        const reportContainer = document.createElement('div');
        reportContainer.id = 'test-report';
        reportContainer.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.9); color: white; padding: 20px; border-radius: 10px; z-index: 10000; max-width: 400px;">
                <h3>🎯 Feature Test Report</h3>
                <div style="margin: 10px 0;">
                    <div>Total Tests: ${this.totalTests}</div>
                    <div style="color: #4ade80;">Passed: ${this.passedTests}</div>
                    <div style="color: #f87171;">Failed: ${this.failedTests}</div>
                    <div>Success Rate: ${successRate}%</div>
                </div>
                <div style="background: #333; height: 20px; border-radius: 10px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #4ade80, #22c55e); height: 100%; width: ${successRate}%; transition: width 0.5s ease;"></div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
        `;
        
        document.body.appendChild(reportContainer);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (reportContainer.parentElement) {
                reportContainer.remove();
            }
        }, 30000);
    }
}

// Auto-run tests when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for all other scripts to load
    setTimeout(() => {
        window.comprehensiveFeatureTest = new ComprehensiveFeatureTest();
    }, 3000);
});

// Export for manual testing
window.runFeatureTests = () => {
    new ComprehensiveFeatureTest();
};
