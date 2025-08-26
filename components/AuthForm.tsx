'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  
  const { signIn, signUp, user } = useAuth()
  const router = useRouter()

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user) {
      // Small delay to ensure auth state is properly updated
      setTimeout(() => {
        router.replace('/')
      }, 100)
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          // Successful login - redirect will be handled by useEffect
        }
      } else {
        const { error } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else {
          setMessage('Check your email for the confirmation link!')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-md w-full">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          {mode === 'login' 
            ? 'Welcome back! Sign in to your account.' 
            : 'Create a new account to get started.'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            {error}
          </div>
        )}

        {message && (
          <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {loading 
            ? (mode === 'login' ? 'Signing In...' : 'Creating Account...')
            : (mode === 'login' ? 'Sign In' : 'Create Account')
          }
        </button>
      </form>
    </div>
  )
}
