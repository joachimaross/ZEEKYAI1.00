// Code Lab Manager
class CodeLabManager {
    constructor() {
        this.currentLanguage = 'javascript';
        this.codeHistory = [];
        this.currentCode = '';
        this.recognition = null;
        
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            this.initializeCodeEditor();
            this.loadCodeTemplates();
            this.initializeVoiceRecognition();
        } catch (error) {
            console.error('Code Lab initialization error:', error);
            this.showNotification('Failed to initialize Code Lab', 'error');
        }
    }

    setupEventListeners() {
        // Language selector
        document.getElementById('language-select')?.addEventListener('change', (e) => {
            this.switchLanguage(e.target.value);
        });

        // Editor tools
        document.getElementById('format-code')?.addEventListener('click', () => {
            this.formatCode();
        });

        document.getElementById('clear-code')?.addEventListener('click', () => {
            this.clearCode();
        });

        document.getElementById('fullscreen-editor')?.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Header actions
        document.getElementById('run-code-btn')?.addEventListener('click', () => {
            this.runCode();
        });

        document.getElementById('save-code-btn')?.addEventListener('click', () => {
            this.saveCode();
        });

        document.getElementById('share-code-btn')?.addEventListener('click', () => {
            this.shareCode();
        });

        // Suggestion tabs
        document.querySelectorAll('.suggestion-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchSuggestionTab(tab.dataset.tab);
            });
        });

        // Quick actions
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleQuickAction(btn.dataset.action);
            });
        });

        // Debug tools
        document.querySelectorAll('.debug-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleDebugAction(btn.id);
            });
        });

        // Optimize tools
        document.querySelectorAll('.optimize-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleOptimizeAction(btn.id);
            });
        });

        // Explain tools
        document.querySelectorAll('.explain-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleExplainAction(btn.id);
            });
        });

        // AI chat
        document.getElementById('send-code-query')?.addEventListener('click', () => {
            this.sendCodeQuery();
        });

        document.getElementById('code-ai-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendCodeQuery();
            }
        });

        document.getElementById('voice-code-input')?.addEventListener('click', () => {
            this.startVoiceInput();
        });

        // Output controls
        document.getElementById('clear-output')?.addEventListener('click', () => {
            this.clearOutput();
        });

        document.getElementById('download-output')?.addEventListener('click', () => {
            this.downloadOutput();
        });

        // Output tabs
        document.querySelectorAll('.output-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchOutputTab(tab.dataset.output);
            });
        });

        // Code templates
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                this.loadTemplate(card.dataset.template);
            });
        });

        // Code generation modal
        document.getElementById('code-generation-close')?.addEventListener('click', () => {
            this.closeModal('code-generation-modal');
        });

        document.getElementById('generate-code-btn')?.addEventListener('click', () => {
            this.generateCode();
        });

        // Code editor changes
        document.getElementById('code-editor')?.addEventListener('input', (e) => {
            this.currentCode = e.target.value;
            this.highlightSyntax();
        });
    }

    initializeCodeEditor() {
        const editor = document.getElementById('code-editor');
        if (editor) {
            editor.addEventListener('keydown', (e) => {
                // Tab key support
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = editor.selectionStart;
                    const end = editor.selectionEnd;
                    editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
                    editor.selectionStart = editor.selectionEnd = start + 4;
                }
            });
        }
    }

    switchLanguage(language) {
        this.currentLanguage = language;
        this.updateEditorPlaceholder();
        this.highlightSyntax();
        this.showNotification(`Switched to ${language}`, 'success');
    }

    updateEditorPlaceholder() {
        const editor = document.getElementById('code-editor');
        const placeholders = {
            javascript: '// JavaScript code here\nconsole.log("Hello, Zeeky AI!");',
            python: '# Python code here\nprint("Hello, Zeeky AI!")',
            java: '// Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Zeeky AI!");\n    }\n}',
            cpp: '// C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, Zeeky AI!" << endl;\n    return 0;\n}',
            html: '<!-- HTML code here -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello, Zeeky AI!</title>\n</head>\n<body>\n    <h1>Hello, Zeeky AI!</h1>\n</body>\n</html>',
            css: '/* CSS code here */\nbody {\n    font-family: Arial, sans-serif;\n    background-color: #f0f0f0;\n}',
            sql: '-- SQL code here\nSELECT * FROM users WHERE active = true;',
            bash: '#!/bin/bash\n# Bash script here\necho "Hello, Zeeky AI!"'
        };

        if (editor && !this.currentCode) {
            editor.placeholder = placeholders[this.currentLanguage] || '// Start coding here...';
        }
    }

    formatCode() {
        const editor = document.getElementById('code-editor');
        if (!editor.value.trim()) return;

        this.showNotification('Formatting code...', 'info');
        
        // Simple formatting for demonstration
        let formatted = editor.value;
        
        // Basic indentation for JavaScript/similar languages
        if (['javascript', 'java', 'cpp'].includes(this.currentLanguage)) {
            formatted = this.formatBracketLanguage(formatted);
        } else if (this.currentLanguage === 'python') {
            formatted = this.formatPython(formatted);
        }

        editor.value = formatted;
        this.currentCode = formatted;
        this.showNotification('Code formatted', 'success');
    }

    formatBracketLanguage(code) {
        let formatted = '';
        let indentLevel = 0;
        const lines = code.split('\n');

        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                formatted += '\n';
                continue;
            }

            if (trimmed.includes('}')) indentLevel--;
            formatted += '    '.repeat(Math.max(0, indentLevel)) + trimmed + '\n';
            if (trimmed.includes('{')) indentLevel++;
        }

        return formatted.trim();
    }

    formatPython(code) {
        // Basic Python formatting
        let formatted = '';
        let indentLevel = 0;
        const lines = code.split('\n');

        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                formatted += '\n';
                continue;
            }

            if (trimmed.startsWith('except') || trimmed.startsWith('elif') || 
                trimmed.startsWith('else') || trimmed.startsWith('finally')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            formatted += '    '.repeat(indentLevel) + trimmed + '\n';

            if (trimmed.endsWith(':')) {
                indentLevel++;
            }
        }

        return formatted.trim();
    }

    clearCode() {
        const editor = document.getElementById('code-editor');
        editor.value = '';
        this.currentCode = '';
        this.updateEditorPlaceholder();
        this.showNotification('Code cleared', 'info');
    }

    toggleFullscreen() {
        const editorSection = document.querySelector('.code-editor-section');
        editorSection.classList.toggle('fullscreen');
        
        const icon = document.querySelector('#fullscreen-editor i');
        if (editorSection.classList.contains('fullscreen')) {
            icon.className = 'fas fa-compress';
        } else {
            icon.className = 'fas fa-expand';
        }
    }

    async runCode() {
        const code = document.getElementById('code-editor').value.trim();
        if (!code) {
            this.showNotification('No code to run', 'warning');
            return;
        }

        this.showNotification('Running code...', 'info');
        this.clearOutput();

        try {
            // Simulate code execution
            await this.executeCode(code);
        } catch (error) {
            this.displayError(error.message);
            this.showNotification('Code execution failed', 'error');
        }
    }

    async executeCode(code) {
        // Simulate code execution based on language
        await new Promise(resolve => setTimeout(resolve, 1000));

        const consoleOutput = document.getElementById('console-text');
        const resultOutput = document.getElementById('result-text');
        const errorsOutput = document.getElementById('errors-text');

        switch (this.currentLanguage) {
            case 'javascript':
                try {
                    // Simple JavaScript execution simulation
                    const result = eval(code);
                    consoleOutput.textContent = 'Code executed successfully';
                    resultOutput.textContent = result !== undefined ? String(result) : 'undefined';
                    errorsOutput.textContent = 'No errors';
                } catch (error) {
                    errorsOutput.textContent = error.message;
                    throw error;
                }
                break;
            
            default:
                consoleOutput.textContent = `${this.currentLanguage} code executed (simulated)`;
                resultOutput.textContent = 'Execution completed successfully';
                errorsOutput.textContent = 'No errors';
        }

        this.showNotification('Code executed successfully', 'success');
    }

    saveCode() {
        const code = document.getElementById('code-editor').value;
        const filename = `code.${this.getFileExtension()}`;
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification(`Code saved as ${filename}`, 'success');
    }

    shareCode() {
        const code = document.getElementById('code-editor').value;
        if (!code.trim()) {
            this.showNotification('No code to share', 'warning');
            return;
        }

        // Copy to clipboard
        navigator.clipboard.writeText(code).then(() => {
            this.showNotification('Code copied to clipboard', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy code', 'error');
        });
    }

    getFileExtension() {
        const extensions = {
            javascript: 'js',
            python: 'py',
            java: 'java',
            cpp: 'cpp',
            html: 'html',
            css: 'css',
            sql: 'sql',
            bash: 'sh'
        };
        return extensions[this.currentLanguage] || 'txt';
    }

    switchSuggestionTab(tab) {
        // Update active tab
        document.querySelectorAll('.suggestion-tab').forEach(t => {
            t.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update active panel
        document.querySelectorAll('.suggestion-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tab}-panel`).classList.add('active');
    }

    switchOutputTab(output) {
        // Update active tab
        document.querySelectorAll('.output-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-output="${output}"]`).classList.add('active');

        // Update active panel
        document.querySelectorAll('.output-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${output}-output`).classList.add('active');
    }

    handleQuickAction(action) {
        const modal = document.getElementById('code-generation-modal');
        const description = document.getElementById('code-description');
        
        const prompts = {
            'create-function': 'Create a function that...',
            'create-class': 'Create a class that...',
            'create-api': 'Create an API endpoint that...',
            'create-algorithm': 'Create an algorithm that...'
        };

        description.value = prompts[action] || '';
        modal.classList.add('active');
    }

    handleDebugAction(action) {
        const code = document.getElementById('code-editor').value;
        if (!code.trim()) {
            this.showNotification('No code to debug', 'warning');
            return;
        }

        this.showNotification(`Running ${action.replace('-', ' ')}...`, 'info');
        
        // Simulate debug action
        setTimeout(() => {
            this.showNotification(`${action.replace('-', ' ')} completed`, 'success');
        }, 1000);
    }

    handleOptimizeAction(action) {
        const code = document.getElementById('code-editor').value;
        if (!code.trim()) {
            this.showNotification('No code to optimize', 'warning');
            return;
        }

        this.showNotification(`Running ${action.replace('-', ' ')}...`, 'info');
        
        // Simulate optimization
        setTimeout(() => {
            this.showNotification(`${action.replace('-', ' ')} completed`, 'success');
        }, 1000);
    }

    handleExplainAction(action) {
        const code = document.getElementById('code-editor').value;
        if (!code.trim()) {
            this.showNotification('No code to explain', 'warning');
            return;
        }

        this.showNotification(`Generating ${action.replace('-', ' ')}...`, 'info');
        
        // Simulate explanation
        setTimeout(() => {
            this.showNotification(`${action.replace('-', ' ')} generated`, 'success');
        }, 1000);
    }

    async sendCodeQuery() {
        const input = document.getElementById('code-ai-input');
        const query = input.value.trim();
        
        if (!query) return;

        this.showNotification('Processing query...', 'info');
        input.value = '';

        try {
            // Simulate AI response
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.showNotification('Query processed successfully', 'success');
        } catch (error) {
            this.showNotification('Failed to process query', 'error');
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

    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const command = event.results[0][0].transcript;
                document.getElementById('code-ai-input').value = command;
                this.sendCodeQuery();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification('Voice recognition failed', 'error');
            };
        }
    }

    clearOutput() {
        document.getElementById('console-text').textContent = 'Ready to run your code...';
        document.getElementById('result-text').textContent = 'No results yet';
        document.getElementById('errors-text').textContent = 'No errors';
    }

    downloadOutput() {
        const activePanel = document.querySelector('.output-panel.active pre');
        const content = activePanel.textContent;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.txt';
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Output downloaded', 'success');
    }

    displayError(error) {
        document.getElementById('errors-text').textContent = error;
        this.switchOutputTab('errors');
    }

    loadTemplate(template) {
        const templates = {
            'react-component': `import React, { useState } from 'react';

const MyComponent = () => {
    const [count, setCount] = useState(0);

    return (
        <div>
            <h1>Count: {count}</h1>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
};

export default MyComponent;`,

            'express-api': `const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/users', (req, res) => {
    res.json({ users: [] });
});

app.post('/api/users', (req, res) => {
    const user = req.body;
    // Save user logic here
    res.status(201).json({ message: 'User created', user });
});

app.listen(port, () => {
    console.log(\`Server running on port \${port}\`);
});`,

            'python-class': `class MyClass:
    def __init__(self, name):
        self.name = name
        self.items = []
    
    def add_item(self, item):
        self.items.append(item)
        return self
    
    def get_items(self):
        return self.items
    
    def __str__(self):
        return f"MyClass(name={self.name}, items={len(self.items)})"

# Usage example
obj = MyClass("Example")
obj.add_item("item1").add_item("item2")
print(obj)`,

            'sql-query': `-- Complex SQL Query Example
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.total) as total_spent,
    AVG(o.total) as avg_order_value
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
    AND u.status = 'active'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 100;`,

            'algorithm': `// Binary Search Algorithm
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1; // Not found
}

// Usage example
const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15];
const result = binarySearch(sortedArray, 7);
console.log(result); // Output: 3`,

            'unit-test': `// Unit Test Example (Jest)
const { sum, multiply } = require('./math-utils');

describe('Math Utils', () => {
    test('should add two numbers correctly', () => {
        expect(sum(2, 3)).toBe(5);
        expect(sum(-1, 1)).toBe(0);
        expect(sum(0, 0)).toBe(0);
    });
    
    test('should multiply two numbers correctly', () => {
        expect(multiply(2, 3)).toBe(6);
        expect(multiply(-2, 3)).toBe(-6);
        expect(multiply(0, 5)).toBe(0);
    });
    
    test('should handle edge cases', () => {
        expect(sum(null, 5)).toBeNaN();
        expect(multiply(undefined, 3)).toBeNaN();
    });
});`
        };

        const editor = document.getElementById('code-editor');
        editor.value = templates[template] || '';
        this.currentCode = editor.value;
        this.highlightSyntax();
        this.showNotification(`${template} template loaded`, 'success');
    }

    async generateCode() {
        const description = document.getElementById('code-description').value.trim();
        const language = document.getElementById('code-language').value;
        const style = document.getElementById('code-style').value;

        if (!description) {
            this.showNotification('Please provide a description', 'warning');
            return;
        }

        this.showNotification('Generating code...', 'info');
        
        try {
            // Simulate code generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Mock generated code
            const generatedCode = `// Generated ${language} code\n// ${description}\n\n// Code will be generated here based on your description`;
            
            document.getElementById('code-editor').value = generatedCode;
            this.currentCode = generatedCode;
            this.closeModal('code-generation-modal');
            this.showNotification('Code generated successfully', 'success');
        } catch (error) {
            this.showNotification('Code generation failed', 'error');
        }
    }

    highlightSyntax() {
        // Basic syntax highlighting would go here
        // For now, we'll just update the language class
        const editor = document.getElementById('code-editor');
        editor.className = `language-${this.currentLanguage}`;
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
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

// Initialize Code Lab Manager
const codeLabManager = new CodeLabManager();
