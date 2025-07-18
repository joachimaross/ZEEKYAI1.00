import { Suspense } from 'react'
import { ChatInterface } from '@/components/chat/chat-interface'
import { WelcomeScreen } from '@/components/welcome/welcome-screen'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col">
      <Suspense fallback={<LoadingSpinner />}>
        <ChatInterface />
      </Suspense>
    </div>
  )
}

// Optional: Add a welcome screen for first-time users
export function HomePageWithWelcome() {
  return (
    <div className="flex h-screen flex-col">
      <Suspense fallback={<LoadingSpinner />}>
        <WelcomeScreen />
        <ChatInterface />
      </Suspense>
    </div>
  )
}
