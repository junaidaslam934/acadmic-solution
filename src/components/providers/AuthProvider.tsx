'use client'

import { SessionProvider } from 'next-auth/react'
import SessionMonitor from '@/components/auth/SessionMonitor'
import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

// Simple inactivity tracker component
function InactivityTracker() {
  const { status } = useSession()

  useEffect(() => {
    if (status !== 'authenticated') return

    let inactivityTimer: NodeJS.Timeout
    let warningTimer: NodeJS.Timeout
    const INACTIVITY_TIME = 30 * 60 * 1000 // 30 minutes
    const WARNING_TIME = 5 * 60 * 1000 // 5 minutes before timeout

    const resetTimers = () => {
      clearTimeout(inactivityTimer)
      clearTimeout(warningTimer)

      // Set warning timer
      warningTimer = setTimeout(() => {
        const shouldContinue = confirm(
          'Your session will expire in 5 minutes due to inactivity. Click OK to continue.'
        )
        if (shouldContinue) {
          resetTimers()
        }
      }, INACTIVITY_TIME - WARNING_TIME)

      // Set logout timer
      inactivityTimer = setTimeout(() => {
        alert('Session expired due to inactivity. Please log in again.')
        signOut({ callbackUrl: '/login' })
      }, INACTIVITY_TIME)
    }

    // Activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      resetTimers()
    }

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Initialize timers
    resetTimers()

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
      clearTimeout(inactivityTimer)
      clearTimeout(warningTimer)
    }
  }, [status])

  return null
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      {children}
      <SessionMonitor />
      <InactivityTracker />
    </SessionProvider>
  )
}