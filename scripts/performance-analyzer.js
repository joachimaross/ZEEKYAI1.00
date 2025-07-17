#!/usr/bin/env node

/**
 * Zeeky AI Performance Analyzer
 * Analyzes and reports on application performance metrics
 */

const fs = require('fs');
const path = require('path');

class PerformanceAnalyzer {
    constructor() {
        this.frontendDir = path.join(__dirname, '..', 'frontend');
        this.metrics = {
            bundleSize: 0,
            fileCount: 0,
            imageOptimization: 0,
            cacheability: 0,
            loadTime: 0
        };
    }

    async analyze() {
        console.log('📊 Starting Zeeky AI performance analysis...');
        
        try {
            await this.analyzeBundleSize();
            await this.analyzeImageOptimization();
            await this.analyzeCacheability();
            await this.analyzeLoadTime();
            
            this.generatePerformanceReport();
            console.log('✅ Performance analysis completed!');
        } catch (error) {
            console.error('❌ Performance analysis failed:', error);
            process.exit(1);
        }
    }

    async analyzeBundleSize() {
        console.log('📦 Analyzing bundle size...');
        
        const files = this.getAllFiles(this.frontendDir);
        let totalSize = 0;
        let jsSize = 0;
        let cssSize = 0;
        let imageSize = 0;
        
        files.forEach(file => {
            const stat = fs.statSync(file);
            const ext = path.extname(file).toLowerCase();
            
            totalSize += stat.size;
            this.metrics.fileCount++;
            
            if (ext === '.js') jsSize += stat.size;
            else if (ext === '.css') cssSize += stat.size;
            else if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) imageSize += stat.size;
        });
        
        this.metrics.bundleSize = {
            total: totalSize,
            javascript: jsSize,
            css: cssSize,
            images: imageSize,
            other: totalSize - jsSize - cssSize - imageSize
        };
    }

    async analyzeImageOptimization() {
        console.log('🖼️ Analyzing image optimization...');
        
        const imageFiles = this.getAllFiles(this.frontendDir).filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext);
        });
        
        let optimizedCount = 0;
        let totalImages = imageFiles.length;
        
        imageFiles.forEach(file => {
            const stat = fs.statSync(file);
            const ext = path.extname(file).toLowerCase();
            
            // Simple heuristic: consider images under certain sizes as optimized
            if (ext === '.svg' || stat.size < 100000) { // 100KB threshold
                optimizedCount++;
            }
        });
        
        this.metrics.imageOptimization = totalImages > 0 ? (optimizedCount / totalImages) * 100 : 100;
    }

    async analyzeCacheability() {
        console.log('💾 Analyzing cacheability...');
        
        const staticFiles = this.getAllFiles(this.frontendDir).filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2'].includes(ext);
        });
        
        // All static files are cacheable in our setup
        this.metrics.cacheability = staticFiles.length > 0 ? 100 : 0;
    }

    async analyzeLoadTime() {
        console.log('⚡ Estimating load time...');
        
        const totalSize = this.metrics.bundleSize.total;
        const criticalSize = this.metrics.bundleSize.javascript + this.metrics.bundleSize.css;
        
        // Estimate load time based on file sizes (rough calculation)
        // Assuming 3G connection (1.6 Mbps)
        const connectionSpeed = 1600000 / 8; // bytes per second
        const estimatedLoadTime = (criticalSize / connectionSpeed) * 1000; // milliseconds
        
        this.metrics.loadTime = Math.round(estimatedLoadTime);
    }

    generatePerformanceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: {
                bundleSize: {
                    total: this.formatBytes(this.metrics.bundleSize.total),
                    javascript: this.formatBytes(this.metrics.bundleSize.javascript),
                    css: this.formatBytes(this.metrics.bundleSize.css),
                    images: this.formatBytes(this.metrics.bundleSize.images),
                    other: this.formatBytes(this.metrics.bundleSize.other)
                },
                fileCount: this.metrics.fileCount,
                imageOptimization: `${this.metrics.imageOptimization.toFixed(1)}%`,
                cacheability: `${this.metrics.cacheability}%`,
                estimatedLoadTime: `${this.metrics.loadTime}ms`
            },
            scores: {
                bundleSize: this.scoreBundleSize(),
                imageOptimization: this.scoreImageOptimization(),
                cacheability: this.scoreCacheability(),
                loadTime: this.scoreLoadTime()
            },
            recommendations: this.generateRecommendations()
        };
        
        // Write performance report
        const reportsDir = path.join(__dirname, '..', 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        fs.writeFileSync(
            path.join(reportsDir, 'performance-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        // Console output
        console.log('\n📊 Performance Analysis Report:');
        console.log(`   Bundle Size: ${report.metrics.bundleSize.total} (Score: ${report.scores.bundleSize}/100)`);
        console.log(`   Image Optimization: ${report.metrics.imageOptimization} (Score: ${report.scores.imageOptimization}/100)`);
        console.log(`   Cacheability: ${report.metrics.cacheability} (Score: ${report.scores.cacheability}/100)`);
        console.log(`   Estimated Load Time: ${report.metrics.estimatedLoadTime} (Score: ${report.scores.loadTime}/100)`);
        console.log(`   Overall Score: ${this.calculateOverallScore(report.scores)}/100`);
        
        if (report.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            report.recommendations.forEach(rec => console.log(`   • ${rec}`));
        }
        
        console.log(`\n📄 Detailed report saved: ${path.join(reportsDir, 'performance-report.json')}`);
    }

    scoreBundleSize() {
        const totalSize = this.metrics.bundleSize.total;
        if (totalSize < 500000) return 100; // < 500KB
        if (totalSize < 1000000) return 80;  // < 1MB
        if (totalSize < 2000000) return 60;  // < 2MB
        if (totalSize < 5000000) return 40;  // < 5MB
        return 20;
    }

    scoreImageOptimization() {
        return Math.round(this.metrics.imageOptimization);
    }

    scoreCacheability() {
        return this.metrics.cacheability;
    }

    scoreLoadTime() {
        const loadTime = this.metrics.loadTime;
        if (loadTime < 1000) return 100;  // < 1s
        if (loadTime < 2000) return 80;   // < 2s
        if (loadTime < 3000) return 60;   // < 3s
        if (loadTime < 5000) return 40;   // < 5s
        return 20;
    }

    calculateOverallScore(scores) {
        const values = Object.values(scores);
        return Math.round(values.reduce((sum, score) => sum + score, 0) / values.length);
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.bundleSize.total > 2000000) {
            recommendations.push('Consider code splitting to reduce bundle size');
        }
        
        if (this.metrics.imageOptimization < 80) {
            recommendations.push('Optimize images using compression tools');
        }
        
        if (this.metrics.loadTime > 3000) {
            recommendations.push('Implement lazy loading for non-critical resources');
        }
        
        if (this.metrics.bundleSize.javascript > 1000000) {
            recommendations.push('Consider tree shaking to remove unused JavaScript');
        }
        
        return recommendations;
    }

    getAllFiles(dir) {
        const files = [];
        
        function traverse(currentDir) {
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
        }
        
        traverse(dir);
        return files;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Run analysis if called directly
if (require.main === module) {
    const analyzer = new PerformanceAnalyzer();
    analyzer.analyze();
}

module.exports = PerformanceAnalyzer;
