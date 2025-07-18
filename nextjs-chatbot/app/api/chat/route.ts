import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import { NextRequest } from 'next/server'
import { z } from 'zod'

// Create OpenAI API instance
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

// Request schema validation
const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  personality: z.string().optional().default('default'),
  model: z.string().optional().default('gpt-4o-mini'),
  conversationId: z.string().optional(),
  temperature: z.number().min(0).max(2).optional().default(0.8),
  maxTokens: z.number().min(1).max(4000).optional().default(2000)
})

// Personality system prompts
const personalityPrompts = {
  default: "You are ZEEKY AI, a helpful and knowledgeable AI assistant. You provide accurate, helpful, and engaging responses while being friendly and professional.",
  
  creative: "You are ZEEKY AI in creative mode. You're imaginative, artistic, and love to think outside the box. You help users with creative projects, brainstorming, and artistic endeavors with enthusiasm and original ideas.",
  
  professional: "You are ZEEKY AI in professional mode. You communicate in a formal, business-appropriate manner. You're precise, efficient, and focused on delivering clear, actionable information for professional contexts.",
  
  friendly: "You are ZEEKY AI in friendly mode. You're warm, conversational, and approachable. You use casual language, show empathy, and make users feel comfortable while still being helpful and informative.",
  
  technical: "You are ZEEKY AI in technical mode. You're detail-oriented, precise, and excel at explaining complex technical concepts. You provide thorough technical information, code examples, and step-by-step instructions.",
  
  humorous: "You are ZEEKY AI in humorous mode. You're witty, playful, and like to inject appropriate humor into conversations. You use jokes, puns, and light-hearted commentary while still being helpful and informative."
}

// Model configurations
const modelConfigs = {
  'gpt-4o-mini': {
    model: 'gpt-4o-mini',
    maxTokens: 4000,
    temperature: 0.8
  },
  'gpt-4': {
    model: 'gpt-4',
    maxTokens: 8000,
    temperature: 0.7
  },
  'gpt-3.5-turbo': {
    model: 'gpt-3.5-turbo',
    maxTokens: 4000,
    temperature: 0.8
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const { messages, personality, model, conversationId, temperature, maxTokens } = requestSchema.parse(body)

    // Get model configuration
    const modelConfig = modelConfigs[model as keyof typeof modelConfigs] || modelConfigs['gpt-4o-mini']

    // Build system message with personality
    const systemMessage = {
      role: 'system' as const,
      content: personalityPrompts[personality as keyof typeof personalityPrompts] || personalityPrompts.default
    }

    // Prepare messages for OpenAI
    const openaiMessages = [
      systemMessage,
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    // Call OpenAI API
    const response = await openai.createChatCompletion({
      model: modelConfig.model,
      messages: openaiMessages,
      temperature: temperature || modelConfig.temperature,
      max_tokens: maxTokens || modelConfig.maxTokens,
      stream: true,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response, {
      onStart: async () => {
        // Log conversation start
        console.log(`Chat started - Conversation: ${conversationId}, Model: ${model}, Personality: ${personality}`)
      },
      onToken: async (token: string) => {
        // Log tokens for analytics (optional)
        // console.log('Token:', token)
      },
      onCompletion: async (completion: string) => {
        // Log completion for analytics
        console.log(`Chat completed - Length: ${completion.length} characters`)
        
        // TODO: Save conversation to database
        // await saveConversation(conversationId, messages, completion)
      }
    })

    // Return a StreamingTextResponse, which can be consumed by the client
    return new StreamingTextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Conversation-Id': conversationId || 'new'
      }
    })

  } catch (error) {
    console.error('Chat API error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format', 
          details: error.errors 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Handle OpenAI API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return new Response(
          JSON.stringify({ 
            error: 'API configuration error',
            message: 'OpenAI API key not configured'
          }), 
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      if (error.message.includes('rate limit')) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.'
          }), 
          { 
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Generic error response
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again.'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
