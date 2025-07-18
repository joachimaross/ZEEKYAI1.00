'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { ChatHeader } from './chat-header'
import { ChatSidebar } from './chat-sidebar'
import { useHotkeys } from 'react-hotkeys-hook'
import { useChatStore } from '@/lib/stores/chat-store'
import { cn } from '@/lib/utils'

export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { 
    currentPersonality, 
    currentModel, 
    conversations, 
    currentConversationId,
    addMessage,
    createConversation,
    setCurrentConversation 
  } = useChatStore()

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
    append,
    setMessages
  } = useChat({
    api: '/api/chat',
    initialMessages: [],
    body: {
      personality: currentPersonality,
      model: currentModel,
      conversationId: currentConversationId
    },
    onResponse: (response) => {
      if (!response.ok) {
        console.error('Chat API error:', response.statusText)
      }
    },
    onFinish: (message) => {
      // Save message to store
      addMessage(currentConversationId, {
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: new Date().toISOString()
      })
    },
    onError: (error) => {
      console.error('Chat error:', error)
    }
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Keyboard shortcuts
  useHotkeys('ctrl+n', () => handleNewConversation(), { preventDefault: true })
  useHotkeys('ctrl+/', () => setSidebarOpen(!sidebarOpen), { preventDefault: true })
  useHotkeys('escape', () => {
    if (isLoading) stop()
    if (sidebarOpen) setSidebarOpen(false)
  })

  const handleNewConversation = () => {
    const newConversationId = createConversation()
    setCurrentConversation(newConversationId)
    setMessages([])
  }

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() && !files?.length) return

    // Handle file uploads if present
    if (files?.length) {
      // TODO: Implement file upload logic
      console.log('Files to upload:', files)
    }

    // Create new conversation if none exists
    if (!currentConversationId) {
      const newConversationId = createConversation()
      setCurrentConversation(newConversationId)
    }

    // Send message
    await append({
      role: 'user',
      content
    })
  }

  const handleRegenerateResponse = () => {
    if (messages.length > 0) {
      const lastUserMessage = messages.findLast(m => m.role === 'user')
      if (lastUserMessage) {
        // Remove the last assistant message and regenerate
        const messagesWithoutLastAssistant = messages.slice(0, -1)
        setMessages(messagesWithoutLastAssistant)
        append(lastUserMessage)
      }
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ChatSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onNewConversation={handleNewConversation}
      />

      {/* Main Chat Area */}
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        sidebarOpen && "lg:ml-64"
      )}>
        {/* Header */}
        <ChatHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNewConversation={handleNewConversation}
          isLoading={isLoading}
          onStop={stop}
        />

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages 
            messages={messages}
            isLoading={isLoading}
            error={error}
            onRegenerate={handleRegenerateResponse}
            onRetry={reload}
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          input={input}
          onInputChange={handleInputChange}
          onSubmit={handleSendMessage}
          isLoading={isLoading}
          onStop={stop}
          placeholder={`Message ZEEKY AI (${currentPersonality} personality)`}
        />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
