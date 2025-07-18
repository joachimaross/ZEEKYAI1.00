// File Handler Extension for Zeeky AI
class FileHandler {
    constructor() {
        this.uploadedFiles = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.supportedTypes = {
            'application/pdf': { icon: 'fas fa-file-pdf', color: '#dc3545' },
            'text/plain': { icon: 'fas fa-file-alt', color: '#6c757d' },
            'application/msword': { icon: 'fas fa-file-word', color: '#007bff' },
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: 'fas fa-file-word', color: '#007bff' },
            'image/jpeg': { icon: 'fas fa-file-image', color: '#28a745' },
            'image/jpg': { icon: 'fas fa-file-image', color: '#28a745' },
            'image/png': { icon: 'fas fa-file-image', color: '#28a745' },
            'text/csv': { icon: 'fas fa-file-csv', color: '#17a2b8' },
            'application/json': { icon: 'fas fa-file-code', color: '#ffc107' }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredFiles();
        this.setupDropZone();
    }

    setupEventListeners() {
        // File upload button in chat
        const fileUploadBtn = document.getElementById('file-upload-btn');
        fileUploadBtn?.addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        // File input change
        const fileInput = document.getElementById('file-input');
        fileInput?.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // Select files button in modal
        const selectFilesBtn = document.getElementById('select-files');
        selectFilesBtn?.addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        // Files modal button
        const filesBtn = document.getElementById('files-btn');
        filesBtn?.addEventListener('click', () => {
            this.openFilesModal();
        });
    }

    setupDropZone() {
        const dropZone = document.getElementById('file-drop-zone');
        if (!dropZone) return;

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });

        dropZone.addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
    }

    async handleFileSelect(files) {
        const fileArray = Array.from(files);
        
        for (const file of fileArray) {
            if (this.validateFile(file)) {
                await this.processFile(file);
            }
        }
        
        this.updateFileList();
        this.saveStoredFiles();
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            this.showNotification(`File "${file.name}" is too large. Maximum size is ${this.formatFileSize(this.maxFileSize)}.`, 'error');
            return false;
        }

        // Check file type
        if (!this.supportedTypes[file.type]) {
            this.showNotification(`File type "${file.type}" is not supported.`, 'error');
            return false;
        }

        return true;
    }

    async processFile(file) {
        const fileData = {
            id: this.generateFileId(),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString(),
            content: null,
            processed: false
        };

        try {
            // Show processing notification
            this.showNotification(`Processing "${file.name}"...`, 'info');

            // Read file content based on type
            if (file.type.startsWith('text/') || file.type === 'application/json') {
                fileData.content = await this.readTextFile(file);
            } else if (file.type.startsWith('image/')) {
                fileData.content = await this.readImageFile(file);
            } else if (file.type === 'application/pdf') {
                fileData.content = await this.readPDFFile(file);
            }

            fileData.processed = true;
            this.uploadedFiles.push(fileData);
            
            this.showNotification(`"${file.name}" processed successfully!`, 'success');
            
            // Auto-analyze file if it's text-based
            if (fileData.content && typeof fileData.content === 'string') {
                this.analyzeFileContent(fileData);
            }

        } catch (error) {
            console.error('File processing error:', error);
            this.showNotification(`Failed to process "${file.name}": ${error.message}`, 'error');
        }
    }

    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    readImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read image'));
            reader.readAsDataURL(file);
        });
    }

    async readPDFFile(file) {
        // For PDF processing, we would typically use PDF.js or send to backend
        // For now, return a placeholder
        return `PDF file: ${file.name} (${this.formatFileSize(file.size)}) - Content extraction requires backend processing`;
    }

    analyzeFileContent(fileData) {
        let analysis = '';
        
        if (fileData.type === 'text/csv') {
            analysis = this.analyzeCSV(fileData.content);
        } else if (fileData.type === 'application/json') {
            analysis = this.analyzeJSON(fileData.content);
        } else if (fileData.type === 'text/plain') {
            analysis = this.analyzeText(fileData.content);
        }

        if (analysis) {
            fileData.analysis = analysis;
            this.addFileAnalysisToChat(fileData);
        }
    }

    analyzeCSV(content) {
        const lines = content.split('\n').filter(line => line.trim());
        const headers = lines[0] ? lines[0].split(',').length : 0;
        const rows = lines.length - 1;
        
        return `CSV Analysis:
- ${rows} data rows
- ${headers} columns
- Headers: ${lines[0] || 'None detected'}
- File size: ${this.formatFileSize(content.length)}`;
    }

    analyzeJSON(content) {
        try {
            const data = JSON.parse(content);
            const keys = Object.keys(data);
            const type = Array.isArray(data) ? 'Array' : 'Object';
            
            return `JSON Analysis:
- Type: ${type}
- ${Array.isArray(data) ? `Items: ${data.length}` : `Keys: ${keys.length}`}
- Structure: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}
- File size: ${this.formatFileSize(content.length)}`;
        } catch (e) {
            return 'JSON Analysis: Invalid JSON format';
        }
    }

    analyzeText(content) {
        const words = content.split(/\s+/).length;
        const lines = content.split('\n').length;
        const chars = content.length;
        
        return `Text Analysis:
- ${words} words
- ${lines} lines
- ${chars} characters
- File size: ${this.formatFileSize(chars)}`;
    }

    addFileAnalysisToChat(fileData) {
        if (window.zeekyAI) {
            const message = `📁 **File Analyzed: ${fileData.name}**\n\n${fileData.analysis}`;
            window.zeekyAI.addBotMessage(message);
        }
    }

    updateFileList() {
        const fileList = document.getElementById('file-list');
        if (!fileList) return;

        fileList.innerHTML = '';

        if (this.uploadedFiles.length === 0) {
            fileList.innerHTML = '<p class="no-files">No files uploaded yet</p>';
            return;
        }

        this.uploadedFiles.forEach(file => {
            const fileItem = this.createFileItem(file);
            fileList.appendChild(fileItem);
        });
    }

    createFileItem(file) {
        const item = document.createElement('div');
        item.className = 'file-item';
        
        const typeInfo = this.supportedTypes[file.type] || { icon: 'fas fa-file', color: '#6c757d' };
        
        item.innerHTML = `
            <div class="file-icon" style="background-color: ${typeInfo.color}">
                <i class="${typeInfo.icon}"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${this.formatFileSize(file.size)} • ${new Date(file.uploadDate).toLocaleDateString()}</div>
            </div>
            <div class="file-actions">
                <button class="file-action-btn" onclick="fileHandler.viewFile('${file.id}')" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="file-action-btn" onclick="fileHandler.analyzeFile('${file.id}')" title="Analyze">
                    <i class="fas fa-search"></i>
                </button>
                <button class="file-action-btn" onclick="fileHandler.deleteFile('${file.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return item;
    }

    viewFile(fileId) {
        const file = this.uploadedFiles.find(f => f.id === fileId);
        if (!file) return;

        if (file.type.startsWith('image/')) {
            this.viewImage(file);
        } else if (file.content) {
            this.viewTextContent(file);
        } else {
            this.showNotification('File content not available for viewing', 'warning');
        }
    }

    viewImage(file) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${file.name}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <img src="${file.content}" alt="${file.name}" style="max-width: 100%; height: auto;">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    viewTextContent(file) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${file.name}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <pre style="white-space: pre-wrap; max-height: 400px; overflow-y: auto; background: var(--bg-secondary); padding: 16px; border-radius: 8px;">${this.escapeHtml(file.content)}</pre>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    analyzeFile(fileId) {
        const file = this.uploadedFiles.find(f => f.id === fileId);
        if (!file) return;

        if (file.analysis) {
            this.addFileAnalysisToChat(file);
        } else {
            this.analyzeFileContent(file);
        }
        
        this.showNotification(`Analysis for "${file.name}" added to chat`, 'success');
    }

    deleteFile(fileId) {
        if (confirm('Are you sure you want to delete this file?')) {
            this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);
            this.updateFileList();
            this.saveStoredFiles();
            this.showNotification('File deleted successfully', 'success');
        }
    }

    openFilesModal() {
        const modal = document.getElementById('files-modal');
        if (modal) {
            modal.classList.add('active');
            this.updateFileList();
        }
    }

    generateFileId() {
        return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveStoredFiles() {
        // Only save file metadata, not content (to avoid localStorage limits)
        const metadata = this.uploadedFiles.map(file => ({
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: file.uploadDate,
            processed: file.processed
        }));
        
        localStorage.setItem('zeeky_uploaded_files', JSON.stringify(metadata));
    }

    loadStoredFiles() {
        const saved = localStorage.getItem('zeeky_uploaded_files');
        if (saved) {
            try {
                const metadata = JSON.parse(saved);
                // Note: File content is not restored from localStorage
                this.uploadedFiles = metadata.map(file => ({
                    ...file,
                    content: null // Content would need to be re-uploaded
                }));
                this.updateFileList();
            } catch (e) {
                console.error('Failed to load stored files:', e);
            }
        }
    }

    showNotification(message, type) {
        if (window.ZeekyUtils) {
            window.ZeekyUtils.showNotification(message, type);
        }
    }

    // Public API
    getUploadedFiles() {
        return this.uploadedFiles;
    }

    getFileById(fileId) {
        return this.uploadedFiles.find(f => f.id === fileId);
    }

    getFileContent(fileId) {
        const file = this.getFileById(fileId);
        return file ? file.content : null;
    }
}

// Initialize file handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fileHandler = new FileHandler();
});
