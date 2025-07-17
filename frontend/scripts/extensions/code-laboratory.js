// Code Laboratory Extension for Zeeky AI
class CodeLaboratory {
    constructor() {
        this.supportedLanguages = {
            javascript: {
                name: 'JavaScript',
                extension: 'js',
                runner: 'browser',
                template: '// JavaScript Code\nconsole.log("Hello, World!");'
            },
            python: {
                name: 'Python',
                extension: 'py',
                runner: 'pyodide',
                template: '# Python Code\nprint("Hello, World!")'
            },
            html: {
                name: 'HTML',
                extension: 'html',
                runner: 'browser',
                template: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>'
            },
            css: {
                name: 'CSS',
                extension: 'css',
                runner: 'browser',
                template: '/* CSS Code */\nbody {\n    font-family: Arial, sans-serif;\n    background-color: #f0f0f0;\n    text-align: center;\n    padding: 50px;\n}\n\nh1 {\n    color: #333;\n    font-size: 2em;\n}'
            },
            sql: {
                name: 'SQL',
                extension: 'sql',
                runner: 'sql-js',
                template: '-- SQL Code\nSELECT "Hello, World!" as greeting;'
            },
            json: {
                name: 'JSON',
                extension: 'json',
                runner: 'validator',
                template: '{\n  "message": "Hello, World!",\n  "timestamp": "2024-01-01T00:00:00Z",\n  "data": {\n    "items": [1, 2, 3],\n    "active": true\n  }\n}'
            }
        };
        
        this.currentLanguage = 'javascript';
        this.executionHistory = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPyodide();
        this.loadSQLJS();
    }

    setupEventListeners() {
        // Code lab modal
        const codeLabBtn = document.getElementById('code-lab-btn');
        codeLabBtn?.addEventListener('click', () => this.openCodeLab());

        // Language selection
        const languageSelect = document.getElementById('code-language');
        languageSelect?.addEventListener('change', (e) => this.switchLanguage(e.target.value));

        // Code execution
        const runCodeBtn = document.getElementById('run-code');
        runCodeBtn?.addEventListener('click', () => this.runCode());

        // Code formatting
        const formatCodeBtn = document.getElementById('format-code');
        formatCodeBtn?.addEventListener('click', () => this.formatCode());

        // Code analysis
        const analyzeCodeBtn = document.getElementById('analyze-code');
        analyzeCodeBtn?.addEventListener('click', () => this.analyzeCode());

        // Code editor
        const codeEditor = document.getElementById('code-editor');
        codeEditor?.addEventListener('input', () => this.onCodeChange());
    }

    async loadPyodide() {
        try {
            // Load Pyodide for Python execution
            if (typeof loadPyodide !== 'undefined') {
                this.pyodide = await loadPyodide();
                console.log('Pyodide loaded successfully');
            }
        } catch (error) {
            console.warn('Pyodide not available:', error);
        }
    }

    async loadSQLJS() {
        try {
            // Load SQL.js for SQL execution
            if (typeof initSqlJs !== 'undefined') {
                this.sqlJs = await initSqlJs();
                this.db = new this.sqlJs.Database();
                console.log('SQL.js loaded successfully');
            }
        } catch (error) {
            console.warn('SQL.js not available:', error);
        }
    }

    openCodeLab() {
        const modal = document.getElementById('code-lab-modal');
        if (modal) {
            modal.classList.add('active');
            this.loadTemplate();
        }
    }

    switchLanguage(language) {
        this.currentLanguage = language;
        this.loadTemplate();
    }

    loadTemplate() {
        const codeEditor = document.getElementById('code-editor');
        const languageData = this.supportedLanguages[this.currentLanguage];
        
        if (codeEditor && languageData) {
            codeEditor.value = languageData.template;
            this.clearOutput();
        }
    }

    async runCode() {
        const codeEditor = document.getElementById('code-editor');
        const code = codeEditor.value.trim();
        
        if (!code) {
            this.showOutput('No code to execute', 'error');
            return;
        }

        this.showOutput('Executing...', 'info');
        
        try {
            const result = await this.executeCode(code, this.currentLanguage);
            this.showOutput(result, 'success');
            
            // Add to execution history
            this.addToHistory(code, this.currentLanguage, result);
            
            // Track code execution
            if (window.analyticsManager) {
                window.analyticsManager.trackUserAction('code_executed', this.currentLanguage);
            }
            
        } catch (error) {
            this.showOutput(`Error: ${error.message}`, 'error');
            
            // Track execution error
            if (window.analyticsManager) {
                window.analyticsManager.trackError('code_execution_error', error.message);
            }
        }
    }

    async executeCode(code, language) {
        const languageData = this.supportedLanguages[language];
        
        switch (languageData.runner) {
            case 'browser':
                return await this.executeBrowserCode(code, language);
            case 'pyodide':
                return await this.executePythonCode(code);
            case 'sql-js':
                return await this.executeSQLCode(code);
            case 'validator':
                return this.validateCode(code, language);
            default:
                throw new Error(`Execution not supported for ${language}`);
        }
    }

    async executeBrowserCode(code, language) {
        switch (language) {
            case 'javascript':
                return this.executeJavaScript(code);
            case 'html':
                return this.executeHTML(code);
            case 'css':
                return this.executeCSS(code);
            default:
                throw new Error(`Browser execution not supported for ${language}`);
        }
    }

    executeJavaScript(code) {
        // Capture console output
        const originalLog = console.log;
        const originalError = console.error;
        const output = [];
        
        console.log = (...args) => {
            output.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
        };
        
        console.error = (...args) => {
            output.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
        };

        try {
            // Execute the code
            const result = eval(code);
            
            // Restore console
            console.log = originalLog;
            console.error = originalError;
            
            // Return output or result
            if (output.length > 0) {
                return output.join('\n');
            } else if (result !== undefined) {
                return typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
            } else {
                return 'Code executed successfully (no output)';
            }
            
        } catch (error) {
            console.log = originalLog;
            console.error = originalError;
            throw error;
        }
    }

    executeHTML(code) {
        // Create a preview iframe
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '300px';
        iframe.style.border = '1px solid var(--border-color)';
        iframe.style.borderRadius = 'var(--border-radius)';
        
        // Write HTML to iframe
        iframe.onload = () => {
            iframe.contentDocument.open();
            iframe.contentDocument.write(code);
            iframe.contentDocument.close();
        };
        
        // Clear output and add iframe
        const outputContainer = document.getElementById('code-output');
        outputContainer.innerHTML = '';
        outputContainer.appendChild(iframe);
        
        return 'HTML rendered in preview';
    }

    executeCSS(code) {
        // Create a demo HTML with the CSS
        const demoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${code}</style>
            </head>
            <body>
                <h1>CSS Preview</h1>
                <p>This is a paragraph to demonstrate your CSS styles.</p>
                <div class="demo-box">Demo Box</div>
                <button>Demo Button</button>
            </body>
            </html>
        `;
        
        return this.executeHTML(demoHTML);
    }

    async executePythonCode(code) {
        if (!this.pyodide) {
            throw new Error('Python execution not available (Pyodide not loaded)');
        }

        try {
            // Capture Python output
            this.pyodide.runPython(`
                import sys
                from io import StringIO
                sys.stdout = StringIO()
                sys.stderr = StringIO()
            `);

            // Execute the code
            this.pyodide.runPython(code);

            // Get output
            const stdout = this.pyodide.runPython('sys.stdout.getvalue()');
            const stderr = this.pyodide.runPython('sys.stderr.getvalue()');

            if (stderr) {
                throw new Error(stderr);
            }

            return stdout || 'Code executed successfully (no output)';

        } catch (error) {
            throw new Error(`Python execution error: ${error.message}`);
        }
    }

    async executeSQLCode(code) {
        if (!this.sqlJs || !this.db) {
            throw new Error('SQL execution not available (SQL.js not loaded)');
        }

        try {
            const results = this.db.exec(code);
            
            if (results.length === 0) {
                return 'Query executed successfully (no results)';
            }

            // Format results as table
            let output = '';
            results.forEach(result => {
                if (result.columns && result.values) {
                    output += `Columns: ${result.columns.join(', ')}\n`;
                    output += 'Results:\n';
                    result.values.forEach(row => {
                        output += `  ${row.join(' | ')}\n`;
                    });
                }
            });

            return output || 'Query executed successfully';

        } catch (error) {
            throw new Error(`SQL execution error: ${error.message}`);
        }
    }

    validateCode(code, language) {
        switch (language) {
            case 'json':
                return this.validateJSON(code);
            default:
                return 'Validation not implemented for this language';
        }
    }

    validateJSON(code) {
        try {
            const parsed = JSON.parse(code);
            return `Valid JSON!\n\nParsed structure:\n${JSON.stringify(parsed, null, 2)}`;
        } catch (error) {
            throw new Error(`Invalid JSON: ${error.message}`);
        }
    }

    formatCode() {
        const codeEditor = document.getElementById('code-editor');
        const code = codeEditor.value;
        
        try {
            let formatted;
            
            switch (this.currentLanguage) {
                case 'json':
                    const parsed = JSON.parse(code);
                    formatted = JSON.stringify(parsed, null, 2);
                    break;
                case 'javascript':
                    // Basic JavaScript formatting
                    formatted = this.formatJavaScript(code);
                    break;
                default:
                    formatted = code; // No formatting available
                    this.showNotification('Formatting not available for this language', 'warning');
                    return;
            }
            
            codeEditor.value = formatted;
            this.showNotification('Code formatted successfully!', 'success');
            
        } catch (error) {
            this.showNotification(`Formatting error: ${error.message}`, 'error');
        }
    }

    formatJavaScript(code) {
        // Basic JavaScript formatting (simplified)
        return code
            .replace(/;/g, ';\n')
            .replace(/{/g, '{\n')
            .replace(/}/g, '\n}')
            .replace(/,/g, ',\n')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
    }

    analyzeCode() {
        const codeEditor = document.getElementById('code-editor');
        const code = codeEditor.value.trim();
        
        if (!code) {
            this.showOutput('No code to analyze', 'warning');
            return;
        }

        const analysis = this.performCodeAnalysis(code, this.currentLanguage);
        this.showOutput(analysis, 'info');
    }

    performCodeAnalysis(code, language) {
        const lines = code.split('\n').length;
        const characters = code.length;
        const words = code.split(/\s+/).length;
        
        let analysis = `Code Analysis for ${this.supportedLanguages[language].name}:\n\n`;
        analysis += `📊 Statistics:\n`;
        analysis += `  • Lines: ${lines}\n`;
        analysis += `  • Characters: ${characters}\n`;
        analysis += `  • Words: ${words}\n\n`;

        // Language-specific analysis
        switch (language) {
            case 'javascript':
                analysis += this.analyzeJavaScript(code);
                break;
            case 'python':
                analysis += this.analyzePython(code);
                break;
            case 'json':
                analysis += this.analyzeJSON(code);
                break;
            default:
                analysis += '🔍 Language-specific analysis not available';
        }

        return analysis;
    }

    analyzeJavaScript(code) {
        const functions = (code.match(/function\s+\w+/g) || []).length;
        const variables = (code.match(/(?:var|let|const)\s+\w+/g) || []).length;
        const comments = (code.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || []).length;
        
        return `🔍 JavaScript Analysis:\n` +
               `  • Functions: ${functions}\n` +
               `  • Variables: ${variables}\n` +
               `  • Comments: ${comments}\n`;
    }

    analyzePython(code) {
        const functions = (code.match(/def\s+\w+/g) || []).length;
        const classes = (code.match(/class\s+\w+/g) || []).length;
        const imports = (code.match(/(?:import|from)\s+\w+/g) || []).length;
        
        return `🔍 Python Analysis:\n` +
               `  • Functions: ${functions}\n` +
               `  • Classes: ${classes}\n` +
               `  • Imports: ${imports}\n`;
    }

    analyzeJSON(code) {
        try {
            const parsed = JSON.parse(code);
            const keys = Object.keys(parsed).length;
            const type = Array.isArray(parsed) ? 'Array' : 'Object';
            
            return `🔍 JSON Analysis:\n` +
                   `  • Type: ${type}\n` +
                   `  • Keys/Items: ${keys}\n` +
                   `  • Valid: ✅\n`;
        } catch (error) {
            return `🔍 JSON Analysis:\n  • Valid: ❌\n  • Error: ${error.message}`;
        }
    }

    showOutput(content, type = 'info') {
        const outputContainer = document.getElementById('code-output');
        if (!outputContainer) return;

        const typeIcons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        outputContainer.innerHTML = `
            <div class="output-content ${type}">
                <div class="output-header">
                    ${typeIcons[type] || 'ℹ️'} Output
                </div>
                <pre>${this.escapeHtml(content)}</pre>
            </div>
        `;
    }

    clearOutput() {
        const outputContainer = document.getElementById('code-output');
        if (outputContainer) {
            outputContainer.innerHTML = `
                <div class="output-placeholder">
                    <i class="fas fa-terminal"></i>
                    <p>Run your code to see output here</p>
                </div>
            `;
        }
    }

    onCodeChange() {
        // Auto-save code changes
        const code = document.getElementById('code-editor').value;
        localStorage.setItem(`zeeky_code_${this.currentLanguage}`, code);
    }

    addToHistory(code, language, result) {
        const historyItem = {
            timestamp: Date.now(),
            language: language,
            code: code,
            result: result
        };
        
        this.executionHistory.unshift(historyItem);
        
        // Keep only last 50 executions
        if (this.executionHistory.length > 50) {
            this.executionHistory = this.executionHistory.slice(0, 50);
        }
        
        localStorage.setItem('zeeky_code_history', JSON.stringify(this.executionHistory));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type) {
        if (window.ZeekyUtils) {
            window.ZeekyUtils.showNotification(message, type);
        }
    }

    // Public API
    getSupportedLanguages() {
        return Object.keys(this.supportedLanguages);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getExecutionHistory() {
        return this.executionHistory;
    }
}

// Initialize code laboratory when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.codeLaboratory = new CodeLaboratory();
});
