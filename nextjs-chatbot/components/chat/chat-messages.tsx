'use client'

import { Message } from 'ai'
import { ChatMessage } from './chat-message'
import { TypingIndicator } from './typing-indicator'
import { ErrorMessage } from './error-message'
import { EmptyState } from './empty-state'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle } from 'lucide-react'

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  error?: Error
  onRegenerate?: () => void
  onRetry?: () => void
}

export function ChatMessages({ 
  messages, 
  isLoading, 
  error, 
  onRegenerate, 
  onRetry 
}: ChatMessagesProps) {
  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <ErrorMessage 
          error={error} 
          onRetry={onRetry}
        />
      </div>
    )
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id || index}
            message={message}
            isLast={index === messages.length - 1}
            onRegenerate={
              message.role === 'assistant' && index === messages.length - 1 
                ? onRegenerate 
                : undefined
            }
          />
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="chat-message assistant">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
