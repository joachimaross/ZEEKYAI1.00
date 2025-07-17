#!/usr/bin/env node

/**
 * Zeeky AI Build Optimizer
 * Optimizes frontend assets for production deployment
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

class BuildOptimizer {
    constructor() {
        this.frontendDir = path.join(__dirname, '..', 'frontend');
        this.distDir = path.join(this.frontendDir, 'dist');
        this.stats = {
            filesProcessed: 0,
            originalSize: 0,
            optimizedSize: 0,
            errors: []
        };
    }

    async optimize() {
        console.log('🚀 Starting Zeeky AI build optimization...');
        
        try {
            // Create dist directory
            await this.createDistDirectory();
            
            // Copy and optimize files
            await this.copyAndOptimizeFiles();
            
            // Generate build report
            this.generateBuildReport();
            
            console.log('✅ Build optimization completed successfully!');
            
        } catch (error) {
            console.error('❌ Build optimization failed:', error);
            process.exit(1);
        }
    }

    async createDistDirectory() {
        if (fs.existsSync(this.distDir)) {
            fs.rmSync(this.distDir, { recursive: true, force: true });
        }
        fs.mkdirSync(this.distDir, { recursive: true });
        console.log('📁 Created dist directory');
    }

    async copyAndOptimizeFiles() {
        const files = this.getAllFiles(this.frontendDir);
        
        for (const file of files) {
            // Skip dist directory and node_modules
            if (file.includes('/dist/') || file.includes('node_modules')) {
                continue;
            }
            
            const relativePath = path.relative(this.frontendDir, file);
            const destPath = path.join(this.distDir, relativePath);
            
            // Ensure destination directory exists
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            
            try {
                await this.processFile(file, destPath);
                this.stats.filesProcessed++;
            } catch (error) {
                this.stats.errors.push({ file: relativePath, error: error.message });
                console.warn(`⚠️ Failed to process ${relativePath}:`, error.message);
            }
        }
    }

    async processFile(sourcePath, destPath) {
        const ext = path.extname(sourcePath).toLowerCase();
        const content = fs.readFileSync(sourcePath, 'utf8');
        this.stats.originalSize += Buffer.byteLength(content, 'utf8');
        
        let optimizedContent = content;
        
        switch (ext) {
            case '.js':
                optimizedContent = await this.optimizeJavaScript(content, sourcePath);
                break;
            case '.css':
                optimizedContent = this.optimizeCSS(content);
                break;
            case '.html':
                optimizedContent = this.optimizeHTML(content);
                break;
            case '.json':
                optimizedContent = this.optimizeJSON(content);
                break;
            default:
                // Copy binary files as-is
                if (this.isBinaryFile(sourcePath)) {
                    fs.copyFileSync(sourcePath, destPath);
                    return;
                }
        }
        
        fs.writeFileSync(destPath, optimizedContent, 'utf8');
        this.stats.optimizedSize += Buffer.byteLength(optimizedContent, 'utf8');
    }

    async optimizeJavaScript(content, filePath) {
        try {
            const result = await minify(content, {
                compress: {
                    drop_console: process.env.NODE_ENV === 'production',
                    drop_debugger: true,
                    pure_funcs: ['console.log', 'console.debug'],
                    passes: 2
                },
                mangle: {
                    toplevel: true,
                    reserved: ['window', 'document', 'navigator', 'localStorage']
                },
                format: {
                    comments: false
                },
                sourceMap: process.env.NODE_ENV !== 'production'
            });
            
            if (result.error) {
                throw result.error;
            }
            
            return result.code;
        } catch (error) {
            console.warn(`⚠️ JavaScript minification failed for ${filePath}, using original`);
            return content;
        }
    }

    optimizeCSS(content) {
        // Basic CSS optimization
        return content
            // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Remove whitespace around certain characters
            .replace(/\s*([{}:;,>+~])\s*/g, '$1')
            // Remove trailing semicolons
            .replace(/;}/g, '}')
            // Remove empty rules
            .replace(/[^{}]+{\s*}/g, '')
            .trim();
    }

    optimizeHTML(content) {
        return content
            // Remove HTML comments (except IE conditionals)
            .replace(/<!--(?!\s*(?:\[if [^\]]+]|<!|>))[\s\S]*?-->/g, '')
            // Remove extra whitespace between tags
            .replace(/>\s+</g, '><')
            // Remove whitespace around certain elements
            .replace(/\s+/g, ' ')
            .trim();
    }

    optimizeJSON(content) {
        try {
            const parsed = JSON.parse(content);
            return JSON.stringify(parsed);
        } catch (error) {
            return content;
        }
    }

    isBinaryFile(filePath) {
        const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
        return binaryExtensions.includes(path.extname(filePath).toLowerCase());
    }

    getAllFiles(dir) {
        const files = [];
        
        function traverse(currentDir) {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    traverse(fullPath);
                } else {
                    files.push(fullPath);
                }
            }
        }
        
        traverse(dir);
        return files;
    }

    generateBuildReport() {
        const compressionRatio = ((this.stats.originalSize - this.stats.optimizedSize) / this.stats.originalSize * 100).toFixed(2);
        
        const report = {
            timestamp: new Date().toISOString(),
            filesProcessed: this.stats.filesProcessed,
            originalSize: this.formatBytes(this.stats.originalSize),
            optimizedSize: this.formatBytes(this.stats.optimizedSize),
            compressionRatio: `${compressionRatio}%`,
            errors: this.stats.errors
        };
        
        // Write build report
        fs.writeFileSync(
            path.join(this.distDir, 'build-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        // Console output
        console.log('\n📊 Build Optimization Report:');
        console.log(`   Files processed: ${report.filesProcessed}`);
        console.log(`   Original size: ${report.originalSize}`);
        console.log(`   Optimized size: ${report.optimizedSize}`);
        console.log(`   Compression: ${report.compressionRatio}`);
        
        if (this.stats.errors.length > 0) {
            console.log(`   Errors: ${this.stats.errors.length}`);
        }
        
        console.log(`   Report saved: ${path.join(this.distDir, 'build-report.json')}`);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Run optimization if called directly
if (require.main === module) {
    const optimizer = new BuildOptimizer();
    optimizer.optimize();
}

module.exports = BuildOptimizer;
