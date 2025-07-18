'use client'

import { Message } from 'ai'
import { useState } from 'react'
import { Copy, Check, RefreshCw, User, Bot, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { CodeBlock } from '@/components/ui/code-block'
import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { formatDistanceToNow } from 'date-fns'

interface ChatMessageProps {
  message: Message
  isLast?: boolean
  onRegenerate?: () => void
}

export function ChatMessage({ message, isLast, onRegenerate }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const { copyToClipboard } = useCopyToClipboard()

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type)
    // TODO: Send feedback to analytics
    console.log(`Feedback: ${type} for message:`, message.id)
  }

  const isUser = message.role === 'user'
  const timestamp = message.createdAt || new Date()

  return (
    <div className={cn(
      "group flex gap-3 p-4 rounded-lg transition-colors hover:bg-muted/50",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-secondary text-secondary-foreground"
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 space-y-2",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Message Header */}
        <div className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span className="font-medium">
            {isUser ? "You" : "ZEEKY AI"}
          </span>
          <span>•</span>
          <span title={timestamp.toLocaleString()}>
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
        </div>

        {/* Message Body */}
        <div className={cn(
          "prose prose-sm max-w-none dark:prose-invert",
          isUser 
            ? "bg-primary text-primary-foreground rounded-lg p-3" 
            : "bg-transparent"
        )}>
          {isUser ? (
            <p className="m-0 whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {/* Message Actions */}
        <div className={cn(
          "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
          isUser ? "justify-end" : "justify-start"
        )}>
          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 px-2"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>

          {/* Regenerate Button (for assistant messages) */}
          {!isUser && isLast && onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              className="h-6 px-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}

          {/* Feedback Buttons (for assistant messages) */}
          {!isUser && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('up')}
                className={cn(
                  "h-6 px-2",
                  feedback === 'up' && "text-green-600"
                )}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('down')}
                className={cn(
                  "h-6 px-2",
                  feedback === 'down' && "text-red-600"
                )}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
