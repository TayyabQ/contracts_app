'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import AuthForm from '@/components/AuthForm'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const mode = (searchParams.get('mode') as 'login' | 'signup') || 'login'

  return (
    <div className="min-h-screen bg-black">
      <AuthForm mode={mode} />
    </div>
  )
}
