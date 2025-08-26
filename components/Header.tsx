'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="w-full flex justify-between items-center py-4 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Contract Analyzer
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Welcome, {user?.email}
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
