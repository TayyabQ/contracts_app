'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthForm from '@/components/AuthForm'

function AuthPageContent() {
  const searchParams = useSearchParams()
  const mode = (searchParams.get('mode') as 'login' | 'signup') || 'login'

  return (
    <div className="min-h-screen bg-black">
      <AuthForm mode={mode} />
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
