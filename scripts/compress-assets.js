#!/usr/bin/env node

/**
 * Zeeky AI Asset Compression Script
 * Compresses and optimizes assets for production deployment
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

class AssetCompressor {
    constructor() {
        this.frontendDir = path.join(__dirname, '..', 'frontend');
        this.stats = {
            filesCompressed: 0,
            originalSize: 0,
            compressedSize: 0,
            errors: []
        };
    }

    async compress() {
        console.log('🗜️ Starting Zeeky AI asset compression...');
        
        try {
            await this.compressAssets();
            this.generateCompressionReport();
            console.log('✅ Asset compression completed successfully!');
        } catch (error) {
            console.error('❌ Asset compression failed:', error);
            process.exit(1);
        }
    }

    async compressAssets() {
        const files = this.getCompressibleFiles(this.frontendDir);
        
        for (const file of files) {
            try {
                await this.compressFile(file);
                this.stats.filesCompressed++;
            } catch (error) {
                this.stats.errors.push({ file, error: error.message });
                console.warn(`⚠️ Failed to compress ${file}:`, error.message);
            }
        }
    }

    async compressFile(filePath) {
        const content = fs.readFileSync(filePath);
        this.stats.originalSize += content.length;

        // Create gzip version
        const gzipContent = zlib.gzipSync(content, { level: 9 });
        fs.writeFileSync(filePath + '.gz', gzipContent);

        // Create brotli version if available
        if (zlib.brotliCompressSync) {
            const brotliContent = zlib.brotliCompressSync(content, {
                params: {
                    [zlib.constants.BROTLI_PARAM_QUALITY]: 11
                }
            });
            fs.writeFileSync(filePath + '.br', brotliContent);
            this.stats.compressedSize += brotliContent.length;
        } else {
            this.stats.compressedSize += gzipContent.length;
        }
    }

    getCompressibleFiles(dir) {
        const files = [];
        const compressibleExtensions = ['.js', '.css', '.html', '.json', '.svg', '.txt'];
        
        function traverse(currentDir) {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
                    traverse(fullPath);
                } else if (stat.isFile()) {
                    const ext = path.extname(fullPath).toLowerCase();
                    if (compressibleExtensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        }
        
        traverse(dir);
        return files;
    }

    generateCompressionReport() {
        const compressionRatio = ((this.stats.originalSize - this.stats.compressedSize) / this.stats.originalSize * 100).toFixed(2);
        
        const report = {
            timestamp: new Date().toISOString(),
            filesCompressed: this.stats.filesCompressed,
            originalSize: this.formatBytes(this.stats.originalSize),
            compressedSize: this.formatBytes(this.stats.compressedSize),
            compressionRatio: `${compressionRatio}%`,
            errors: this.stats.errors
        };
        
        // Write compression report
        fs.writeFileSync(
            path.join(this.frontendDir, 'compression-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        // Console output
        console.log('\n📊 Asset Compression Report:');
        console.log(`   Files compressed: ${report.filesCompressed}`);
        console.log(`   Original size: ${report.originalSize}`);
        console.log(`   Compressed size: ${report.compressedSize}`);
        console.log(`   Compression ratio: ${report.compressionRatio}`);
        
        if (this.stats.errors.length > 0) {
            console.log(`   Errors: ${this.stats.errors.length}`);
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Run compression if called directly
if (require.main === module) {
    const compressor = new AssetCompressor();
    compressor.compress();
}

module.exports = AssetCompressor;
