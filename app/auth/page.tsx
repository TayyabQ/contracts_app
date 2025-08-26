'use client'

import React, { useState } from 'react'
import AuthForm from '@/components/AuthForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col items-center gap-6">
          <AuthForm mode={mode} />
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1"
            >
              {mode === 'login' ? 'Create one here' : 'Sign in here'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
