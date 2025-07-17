"""
Zeeky AI File Upload and Processing System
Handles various file types with AI analysis
"""

import os
import uuid
import mimetypes
import asyncio
from pathlib import Path
from typing import Dict, List, Optional, BinaryIO
import logging
from datetime import datetime
import json
import base64

# File processing libraries
try:
    import PyPDF2
    import docx
    from PIL import Image
    import pandas as pd
except ImportError:
    # Graceful fallback if libraries not installed
    PyPDF2 = None
    docx = None
    Image = None
    pd = None

logger = logging.getLogger(__name__)

class FileProcessor:
    """Advanced file processing with AI analysis"""
    
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.upload_dir.mkdir(exist_ok=True)
        
        # Supported file types
        self.supported_types = {
            'text': ['.txt', '.md', '.csv', '.json', '.xml', '.yaml', '.yml'],
            'document': ['.pdf', '.doc', '.docx', '.rtf'],
            'image': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
            'code': ['.py', '.js', '.html', '.css', '.java', '.cpp', '.c', '.php', '.rb', '.go'],
            'data': ['.csv', '.xlsx', '.xls', '.json', '.xml'],
            'archive': ['.zip', '.rar', '.tar', '.gz']
        }
        
        # File size limits (bytes)
        self.size_limits = {
            'image': 10 * 1024 * 1024,  # 10MB
            'document': 50 * 1024 * 1024,  # 50MB
            'text': 5 * 1024 * 1024,  # 5MB
            'code': 5 * 1024 * 1024,  # 5MB
            'data': 20 * 1024 * 1024,  # 20MB
            'archive': 100 * 1024 * 1024  # 100MB
        }
        
        self.processed_files = {}
    
    async def upload_file(self, file_data: bytes, filename: str, user_id: str) -> Dict:
        """Upload and process a file"""
        
        try:
            # Validate file
            validation = self._validate_file(file_data, filename)
            if not validation["valid"]:
                return validation
            
            # Generate unique file ID
            file_id = str(uuid.uuid4())
            file_extension = Path(filename).suffix.lower()
            safe_filename = f"{file_id}{file_extension}"
            file_path = self.upload_dir / safe_filename
            
            # Save file
            with open(file_path, 'wb') as f:
                f.write(file_data)
            
            # Process file based on type
            file_type = self._get_file_type(file_extension)
            processing_result = await self._process_file(file_path, file_type, filename)
            
            # Store file metadata
            file_metadata = {
                "id": file_id,
                "original_name": filename,
                "file_path": str(file_path),
                "file_type": file_type,
                "file_size": len(file_data),
                "user_id": user_id,
                "upload_time": datetime.now().isoformat(),
                "processing_result": processing_result
            }
            
            self.processed_files[file_id] = file_metadata
            
            return {
                "success": True,
                "file_id": file_id,
                "file_type": file_type,
                "file_size": len(file_data),
                "processing_result": processing_result,
                "message": f"File '{filename}' uploaded and processed successfully"
            }
            
        except Exception as e:
            logger.error(f"File upload error: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to upload and process file"
            }
    
    def _validate_file(self, file_data: bytes, filename: str) -> Dict:
        """Validate file before processing"""
        
        file_extension = Path(filename).suffix.lower()
        file_size = len(file_data)
        
        # Check if file type is supported
        file_type = self._get_file_type(file_extension)
        if not file_type:
            return {
                "valid": False,
                "error": f"Unsupported file type: {file_extension}",
                "supported_types": list(self.supported_types.keys())
            }
        
        # Check file size
        size_limit = self.size_limits.get(file_type, 5 * 1024 * 1024)
        if file_size > size_limit:
            return {
                "valid": False,
                "error": f"File too large: {file_size} bytes (limit: {size_limit} bytes)",
                "size_limit": size_limit
            }
        
        # Check for malicious content (basic check)
        if self._contains_malicious_content(file_data, file_extension):
            return {
                "valid": False,
                "error": "File contains potentially malicious content"
            }
        
        return {"valid": True}
    
    def _get_file_type(self, file_extension: str) -> Optional[str]:
        """Determine file type from extension"""
        
        for file_type, extensions in self.supported_types.items():
            if file_extension in extensions:
                return file_type
        return None
    
    def _contains_malicious_content(self, file_data: bytes, file_extension: str) -> bool:
        """Basic malicious content detection"""
        
        # Check for suspicious patterns
        suspicious_patterns = [
            b'<script',
            b'javascript:',
            b'eval(',
            b'exec(',
            b'system(',
            b'shell_exec'
        ]
        
        file_data_lower = file_data.lower()
        for pattern in suspicious_patterns:
            if pattern in file_data_lower:
                return True
        
        return False
    
    async def _process_file(self, file_path: Path, file_type: str, original_name: str) -> Dict:
        """Process file based on its type"""
        
        try:
            if file_type == 'text':
                return await self._process_text_file(file_path)
            elif file_type == 'document':
                return await self._process_document_file(file_path)
            elif file_type == 'image':
                return await self._process_image_file(file_path)
            elif file_type == 'code':
                return await self._process_code_file(file_path)
            elif file_type == 'data':
                return await self._process_data_file(file_path)
            else:
                return {"type": file_type, "status": "uploaded", "analysis": "Basic file upload completed"}
                
        except Exception as e:
            logger.error(f"File processing error: {e}")
            return {"type": file_type, "status": "error", "error": str(e)}
    
    async def _process_text_file(self, file_path: Path) -> Dict:
        """Process text files"""
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Basic text analysis
            word_count = len(content.split())
            line_count = len(content.splitlines())
            char_count = len(content)
            
            # Extract key information
            analysis = {
                "word_count": word_count,
                "line_count": line_count,
                "character_count": char_count,
                "preview": content[:500] + "..." if len(content) > 500 else content,
                "language_detected": self._detect_language(content),
                "sentiment": self._analyze_sentiment(content)
            }
            
            return {
                "type": "text",
                "status": "processed",
                "analysis": analysis,
                "extractable_content": content
            }
            
        except Exception as e:
            return {"type": "text", "status": "error", "error": str(e)}
    
    async def _process_document_file(self, file_path: Path) -> Dict:
        """Process document files (PDF, DOCX, etc.)"""
        
        try:
            content = ""
            file_extension = file_path.suffix.lower()
            
            if file_extension == '.pdf' and PyPDF2:
                with open(file_path, 'rb') as f:
                    pdf_reader = PyPDF2.PdfReader(f)
                    for page in pdf_reader.pages:
                        content += page.extract_text() + "\n"
            
            elif file_extension == '.docx' and docx:
                doc = docx.Document(file_path)
                for paragraph in doc.paragraphs:
                    content += paragraph.text + "\n"
            
            else:
                return {"type": "document", "status": "unsupported", "message": "Document processing libraries not available"}
            
            # Analyze extracted content
            word_count = len(content.split())
            analysis = {
                "word_count": word_count,
                "page_count": len(content.split('\n\n')),
                "preview": content[:500] + "..." if len(content) > 500 else content,
                "key_topics": self._extract_key_topics(content)
            }
            
            return {
                "type": "document",
                "status": "processed",
                "analysis": analysis,
                "extractable_content": content
            }
            
        except Exception as e:
            return {"type": "document", "status": "error", "error": str(e)}
    
    async def _process_image_file(self, file_path: Path) -> Dict:
        """Process image files"""
        
        try:
            if not Image:
                return {"type": "image", "status": "unsupported", "message": "Image processing library not available"}
            
            with Image.open(file_path) as img:
                # Basic image analysis
                analysis = {
                    "dimensions": f"{img.width}x{img.height}",
                    "format": img.format,
                    "mode": img.mode,
                    "size_bytes": file_path.stat().st_size,
                    "has_transparency": img.mode in ('RGBA', 'LA') or 'transparency' in img.info
                }
                
                # Convert to base64 for preview
                img_copy = img.copy()
                img_copy.thumbnail((200, 200))  # Create thumbnail
                
                return {
                    "type": "image",
                    "status": "processed",
                    "analysis": analysis,
                    "preview_available": True
                }
                
        except Exception as e:
            return {"type": "image", "status": "error", "error": str(e)}
    
    async def _process_code_file(self, file_path: Path) -> Dict:
        """Process code files"""
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Basic code analysis
            lines = content.splitlines()
            analysis = {
                "line_count": len(lines),
                "language": self._detect_programming_language(file_path.suffix),
                "functions_detected": self._count_functions(content, file_path.suffix),
                "comments_ratio": self._calculate_comments_ratio(content, file_path.suffix),
                "preview": content[:500] + "..." if len(content) > 500 else content
            }
            
            return {
                "type": "code",
                "status": "processed",
                "analysis": analysis,
                "extractable_content": content
            }
            
        except Exception as e:
            return {"type": "code", "status": "error", "error": str(e)}
    
    async def _process_data_file(self, file_path: Path) -> Dict:
        """Process data files (CSV, JSON, etc.)"""
        
        try:
            file_extension = file_path.suffix.lower()
            
            if file_extension == '.json':
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                analysis = {
                    "type": "JSON",
                    "structure": self._analyze_json_structure(data),
                    "size": len(str(data))
                }
            
            elif file_extension == '.csv' and pd:
                df = pd.read_csv(file_path)
                analysis = {
                    "type": "CSV",
                    "rows": len(df),
                    "columns": len(df.columns),
                    "column_names": list(df.columns),
                    "preview": df.head().to_dict()
                }
            
            else:
                return {"type": "data", "status": "unsupported", "message": "Data processing library not available"}
            
            return {
                "type": "data",
                "status": "processed",
                "analysis": analysis
            }
            
        except Exception as e:
            return {"type": "data", "status": "error", "error": str(e)}
    
    # Helper methods for analysis
    def _detect_language(self, text: str) -> str:
        """Simple language detection"""
        # This is a placeholder - in production, use a proper language detection library
        return "unknown"
    
    def _analyze_sentiment(self, text: str) -> str:
        """Simple sentiment analysis"""
        # This is a placeholder - in production, use a proper sentiment analysis library
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful']
        negative_words = ['bad', 'terrible', 'awful', 'horrible', 'worst']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"
    
    def _extract_key_topics(self, text: str) -> List[str]:
        """Extract key topics from text"""
        # This is a placeholder - in production, use NLP libraries
        words = text.lower().split()
        word_freq = {}
        for word in words:
            if len(word) > 4:  # Only consider longer words
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Return top 5 most frequent words as topics
        return sorted(word_freq.keys(), key=word_freq.get, reverse=True)[:5]
    
    def _detect_programming_language(self, extension: str) -> str:
        """Detect programming language from file extension"""
        lang_map = {
            '.py': 'Python',
            '.js': 'JavaScript',
            '.html': 'HTML',
            '.css': 'CSS',
            '.java': 'Java',
            '.cpp': 'C++',
            '.c': 'C',
            '.php': 'PHP',
            '.rb': 'Ruby',
            '.go': 'Go'
        }
        return lang_map.get(extension, 'Unknown')
    
    def _count_functions(self, content: str, extension: str) -> int:
        """Count functions in code"""
        # Simple function counting based on common patterns
        if extension == '.py':
            return content.count('def ')
        elif extension == '.js':
            return content.count('function ') + content.count('=>')
        elif extension in ['.java', '.cpp', '.c']:
            return content.count('(') - content.count('if(') - content.count('while(')
        return 0
    
    def _calculate_comments_ratio(self, content: str, extension: str) -> float:
        """Calculate ratio of comments to code"""
        lines = content.splitlines()
        comment_lines = 0
        
        for line in lines:
            line = line.strip()
            if extension == '.py' and line.startswith('#'):
                comment_lines += 1
            elif extension == '.js' and (line.startswith('//') or line.startswith('/*')):
                comment_lines += 1
            elif extension in ['.java', '.cpp', '.c'] and (line.startswith('//') or line.startswith('/*')):
                comment_lines += 1
        
        return comment_lines / len(lines) if lines else 0
    
    def _analyze_json_structure(self, data) -> Dict:
        """Analyze JSON structure"""
        if isinstance(data, dict):
            return {
                "type": "object",
                "keys": len(data.keys()),
                "key_names": list(data.keys())[:10]  # First 10 keys
            }
        elif isinstance(data, list):
            return {
                "type": "array",
                "length": len(data),
                "item_types": list(set(type(item).__name__ for item in data[:10]))
            }
        else:
            return {"type": type(data).__name__}
    
    def get_file_info(self, file_id: str) -> Optional[Dict]:
        """Get file information by ID"""
        return self.processed_files.get(file_id)
    
    def delete_file(self, file_id: str) -> bool:
        """Delete a file"""
        if file_id in self.processed_files:
            file_info = self.processed_files[file_id]
            file_path = Path(file_info["file_path"])
            
            try:
                if file_path.exists():
                    file_path.unlink()
                del self.processed_files[file_id]
                return True
            except Exception as e:
                logger.error(f"Error deleting file {file_id}: {e}")
                return False
        
        return False

# Global instance
file_processor = FileProcessor()
