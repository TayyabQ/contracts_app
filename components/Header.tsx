'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function Header() {
  const { user, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="w-full glass border-b border-white/10 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="relative">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center animate-glow">
                <svg 
                  className="w-6 h-6 text-black" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Contract Analyzer Pro
              </h1>
              <p className="text-xs text-muted-foreground">AI-Powered Analysis</p>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center gap-4 animate-slide-in">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 glass-light rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-secondary-foreground">
                Welcome, <span className="font-medium text-primary">{user?.email}</span>
              </span>
            </div>
            
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="btn-secondary flex items-center gap-2 group"
            >
              {isSigningOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <svg 
                    className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                  </svg>
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
