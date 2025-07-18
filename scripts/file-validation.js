// File Validation and Cleanup Script for Zeeky AI
class FileValidationSystem {
    constructor() {
        this.validationResults = {};
        this.duplicateFiles = [];
        this.missingFiles = [];
        this.brokenLinks = [];
        this.init();
    }

    init() {
        console.log('🔍 Starting File Validation System...');
        this.runValidation();
    }

    async runValidation() {
        // Check for essential files
        await this.checkEssentialFiles();
        
        // Validate HTML files
        await this.validateHTMLFiles();
        
        // Validate JavaScript files
        await this.validateJavaScriptFiles();
        
        // Validate CSS files
        await this.validateCSSFiles();
        
        // Check for broken links
        await this.checkBrokenLinks();
        
        // Validate assets
        await this.validateAssets();
        
        // Generate validation report
        this.generateValidationReport();
    }

    async checkEssentialFiles() {
        console.log('📋 Checking essential files...');
        
        const essentialFiles = [
            // Core HTML files
            'index.html',
            'testing-dashboard.html',
            'smart-home.html',
            'car-mode.html',
            'edge-functions-demo.html',
            
            // Core JavaScript files
            'scripts/main.js',
            'scripts/universal-settings.js',
            'scripts/universal-navigation.js',
            'scripts/error-handler.js',
            'scripts/loading-manager.js',
            
            // Extension files
            'scripts/extensions/ai-personalities.js',
            'scripts/extensions/code-laboratory.js',
            'scripts/extensions/vision-ai.js',
            'scripts/extensions/analytics.js',
            
            // Configuration files
            'config/environment.js',
            'netlify.toml',
            'package.json',
            'manifest.json',
            
            // Assets
            'assets/zeeky-logo.svg',
            'assets/zeeky-logo-new.svg',
            
            // Styles
            'styles/modern-ui.css',
            'styles/futuristic-dashboard.css'
        ];

        for (const file of essentialFiles) {
            try {
                const response = await fetch(file, { method: 'HEAD' });
                if (response.ok) {
                    this.validationResults[file] = { status: 'EXISTS', details: 'File found' };
                } else {
                    this.validationResults[file] = { status: 'MISSING', details: `HTTP ${response.status}` };
                    this.missingFiles.push(file);
                }
            } catch (error) {
                this.validationResults[file] = { status: 'ERROR', details: error.message };
                this.missingFiles.push(file);
            }
        }
    }

    async validateHTMLFiles() {
        console.log('🌐 Validating HTML files...');
        
        const htmlFiles = [
            'index.html',
            'testing-dashboard.html',
            'smart-home.html',
            'car-mode.html',
            'edge-functions-demo.html',
            'features/code-lab.html',
            '404.html',
            '500.html'
        ];

        for (const file of htmlFiles) {
            await this.validateHTMLFile(file);
        }
    }

    async validateHTMLFile(filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                this.validationResults[`${filename}_html`] = { 
                    status: 'MISSING', 
                    details: `File not found: ${response.status}` 
                };
                return;
            }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Check for parsing errors
            const parserErrors = doc.querySelectorAll('parsererror');
            if (parserErrors.length > 0) {
                this.validationResults[`${filename}_html`] = { 
                    status: 'INVALID', 
                    details: 'HTML parsing errors found' 
                };
                return;
            }

            // Check for essential elements
            const essentialElements = {
                title: doc.querySelector('title'),
                viewport: doc.querySelector('meta[name="viewport"]'),
                charset: doc.querySelector('meta[charset]'),
                body: doc.querySelector('body')
            };

            const missingElements = Object.entries(essentialElements)
                .filter(([key, element]) => !element)
                .map(([key]) => key);

            if (missingElements.length > 0) {
                this.validationResults[`${filename}_html`] = { 
                    status: 'INCOMPLETE', 
                    details: `Missing elements: ${missingElements.join(', ')}` 
                };
            } else {
                this.validationResults[`${filename}_html`] = { 
                    status: 'VALID', 
                    details: 'HTML structure is valid' 
                };
            }

        } catch (error) {
            this.validationResults[`${filename}_html`] = { 
                status: 'ERROR', 
                details: error.message 
            };
        }
    }

    async validateJavaScriptFiles() {
        console.log('⚙️ Validating JavaScript files...');
        
        const jsFiles = [
            'scripts/main.js',
            'scripts/universal-settings.js',
            'scripts/universal-navigation.js',
            'scripts/error-handler.js',
            'scripts/extensions/ai-personalities.js',
            'scripts/extensions/code-laboratory.js',
            'scripts/extensions/vision-ai.js',
            'scripts/comprehensive-feature-test.js',
            'config/environment.js'
        ];

        for (const file of jsFiles) {
            await this.validateJavaScriptFile(file);
        }
    }

    async validateJavaScriptFile(filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                this.validationResults[`${filename}_js`] = { 
                    status: 'MISSING', 
                    details: `File not found: ${response.status}` 
                };
                return;
            }

            const jsCode = await response.text();
            
            // Basic syntax validation
            try {
                new Function(jsCode);
                this.validationResults[`${filename}_js`] = { 
                    status: 'VALID', 
                    details: 'JavaScript syntax is valid' 
                };
            } catch (syntaxError) {
                this.validationResults[`${filename}_js`] = { 
                    status: 'SYNTAX_ERROR', 
                    details: syntaxError.message 
                };
            }

        } catch (error) {
            this.validationResults[`${filename}_js`] = { 
                status: 'ERROR', 
                details: error.message 
            };
        }
    }

    async validateCSSFiles() {
        console.log('🎨 Validating CSS files...');
        
        const cssFiles = [
            'styles/modern-ui.css',
            'styles/futuristic-dashboard.css'
        ];

        for (const file of cssFiles) {
            await this.validateCSSFile(file);
        }
    }

    async validateCSSFile(filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                this.validationResults[`${filename}_css`] = { 
                    status: 'MISSING', 
                    details: `File not found: ${response.status}` 
                };
                return;
            }

            const cssCode = await response.text();
            
            // Basic CSS validation (check for obvious syntax errors)
            const braceCount = (cssCode.match(/\{/g) || []).length - (cssCode.match(/\}/g) || []).length;
            
            if (braceCount !== 0) {
                this.validationResults[`${filename}_css`] = { 
                    status: 'SYNTAX_ERROR', 
                    details: 'Mismatched braces in CSS' 
                };
            } else {
                this.validationResults[`${filename}_css`] = { 
                    status: 'VALID', 
                    details: 'CSS syntax appears valid' 
                };
            }

        } catch (error) {
            this.validationResults[`${filename}_css`] = { 
                status: 'ERROR', 
                details: error.message 
            };
        }
    }

    async checkBrokenLinks() {
        console.log('🔗 Checking for broken links...');
        
        // Get all links from the current page
        const links = document.querySelectorAll('a[href], link[href], script[src], img[src]');
        
        for (const link of links) {
            const url = link.href || link.src;
            if (url && !url.startsWith('http') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
                await this.checkLink(url);
            }
        }
    }

    async checkLink(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) {
                this.brokenLinks.push({ url, status: response.status });
                this.validationResults[`link_${url}`] = { 
                    status: 'BROKEN', 
                    details: `HTTP ${response.status}` 
                };
            } else {
                this.validationResults[`link_${url}`] = { 
                    status: 'VALID', 
                    details: 'Link is accessible' 
                };
            }
        } catch (error) {
            this.brokenLinks.push({ url, error: error.message });
            this.validationResults[`link_${url}`] = { 
                status: 'ERROR', 
                details: error.message 
            };
        }
    }

    async validateAssets() {
        console.log('🖼️ Validating assets...');
        
        const assets = [
            'assets/zeeky-logo.svg',
            'assets/zeeky-logo-new.svg'
        ];

        for (const asset of assets) {
            await this.validateAsset(asset);
        }
    }

    async validateAsset(filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                this.validationResults[`asset_${filename}`] = { 
                    status: 'MISSING', 
                    details: `Asset not found: ${response.status}` 
                };
                return;
            }

            const contentType = response.headers.get('content-type');
            const fileSize = response.headers.get('content-length');
            
            this.validationResults[`asset_${filename}`] = { 
                status: 'VALID', 
                details: `Asset found (${contentType}, ${fileSize} bytes)` 
            };

        } catch (error) {
            this.validationResults[`asset_${filename}`] = { 
                status: 'ERROR', 
                details: error.message 
            };
        }
    }

    generateValidationReport() {
        const totalChecks = Object.keys(this.validationResults).length;
        const validFiles = Object.values(this.validationResults).filter(r => r.status === 'VALID' || r.status === 'EXISTS').length;
        const errorFiles = Object.values(this.validationResults).filter(r => r.status === 'ERROR' || r.status === 'MISSING' || r.status === 'BROKEN').length;
        
        const validationScore = ((validFiles / totalChecks) * 100).toFixed(1);
        
        console.log('\n🔍 FILE VALIDATION REPORT');
        console.log('==========================');
        console.log(`📊 Total Checks: ${totalChecks}`);
        console.log(`✅ Valid Files: ${validFiles}`);
        console.log(`❌ Issues Found: ${errorFiles}`);
        console.log(`📈 Validation Score: ${validationScore}%`);
        console.log('==========================\n');
        
        // Log detailed results
        Object.entries(this.validationResults).forEach(([filename, result]) => {
            const icon = result.status === 'VALID' || result.status === 'EXISTS' ? '✅' : 
                        result.status === 'MISSING' || result.status === 'BROKEN' ? '❌' : '⚠️';
            console.log(`${icon} ${filename}: ${result.status} - ${result.details}`);
        });
        
        // Show broken links
        if (this.brokenLinks.length > 0) {
            console.log('\n🔗 BROKEN LINKS FOUND:');
            this.brokenLinks.forEach(link => {
                console.log(`❌ ${link.url}: ${link.status || link.error}`);
            });
        }
        
        // Show missing files
        if (this.missingFiles.length > 0) {
            console.log('\n📁 MISSING FILES:');
            this.missingFiles.forEach(file => {
                console.log(`❌ ${file}`);
            });
        }
        
        // Create visual report
        this.createVisualValidationReport(validationScore);
    }

    createVisualValidationReport(validationScore) {
        const reportContainer = document.createElement('div');
        reportContainer.id = 'validation-report';
        reportContainer.innerHTML = `
            <div style="position: fixed; top: 20px; left: 20px; background: rgba(0,0,0,0.9); color: white; padding: 20px; border-radius: 10px; z-index: 10000; max-width: 400px;">
                <h3>🔍 File Validation Report</h3>
                <div style="margin: 10px 0;">
                    <div>Total Checks: ${Object.keys(this.validationResults).length}</div>
                    <div style="color: #4ade80;">Valid Files: ${Object.values(this.validationResults).filter(r => r.status === 'VALID' || r.status === 'EXISTS').length}</div>
                    <div style="color: #f87171;">Issues: ${Object.values(this.validationResults).filter(r => r.status === 'ERROR' || r.status === 'MISSING').length}</div>
                    <div>Validation Score: ${validationScore}%</div>
                </div>
                <div style="background: #333; height: 20px; border-radius: 10px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #4ade80, #22c55e); height: 100%; width: ${validationScore}%; transition: width 0.5s ease;"></div>
                </div>
                ${this.missingFiles.length > 0 ? `
                    <div style="margin-top: 10px; color: #f87171;">
                        <strong>Missing Files:</strong><br>
                        ${this.missingFiles.slice(0, 3).map(f => `• ${f}`).join('<br>')}
                        ${this.missingFiles.length > 3 ? `<br>... and ${this.missingFiles.length - 3} more` : ''}
                    </div>
                ` : ''}
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
        `;
        
        document.body.appendChild(reportContainer);
        
        // Auto-remove after 45 seconds
        setTimeout(() => {
            if (reportContainer.parentElement) {
                reportContainer.remove();
            }
        }, 45000);
    }
}

// Auto-run validation when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for page to fully load
    setTimeout(() => {
        window.fileValidationSystem = new FileValidationSystem();
    }, 2000);
});

// Export for manual testing
window.runFileValidation = () => {
    new FileValidationSystem();
};
