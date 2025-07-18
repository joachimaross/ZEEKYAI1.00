// Workflow Automation Extension for Zeeky AI
class WorkflowAutomation {
    constructor() {
        this.workflows = new Map();
        this.activeWorkflows = new Map();
        this.executionHistory = [];
        this.components = {
            triggers: {
                schedule: {
                    name: 'Schedule',
                    icon: 'fas fa-clock',
                    description: 'Trigger workflow at specific times',
                    config: ['interval', 'time', 'days']
                },
                webhook: {
                    name: 'Webhook',
                    icon: 'fas fa-link',
                    description: 'Trigger workflow via HTTP request',
                    config: ['url', 'method', 'headers']
                },
                file: {
                    name: 'File Upload',
                    icon: 'fas fa-file',
                    description: 'Trigger when files are uploaded',
                    config: ['fileTypes', 'maxSize']
                }
            },
            actions: {
                'ai-chat': {
                    name: 'AI Chat',
                    icon: 'fas fa-robot',
                    description: 'Send message to AI and get response',
                    config: ['prompt', 'model', 'temperature']
                },
                email: {
                    name: 'Send Email',
                    icon: 'fas fa-envelope',
                    description: 'Send email notification',
                    config: ['to', 'subject', 'body']
                },
                api: {
                    name: 'API Call',
                    icon: 'fas fa-code',
                    description: 'Make HTTP API request',
                    config: ['url', 'method', 'headers', 'body']
                }
            }
        };
        
        this.templates = {
            'daily-summary': {
                name: 'Daily Summary',
                description: 'Generate daily AI summaries of your activities',
                workflow: {
                    trigger: { type: 'schedule', config: { interval: 'daily', time: '18:00' } },
                    actions: [
                        { type: 'ai-chat', config: { prompt: 'Generate a summary of today\'s activities' } },
                        { type: 'email', config: { subject: 'Daily Summary', body: '{{ai_response}}' } }
                    ]
                }
            },
            'file-processor': {
                name: 'File Processor',
                description: 'Automatically process uploaded files with AI',
                workflow: {
                    trigger: { type: 'file', config: { fileTypes: ['pdf', 'doc', 'txt'] } },
                    actions: [
                        { type: 'ai-chat', config: { prompt: 'Analyze this file: {{file_content}}' } },
                        { type: 'email', config: { subject: 'File Analysis Complete', body: '{{ai_response}}' } }
                    ]
                }
            },
            'smart-notifications': {
                name: 'Smart Notifications',
                description: 'AI-powered intelligent notification system',
                workflow: {
                    trigger: { type: 'webhook', config: { method: 'POST' } },
                    actions: [
                        { type: 'ai-chat', config: { prompt: 'Analyze this notification and determine priority: {{webhook_data}}' } },
                        { type: 'email', config: { subject: 'Smart Alert', body: '{{ai_response}}' } }
                    ]
                }
            }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadWorkflows();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        // Workflow modal
        const workflowBtn = document.getElementById('workflow-btn');
        workflowBtn?.addEventListener('click', () => this.openWorkflowModal());

        // Workflow tabs
        document.querySelectorAll('.workflow-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchWorkflowTab(tab.dataset.tab));
        });

        // Template usage
        document.querySelectorAll('.template-card').forEach(card => {
            const useBtn = card.querySelector('button');
            useBtn?.addEventListener('click', () => this.useTemplate(card.dataset.template));
        });
    }

    setupDragAndDrop() {
        const canvas = document.getElementById('workflow-canvas');
        const components = document.querySelectorAll('.component');

        if (!canvas) return;

        // Make components draggable
        components.forEach(component => {
            component.draggable = true;
            component.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: component.dataset.type,
                    subtype: component.dataset.subtype
                }));
            });
        });

        // Setup canvas drop zone
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            canvas.classList.add('drag-over');
        });

        canvas.addEventListener('dragleave', () => {
            canvas.classList.remove('drag-over');
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            canvas.classList.remove('drag-over');
            
            try {
                const componentData = JSON.parse(e.dataTransfer.getData('text/plain'));
                this.addComponentToCanvas(componentData, e.offsetX, e.offsetY);
            } catch (error) {
                console.error('Failed to add component:', error);
            }
        });
    }

    openWorkflowModal() {
        const modal = document.getElementById('workflow-modal');
        if (modal) {
            modal.classList.add('active');
            this.updateActiveWorkflowsList();
            this.updateWorkflowHistory();
        }
    }

    switchWorkflowTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.workflow-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update panels
        document.querySelectorAll('.workflow-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });
    }

    addComponentToCanvas(componentData, x, y) {
        const canvas = document.getElementById('workflow-canvas');
        if (!canvas) return;

        // Remove placeholder if it exists
        const placeholder = canvas.querySelector('.canvas-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        // Create component element
        const componentElement = document.createElement('div');
        componentElement.className = 'workflow-component';
        componentElement.style.position = 'absolute';
        componentElement.style.left = x + 'px';
        componentElement.style.top = y + 'px';
        
        const componentInfo = this.components[componentData.type][componentData.subtype];
        
        componentElement.innerHTML = `
            <div class="component-header">
                <i class="${componentInfo.icon}"></i>
                <span>${componentInfo.name}</span>
                <button class="component-delete" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="component-body">
                <p>${componentInfo.description}</p>
                <button class="btn-secondary component-config" onclick="workflowAutomation.configureComponent(this)">
                    Configure
                </button>
            </div>
        `;

        // Store component data
        componentElement.dataset.type = componentData.type;
        componentElement.dataset.subtype = componentData.subtype;

        canvas.appendChild(componentElement);
        
        this.showNotification(`Added ${componentInfo.name} component`, 'success');
    }

    configureComponent(button) {
        const component = button.closest('.workflow-component');
        const type = component.dataset.type;
        const subtype = component.dataset.subtype;
        const componentInfo = this.components[type][subtype];

        // Create configuration modal
        const configModal = document.createElement('div');
        configModal.className = 'modal active';
        configModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Configure ${componentInfo.name}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form class="component-config-form">
                        ${this.generateConfigForm(componentInfo.config)}
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn-primary">Save Configuration</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(configModal);

        // Handle form submission
        const form = configModal.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveComponentConfig(component, form);
            configModal.remove();
        });
    }

    generateConfigForm(configFields) {
        return configFields.map(field => {
            switch (field) {
                case 'interval':
                    return `
                        <div class="form-group">
                            <label for="interval">Interval</label>
                            <select name="interval" id="interval">
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    `;
                case 'time':
                    return `
                        <div class="form-group">
                            <label for="time">Time</label>
                            <input type="time" name="time" id="time" value="09:00">
                        </div>
                    `;
                case 'prompt':
                    return `
                        <div class="form-group">
                            <label for="prompt">AI Prompt</label>
                            <textarea name="prompt" id="prompt" rows="3" placeholder="Enter your AI prompt..."></textarea>
                        </div>
                    `;
                case 'url':
                    return `
                        <div class="form-group">
                            <label for="url">URL</label>
                            <input type="url" name="url" id="url" placeholder="https://api.example.com/endpoint">
                        </div>
                    `;
                case 'method':
                    return `
                        <div class="form-group">
                            <label for="method">HTTP Method</label>
                            <select name="method" id="method">
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                        </div>
                    `;
                case 'to':
                    return `
                        <div class="form-group">
                            <label for="to">To Email</label>
                            <input type="email" name="to" id="to" placeholder="recipient@example.com">
                        </div>
                    `;
                case 'subject':
                    return `
                        <div class="form-group">
                            <label for="subject">Subject</label>
                            <input type="text" name="subject" id="subject" placeholder="Email subject">
                        </div>
                    `;
                case 'body':
                    return `
                        <div class="form-group">
                            <label for="body">Body</label>
                            <textarea name="body" id="body" rows="4" placeholder="Email body content..."></textarea>
                        </div>
                    `;
                default:
                    return `
                        <div class="form-group">
                            <label for="${field}">${field.charAt(0).toUpperCase() + field.slice(1)}</label>
                            <input type="text" name="${field}" id="${field}" placeholder="Enter ${field}">
                        </div>
                    `;
            }
        }).join('');
    }

    saveComponentConfig(component, form) {
        const formData = new FormData(form);
        const config = {};
        
        for (const [key, value] of formData.entries()) {
            config[key] = value;
        }

        // Store configuration in component
        component.dataset.config = JSON.stringify(config);
        
        // Update component display
        const configBtn = component.querySelector('.component-config');
        configBtn.textContent = 'Configured ✓';
        configBtn.classList.add('configured');

        this.showNotification('Component configured successfully', 'success');
    }

    useTemplate(templateKey) {
        const template = this.templates[templateKey];
        if (!template) return;

        const workflowId = this.createWorkflow(template.name, template.workflow);
        this.showNotification(`Created workflow from ${template.name} template`, 'success');
        
        // Switch to active tab to show the new workflow
        this.switchWorkflowTab('active');
        this.updateActiveWorkflowsList();
    }

    createWorkflow(name, workflowData) {
        const workflowId = this.generateWorkflowId();
        const workflow = {
            id: workflowId,
            name: name,
            created: Date.now(),
            status: 'active',
            trigger: workflowData.trigger,
            actions: workflowData.actions,
            executions: 0,
            lastRun: null
        };

        this.workflows.set(workflowId, workflow);
        this.activeWorkflows.set(workflowId, workflow);
        this.saveWorkflows();

        return workflowId;
    }

    generateWorkflowId() {
        return 'workflow_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async executeWorkflow(workflowId, triggerData = {}) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return;

        const execution = {
            id: this.generateExecutionId(),
            workflowId: workflowId,
            startTime: Date.now(),
            status: 'running',
            triggerData: triggerData,
            results: []
        };

        try {
            // Execute each action in sequence
            for (const action of workflow.actions) {
                const result = await this.executeAction(action, execution.results);
                execution.results.push(result);
            }

            execution.status = 'completed';
            execution.endTime = Date.now();
            
            // Update workflow stats
            workflow.executions++;
            workflow.lastRun = Date.now();

            this.showNotification(`Workflow "${workflow.name}" executed successfully`, 'success');

        } catch (error) {
            execution.status = 'failed';
            execution.error = error.message;
            execution.endTime = Date.now();
            
            this.showNotification(`Workflow "${workflow.name}" failed: ${error.message}`, 'error');
        }

        // Add to execution history
        this.executionHistory.unshift(execution);
        this.saveWorkflows();
        this.updateWorkflowHistory();
    }

    generateExecutionId() {
        return 'exec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async executeAction(action, previousResults) {
        const startTime = Date.now();
        
        try {
            let result;
            
            switch (action.type) {
                case 'ai-chat':
                    result = await this.executeAIChat(action.config, previousResults);
                    break;
                case 'email':
                    result = await this.executeEmail(action.config, previousResults);
                    break;
                case 'api':
                    result = await this.executeAPICall(action.config, previousResults);
                    break;
                default:
                    throw new Error(`Unknown action type: ${action.type}`);
            }

            return {
                type: action.type,
                status: 'success',
                result: result,
                duration: Date.now() - startTime
            };

        } catch (error) {
            return {
                type: action.type,
                status: 'error',
                error: error.message,
                duration: Date.now() - startTime
            };
        }
    }

    async executeAIChat(config, previousResults) {
        // Simulate AI chat execution
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const prompt = this.interpolateVariables(config.prompt, previousResults);
        return `AI Response to: "${prompt}"`;
    }

    async executeEmail(config, previousResults) {
        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const subject = this.interpolateVariables(config.subject, previousResults);
        const body = this.interpolateVariables(config.body, previousResults);
        
        return `Email sent to ${config.to} with subject "${subject}"`;
    }

    async executeAPICall(config, previousResults) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const url = this.interpolateVariables(config.url, previousResults);
        return `API call to ${url} completed successfully`;
    }

    interpolateVariables(text, previousResults) {
        // Replace variables like {{ai_response}} with actual values
        let result = text;
        
        previousResults.forEach((actionResult, index) => {
            if (actionResult.type === 'ai-chat') {
                result = result.replace(/\{\{ai_response\}\}/g, actionResult.result);
            }
        });
        
        return result;
    }

    updateActiveWorkflowsList() {
        const list = document.getElementById('active-workflows-list');
        if (!list) return;

        list.innerHTML = '';

        if (this.activeWorkflows.size === 0) {
            list.innerHTML = '<p class="no-workflows">No active workflows</p>';
            return;
        }

        this.activeWorkflows.forEach(workflow => {
            const workflowItem = document.createElement('div');
            workflowItem.className = 'workflow-item';
            
            workflowItem.innerHTML = `
                <div class="workflow-info">
                    <h4>${workflow.name}</h4>
                    <p>Executions: ${workflow.executions} • Last run: ${workflow.lastRun ? new Date(workflow.lastRun).toLocaleString() : 'Never'}</p>
                </div>
                <div class="workflow-controls">
                    <span class="workflow-status ${workflow.status}">${workflow.status}</span>
                    <button class="btn-secondary" onclick="workflowAutomation.executeWorkflow('${workflow.id}')">
                        <i class="fas fa-play"></i>
                        Run
                    </button>
                    <button class="btn-danger" onclick="workflowAutomation.deleteWorkflow('${workflow.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            list.appendChild(workflowItem);
        });
    }

    updateWorkflowHistory() {
        const list = document.getElementById('workflow-history-list');
        if (!list) return;

        list.innerHTML = '';

        if (this.executionHistory.length === 0) {
            list.innerHTML = '<p class="no-history">No execution history</p>';
            return;
        }

        this.executionHistory.slice(0, 20).forEach(execution => {
            const workflow = this.workflows.get(execution.workflowId);
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const duration = execution.endTime ? execution.endTime - execution.startTime : 0;
            
            historyItem.innerHTML = `
                <div class="history-info">
                    <h4>${workflow ? workflow.name : 'Unknown Workflow'}</h4>
                    <p>${new Date(execution.startTime).toLocaleString()} • Duration: ${duration}ms</p>
                </div>
                <div class="history-status">
                    <span class="workflow-status ${execution.status}">${execution.status}</span>
                </div>
            `;

            list.appendChild(historyItem);
        });
    }

    deleteWorkflow(workflowId) {
        if (confirm('Are you sure you want to delete this workflow?')) {
            this.workflows.delete(workflowId);
            this.activeWorkflows.delete(workflowId);
            this.saveWorkflows();
            this.updateActiveWorkflowsList();
            this.showNotification('Workflow deleted', 'success');
        }
    }

    saveWorkflows() {
        const workflowsData = {
            workflows: [...this.workflows],
            executionHistory: this.executionHistory.slice(0, 100) // Keep last 100 executions
        };
        localStorage.setItem('zeeky_workflows', JSON.stringify(workflowsData));
    }

    loadWorkflows() {
        const saved = localStorage.getItem('zeeky_workflows');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.workflows = new Map(data.workflows || []);
                this.executionHistory = data.executionHistory || [];
                
                // Rebuild active workflows
                this.workflows.forEach(workflow => {
                    if (workflow.status === 'active') {
                        this.activeWorkflows.set(workflow.id, workflow);
                    }
                });
            } catch (e) {
                console.error('Failed to load workflows:', e);
            }
        }
    }

    showNotification(message, type) {
        if (window.ZeekyUtils) {
            window.ZeekyUtils.showNotification(message, type);
        }
    }

    // Public API
    getActiveWorkflows() {
        return [...this.activeWorkflows.values()];
    }

    getExecutionHistory() {
        return this.executionHistory;
    }

    triggerWorkflow(workflowId, data) {
        return this.executeWorkflow(workflowId, data);
    }
}

// Initialize workflow automation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.workflowAutomation = new WorkflowAutomation();
});
