'use client'

import { useState, useRef, useCallback } from 'react'
import { Send, Paperclip, Mic, MicOff, Square, Image, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { useHotkeys } from 'react-hotkeys-hook'
import { useSpeechRecognition } from '@/lib/hooks/use-speech-recognition'

interface ChatInputProps {
  input: string
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (content: string, files?: File[]) => Promise<void>
  isLoading: boolean
  onStop: () => void
  placeholder?: string
  maxLength?: number
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  onStop,
  placeholder = "Type your message...",
  maxLength = 4000
}: ChatInputProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: speechSupported
  } = useSpeechRecognition()

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
    setIsDragOver(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'text/*': ['.txt', '.md', '.csv'],
      'application/pdf': ['.pdf'],
      'application/json': ['.json'],
      'application/javascript': ['.js'],
      'text/javascript': ['.js'],
      'application/typescript': ['.ts'],
      'text/typescript': ['.ts']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  // Keyboard shortcuts
  useHotkeys('ctrl+enter', () => handleSubmit(), { 
    enableOnFormTags: true,
    preventDefault: true 
  })

  useHotkeys('escape', () => {
    if (isLoading) {
      onStop()
    } else if (files.length > 0) {
      setFiles([])
    }
  })

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e)
    adjustTextareaHeight()
  }

  const handleSubmit = async () => {
    if ((!input.trim() && files.length === 0) || isLoading) return
    
    const content = input.trim()
    const filesToSend = [...files]
    
    // Clear input and files
    if (textareaRef.current) {
      textareaRef.current.value = ''
      textareaRef.current.style.height = 'auto'
    }
    setFiles([])
    
    await onSubmit(content, filesToSend)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Update input with speech transcript
  React.useEffect(() => {
    if (transcript && textareaRef.current) {
      const newValue = input + transcript
      textareaRef.current.value = newValue
      onInputChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>)
    }
  }, [transcript])

  return (
    <div className="border-t bg-background p-4">
      {/* File Attachments */}
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
            >
              {file.type.startsWith('image/') ? (
                <Image className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="max-w-[200px] truncate">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div
        {...getRootProps()}
        className={cn(
          "relative flex items-end gap-2 rounded-lg border bg-background p-2 transition-colors",
          isDragActive && "border-primary bg-primary/5",
          isDragOver && "border-primary bg-primary/10"
        )}
      >
        <input {...getInputProps()} />
        
        {/* Attach Button */}
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={() => document.querySelector('input[type="file"]')?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Text Input */}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent p-2 focus-visible:ring-0"
          maxLength={maxLength}
        />

        {/* Character Count */}
        {input.length > maxLength * 0.8 && (
          <div className="absolute bottom-1 right-16 text-xs text-muted-foreground">
            {input.length}/{maxLength}
          </div>
        )}

        {/* Voice Input Button */}
        {speechSupported && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceInput}
            className={cn(
              "shrink-0",
              isListening && "text-red-500"
            )}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Send/Stop Button */}
        <Button
          onClick={isLoading ? onStop : handleSubmit}
          disabled={(!input.trim() && files.length === 0) && !isLoading}
          size="sm"
          className="shrink-0"
        >
          {isLoading ? (
            <Square className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Drag Overlay */}
      {isDragActive && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-primary/10 backdrop-blur-sm">
          <div className="text-center">
            <Paperclip className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-2 text-sm font-medium text-primary">
              Drop files here to attach
            </p>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>
          Press <kbd className="rounded bg-muted px-1">Enter</kbd> to send, <kbd className="rounded bg-muted px-1">Shift+Enter</kbd> for new line
        </span>
        <span>
          <kbd className="rounded bg-muted px-1">Ctrl+Enter</kbd> to send, <kbd className="rounded bg-muted px-1">Esc</kbd> to stop
        </span>
      </div>
    </div>
  )
}
