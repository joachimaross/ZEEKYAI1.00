// AI Vision & Image Generation Extension for Zeeky AI
class VisionAI {
    constructor() {
        this.generatedImages = [];
        this.analyzedImages = [];
        this.galleryImages = [];
        this.canvas = null;
        this.ctx = null;
        this.isEditing = false;
        
        this.imageStyles = {
            realistic: 'photorealistic, high quality, detailed',
            artistic: 'artistic, painterly, creative style',
            cartoon: 'cartoon style, animated, colorful',
            abstract: 'abstract art, geometric, modern',
            cyberpunk: 'cyberpunk, neon, futuristic, sci-fi'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadGallery();
        this.setupCanvas();
    }

    setupEventListeners() {
        // Vision modal
        const visionBtn = document.getElementById('vision-btn');
        visionBtn?.addEventListener('click', () => this.openVisionModal());

        // Vision tabs
        document.querySelectorAll('.vision-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchVisionTab(tab.dataset.tab));
        });

        // Image generation
        const generateBtn = document.getElementById('generate-image');
        generateBtn?.addEventListener('click', () => this.generateImage());

        // Image upload for analysis
        const visionUploadZone = document.getElementById('vision-upload-zone');
        const visionFileInput = document.getElementById('vision-file-input');
        
        visionUploadZone?.addEventListener('click', () => visionFileInput.click());
        visionUploadZone?.addEventListener('dragover', (e) => this.handleDragOver(e));
        visionUploadZone?.addEventListener('drop', (e) => this.handleDrop(e));
        visionFileInput?.addEventListener('change', (e) => this.handleFileSelect(e));

        // Editor tools
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => this.selectTool(btn.dataset.tool));
        });
    }

    openVisionModal() {
        const modal = document.getElementById('vision-modal');
        if (modal) {
            modal.classList.add('active');
            this.updateGalleryDisplay();
        }
    }

    switchVisionTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.vision-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update panels
        document.querySelectorAll('.vision-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });

        if (tabName === 'edit') {
            this.setupCanvas();
        }
    }

    async generateImage() {
        const prompt = document.getElementById('image-prompt').value.trim();
        const style = document.getElementById('image-style').value;
        const size = document.getElementById('image-size').value;

        if (!prompt) {
            this.showNotification('Please enter a description for the image', 'error');
            return;
        }

        // Show loading state
        const generateBtn = document.getElementById('generate-image');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        generateBtn.disabled = true;

        try {
            // Enhanced prompt with style
            const enhancedPrompt = `${prompt}, ${this.imageStyles[style]}`;
            
            // Simulate image generation (in real implementation, call DALL-E, Midjourney, or Stable Diffusion API)
            const imageData = await this.simulateImageGeneration(enhancedPrompt, size);
            
            // Add to generated images
            this.generatedImages.unshift(imageData);
            this.updateGeneratedImagesDisplay();
            
            // Add to gallery
            this.addToGallery(imageData);
            
            this.showNotification('Image generated successfully!', 'success');
            
            // Track image generation
            if (window.analyticsManager) {
                window.analyticsManager.trackUserAction('image_generated', style);
            }

        } catch (error) {
            console.error('Image generation error:', error);
            this.showNotification('Failed to generate image', 'error');
        } finally {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
    }

    async simulateImageGeneration(prompt, size) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Create a placeholder image with the prompt
        const canvas = document.createElement('canvas');
        const [width, height] = size.split('x').map(Number);
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add text
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Generated Image', width / 2, height / 2 - 20);
        ctx.font = '16px Arial';
        ctx.fillText(prompt.substring(0, 50) + '...', width / 2, height / 2 + 20);
        
        const imageUrl = canvas.toDataURL('image/png');
        
        return {
            id: this.generateImageId(),
            prompt: prompt,
            url: imageUrl,
            size: size,
            timestamp: Date.now(),
            type: 'generated'
        };
    }

    generateImageId() {
        return 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    updateGeneratedImagesDisplay() {
        const container = document.getElementById('generated-images');
        if (!container) return;

        container.innerHTML = '';

        if (this.generatedImages.length === 0) {
            container.innerHTML = '<p class="no-images">No images generated yet</p>';
            return;
        }

        this.generatedImages.forEach(image => {
            const imageElement = this.createImageElement(image);
            container.appendChild(imageElement);
        });
    }

    createImageElement(imageData) {
        const element = document.createElement('div');
        element.className = 'generated-image';
        
        element.innerHTML = `
            <img src="${imageData.url}" alt="${imageData.prompt}" loading="lazy">
            <div class="image-actions">
                <button class="image-action-btn" onclick="visionAI.downloadImage('${imageData.id}')" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="image-action-btn" onclick="visionAI.editImage('${imageData.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="image-action-btn" onclick="visionAI.deleteImage('${imageData.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return element;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        this.processUploadedFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processUploadedFiles(files);
    }

    async processUploadedFiles(files) {
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                await this.analyzeImage(file);
            }
        }
    }

    async analyzeImage(file) {
        try {
            const imageUrl = URL.createObjectURL(file);
            
            // Show loading
            this.showAnalysisLoading();
            
            // Simulate image analysis (in real implementation, use Google Vision API, AWS Rekognition, etc.)
            const analysis = await this.simulateImageAnalysis(file, imageUrl);
            
            // Display results
            this.displayAnalysisResults(analysis);
            
            // Add to analyzed images
            this.analyzedImages.unshift(analysis);
            
            this.showNotification('Image analyzed successfully!', 'success');
            
            // Track image analysis
            if (window.analyticsManager) {
                window.analyticsManager.trackUserAction('image_analyzed', file.type);
            }

        } catch (error) {
            console.error('Image analysis error:', error);
            this.showNotification('Failed to analyze image', 'error');
        }
    }

    async simulateImageAnalysis(file, imageUrl) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Basic file analysis
        const analysis = {
            id: this.generateImageId(),
            filename: file.name,
            size: file.size,
            type: file.type,
            url: imageUrl,
            timestamp: Date.now(),
            
            // Simulated AI analysis results
            objects: ['person', 'building', 'sky', 'tree'],
            colors: ['blue', 'green', 'brown', 'white'],
            text: 'Sample text detected in image',
            faces: 1,
            emotions: ['happy', 'confident'],
            landmarks: ['Golden Gate Bridge'],
            description: 'A beautiful landscape photo showing a person standing near a building with trees and blue sky in the background.',
            confidence: 0.92,
            
            // Technical details
            dimensions: '1920x1080',
            format: file.type.split('/')[1].toUpperCase(),
            quality: 'High'
        };

        return analysis;
    }

    showAnalysisLoading() {
        const resultsContainer = document.getElementById('analysis-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="analysis-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Analyzing image...</p>
                </div>
            `;
        }
    }

    displayAnalysisResults(analysis) {
        const resultsContainer = document.getElementById('analysis-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="analysis-content">
                <div class="analyzed-image">
                    <img src="${analysis.url}" alt="${analysis.filename}" style="max-width: 200px; border-radius: 8px;">
                </div>
                
                <div class="analysis-details">
                    <h4>📊 Analysis Results</h4>
                    
                    <div class="analysis-section">
                        <h5>🏷️ Objects Detected</h5>
                        <div class="tags">
                            ${analysis.objects.map(obj => `<span class="tag">${obj}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="analysis-section">
                        <h5>🎨 Dominant Colors</h5>
                        <div class="tags">
                            ${analysis.colors.map(color => `<span class="tag color-tag">${color}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="analysis-section">
                        <h5>📝 Description</h5>
                        <p>${analysis.description}</p>
                    </div>
                    
                    <div class="analysis-section">
                        <h5>🔍 Technical Details</h5>
                        <ul>
                            <li>Dimensions: ${analysis.dimensions}</li>
                            <li>Format: ${analysis.format}</li>
                            <li>Size: ${this.formatFileSize(analysis.size)}</li>
                            <li>Quality: ${analysis.quality}</li>
                            <li>Confidence: ${(analysis.confidence * 100).toFixed(1)}%</li>
                        </ul>
                    </div>
                    
                    ${analysis.faces > 0 ? `
                        <div class="analysis-section">
                            <h5>👤 Face Analysis</h5>
                            <p>Faces detected: ${analysis.faces}</p>
                            <p>Emotions: ${analysis.emotions.join(', ')}</p>
                        </div>
                    ` : ''}
                    
                    ${analysis.text ? `
                        <div class="analysis-section">
                            <h5>📖 Text Recognition</h5>
                            <p>"${analysis.text}"</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    setupCanvas() {
        const canvas = document.getElementById('image-editor-canvas');
        if (!canvas) return;

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;
        
        // Clear canvas
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add placeholder text
        this.ctx.fillStyle = '#666';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Image Editor', canvas.width / 2, canvas.height / 2);
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Upload an image to start editing', canvas.width / 2, canvas.height / 2 + 30);
    }

    selectTool(tool) {
        // Update tool buttons
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });

        this.currentTool = tool;
        this.showNotification(`Selected ${tool} tool`, 'info');
    }

    addToGallery(imageData) {
        this.galleryImages.unshift(imageData);
        this.saveGallery();
        this.updateGalleryDisplay();
    }

    updateGalleryDisplay() {
        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = '';

        if (this.galleryImages.length === 0) {
            galleryGrid.innerHTML = '<p class="no-images">No images in gallery</p>';
            return;
        }

        this.galleryImages.forEach(image => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            galleryItem.innerHTML = `
                <img src="${image.url}" alt="${image.prompt || image.filename}" loading="lazy">
            `;
            
            galleryItem.addEventListener('click', () => this.viewImageFullscreen(image));
            galleryGrid.appendChild(galleryItem);
        });
    }

    viewImageFullscreen(imageData) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${imageData.prompt || imageData.filename}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <img src="${imageData.url}" alt="${imageData.prompt || imageData.filename}" style="max-width: 100%; height: auto;">
                    <div class="image-details">
                        <p><strong>Created:</strong> ${new Date(imageData.timestamp).toLocaleString()}</p>
                        ${imageData.prompt ? `<p><strong>Prompt:</strong> ${imageData.prompt}</p>` : ''}
                        ${imageData.size ? `<p><strong>Size:</strong> ${imageData.size}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    downloadImage(imageId) {
        const image = this.findImageById(imageId);
        if (!image) return;

        const link = document.createElement('a');
        link.href = image.url;
        link.download = `zeeky-ai-${imageId}.png`;
        link.click();
    }

    editImage(imageId) {
        const image = this.findImageById(imageId);
        if (!image) return;

        // Switch to edit tab and load image
        this.switchVisionTab('edit');
        this.loadImageInEditor(image);
    }

    deleteImage(imageId) {
        if (confirm('Are you sure you want to delete this image?')) {
            this.generatedImages = this.generatedImages.filter(img => img.id !== imageId);
            this.galleryImages = this.galleryImages.filter(img => img.id !== imageId);
            this.updateGeneratedImagesDisplay();
            this.updateGalleryDisplay();
            this.saveGallery();
            this.showNotification('Image deleted', 'success');
        }
    }

    findImageById(imageId) {
        return this.generatedImages.find(img => img.id === imageId) ||
               this.analyzedImages.find(img => img.id === imageId) ||
               this.galleryImages.find(img => img.id === imageId);
    }

    loadImageInEditor(imageData) {
        const img = new Image();
        img.onload = () => {
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = imageData.url;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    saveGallery() {
        // Save only metadata, not the actual image data
        const galleryMetadata = this.galleryImages.map(img => ({
            id: img.id,
            prompt: img.prompt,
            filename: img.filename,
            timestamp: img.timestamp,
            type: img.type
        }));
        localStorage.setItem('zeeky_vision_gallery', JSON.stringify(galleryMetadata));
    }

    loadGallery() {
        const saved = localStorage.getItem('zeeky_vision_gallery');
        if (saved) {
            try {
                const galleryMetadata = JSON.parse(saved);
                // Note: Image URLs are not restored from localStorage
                this.galleryImages = galleryMetadata;
            } catch (e) {
                console.error('Failed to load gallery:', e);
            }
        }
    }

    showNotification(message, type) {
        if (window.ZeekyUtils) {
            window.ZeekyUtils.showNotification(message, type);
        }
    }

    // Public API
    getGeneratedImages() {
        return this.generatedImages;
    }

    getAnalyzedImages() {
        return this.analyzedImages;
    }

    getGalleryImages() {
        return this.galleryImages;
    }
}

// Initialize vision AI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.visionAI = new VisionAI();
});
