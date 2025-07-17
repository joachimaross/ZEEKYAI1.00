#!/usr/bin/env node

/**
 * Zeeky AI Security Check Script
 * Performs security analysis and vulnerability checks
 */

const fs = require('fs');
const path = require('path');

class SecurityChecker {
    constructor() {
        this.frontendDir = path.join(__dirname, '..', 'frontend');
        this.vulnerabilities = [];
        this.securityScore = 0;
    }

    async check() {
        console.log('🔒 Starting Zeeky AI security check...');
        
        try {
            await this.checkContentSecurityPolicy();
            await this.checkHTTPSUsage();
            await this.checkSensitiveDataExposure();
            await this.checkXSSVulnerabilities();
            await this.checkDependencyVulnerabilities();
            
            this.generateSecurityReport();
            console.log('✅ Security check completed!');
        } catch (error) {
            console.error('❌ Security check failed:', error);
            process.exit(1);
        }
    }

    async checkContentSecurityPolicy() {
        console.log('🛡️ Checking Content Security Policy...');
        
        const netlifyConfig = path.join(__dirname, '..', 'netlify.toml');
        if (fs.existsSync(netlifyConfig)) {
            const content = fs.readFileSync(netlifyConfig, 'utf8');
            if (content.includes('Content-Security-Policy')) {
                this.addSecurityPoint(20, 'CSP configured in Netlify');
            } else {
                this.addVulnerability('medium', 'Content Security Policy not configured');
            }
        }
        
        // Check for CSP in HTML files
        const htmlFiles = this.getFilesByExtension('.html');
        let cspFound = false;
        
        htmlFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('Content-Security-Policy')) {
                cspFound = true;
            }
        });
        
        if (cspFound) {
            this.addSecurityPoint(15, 'CSP found in HTML files');
        }
    }

    async checkHTTPSUsage() {
        console.log('🔐 Checking HTTPS usage...');
        
        const jsFiles = this.getFilesByExtension('.js');
        let httpFound = false;
        
        jsFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const httpMatches = content.match(/http:\/\/(?!localhost|127\.0\.0\.1)/g);
            if (httpMatches) {
                httpFound = true;
                this.addVulnerability('medium', `HTTP URLs found in ${path.basename(file)}`);
            }
        });
        
        if (!httpFound) {
            this.addSecurityPoint(15, 'No insecure HTTP URLs found');
        }
    }

    async checkSensitiveDataExposure() {
        console.log('🔍 Checking for sensitive data exposure...');
        
        const allFiles = this.getAllFiles();
        const sensitivePatterns = [
            /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
            /secret[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
            /password\s*[:=]\s*['"][^'"]+['"]/gi,
            /token\s*[:=]\s*['"][^'"]+['"]/gi
        ];
        
        let exposureFound = false;
        
        allFiles.forEach(file => {
            if (file.includes('node_modules') || file.includes('.git')) return;
            
            try {
                const content = fs.readFileSync(file, 'utf8');
                sensitivePatterns.forEach(pattern => {
                    if (pattern.test(content)) {
                        exposureFound = true;
                        this.addVulnerability('high', `Potential sensitive data in ${path.basename(file)}`);
                    }
                });
            } catch (e) {
                // Skip binary files
            }
        });
        
        if (!exposureFound) {
            this.addSecurityPoint(25, 'No sensitive data exposure detected');
        }
    }

    async checkXSSVulnerabilities() {
        console.log('⚠️ Checking for XSS vulnerabilities...');
        
        const jsFiles = this.getFilesByExtension('.js');
        const xssPatterns = [
            /innerHTML\s*=\s*[^;]+/g,
            /document\.write\s*\(/g,
            /eval\s*\(/g,
            /setTimeout\s*\(\s*['"][^'"]*['"],/g
        ];
        
        let xssFound = false;
        
        jsFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            xssPatterns.forEach((pattern, index) => {
                if (pattern.test(content)) {
                    xssFound = true;
                    const riskTypes = ['innerHTML usage', 'document.write usage', 'eval usage', 'setTimeout with string'];
                    this.addVulnerability('medium', `Potential XSS risk: ${riskTypes[index]} in ${path.basename(file)}`);
                }
            });
        });
        
        if (!xssFound) {
            this.addSecurityPoint(20, 'No obvious XSS vulnerabilities found');
        }
    }

    async checkDependencyVulnerabilities() {
        console.log('📦 Checking dependency vulnerabilities...');
        
        const packageJson = path.join(__dirname, '..', 'package.json');
        if (fs.existsSync(packageJson)) {
            const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
            const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
            
            // Check for known vulnerable packages (simplified check)
            const knownVulnerable = ['lodash', 'moment', 'request'];
            let vulnerableFound = false;
            
            Object.keys(dependencies).forEach(dep => {
                if (knownVulnerable.includes(dep)) {
                    vulnerableFound = true;
                    this.addVulnerability('low', `Potentially vulnerable dependency: ${dep}`);
                }
            });
            
            if (!vulnerableFound) {
                this.addSecurityPoint(20, 'No known vulnerable dependencies detected');
            }
        }
    }

    addVulnerability(severity, description) {
        this.vulnerabilities.push({ severity, description, timestamp: new Date().toISOString() });
    }

    addSecurityPoint(points, reason) {
        this.securityScore += points;
        console.log(`✅ +${points} points: ${reason}`);
    }

    generateSecurityReport() {
        const maxScore = 100;
        const finalScore = Math.min(this.securityScore, maxScore);
        
        const report = {
            timestamp: new Date().toISOString(),
            securityScore: finalScore,
            maxScore: maxScore,
            grade: this.getSecurityGrade(finalScore),
            vulnerabilities: this.vulnerabilities,
            recommendations: this.generateRecommendations(),
            summary: {
                critical: this.vulnerabilities.filter(v => v.severity === 'critical').length,
                high: this.vulnerabilities.filter(v => v.severity === 'high').length,
                medium: this.vulnerabilities.filter(v => v.severity === 'medium').length,
                low: this.vulnerabilities.filter(v => v.severity === 'low').length
            }
        };
        
        // Write security report
        const reportsDir = path.join(__dirname, '..', 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        fs.writeFileSync(
            path.join(reportsDir, 'security-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        // Console output
        console.log('\n🔒 Security Analysis Report:');
        console.log(`   Security Score: ${finalScore}/${maxScore} (Grade: ${report.grade})`);
        console.log(`   Vulnerabilities Found: ${this.vulnerabilities.length}`);
        console.log(`     Critical: ${report.summary.critical}`);
        console.log(`     High: ${report.summary.high}`);
        console.log(`     Medium: ${report.summary.medium}`);
        console.log(`     Low: ${report.summary.low}`);
        
        if (report.recommendations.length > 0) {
            console.log('\n🛡️ Security Recommendations:');
            report.recommendations.forEach(rec => console.log(`   • ${rec}`));
        }
        
        console.log(`\n📄 Detailed report saved: ${path.join(reportsDir, 'security-report.json')}`);
    }

    getSecurityGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.vulnerabilities.some(v => v.description.includes('CSP'))) {
            recommendations.push('Implement Content Security Policy headers');
        }
        
        if (this.vulnerabilities.some(v => v.description.includes('HTTP'))) {
            recommendations.push('Replace all HTTP URLs with HTTPS');
        }
        
        if (this.vulnerabilities.some(v => v.description.includes('sensitive data'))) {
            recommendations.push('Remove sensitive data from source code and use environment variables');
        }
        
        if (this.vulnerabilities.some(v => v.description.includes('XSS'))) {
            recommendations.push('Sanitize user inputs and avoid innerHTML with user data');
        }
        
        if (this.vulnerabilities.some(v => v.description.includes('dependency'))) {
            recommendations.push('Update vulnerable dependencies to latest secure versions');
        }
        
        return recommendations;
    }

    getFilesByExtension(extension) {
        return this.getAllFiles().filter(file => path.extname(file) === extension);
    }

    getAllFiles() {
        const files = [];
        
        function traverse(currentDir) {
            try {
                const items = fs.readdirSync(currentDir);
                
                for (const item of items) {
                    const fullPath = path.join(currentDir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
                        traverse(fullPath);
                    } else if (stat.isFile()) {
                        files.push(fullPath);
                    }
                }
            } catch (e) {
                // Skip inaccessible directories
            }
        }
        
        traverse(this.frontendDir);
        return files;
    }
}

// Run security check if called directly
if (require.main === module) {
    const checker = new SecurityChecker();
    checker.check();
}

module.exports = SecurityChecker;
