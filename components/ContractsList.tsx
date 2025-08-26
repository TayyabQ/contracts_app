'use client'

import React, { useState, useEffect } from 'react'
import { useFetch } from '@/hooks/useFetch'

interface Contract {
  id: string
  filename: string
  file_size: number
  uploaded_at: string
  extracted_text: string | null
  analysis_results: {
    id: string
    summary: string
    issues: string[]
    improvements: string[]
    analyzed_at: string
  }[] | null
}

interface ContractsResponse {
  contracts: Contract[]
}

export default function ContractsList() {
  const { data, error, loading, execute } = useFetch<ContractsResponse>('/api/contracts')

  // Fetch contracts when component mounts
  React.useEffect(() => {
    const fetchContracts = async () => {
      try {
        await execute({ method: 'GET' })
      } catch (error: any) {
        // Ignore abort errors
        if (error?.name !== 'AbortError') {
          console.error('Error fetching contracts:', error)
        }
      }
    }
    fetchContracts()
  }, [execute])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading contracts...</p>
        </div>
      )}

      {error && error.name !== 'AbortError' && (
        <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error.message}
        </div>
      )}

      {data && data.contracts && data.contracts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No contracts uploaded yet.</p>
          <p className="text-sm mt-1">Close & Upload your first contract to get started!</p>
        </div>
      )}

      {data && data.contracts && data.contracts.length > 0 && (
        <div className="space-y-4">
          {data.contracts.map((contract) => (
            <div key={contract.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{contract.filename}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Uploaded: {formatDate(contract.uploaded_at)} • Size: {formatFileSize(contract.file_size)}
                  </p>
                </div>
              </div>

              {contract.analysis_results && contract.analysis_results.length > 0 ? (
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <h4 className="font-medium text-blue-700 dark:text-blue-300">Summary</h4>
                    <p className="text-sm mt-1">{contract.analysis_results[0].summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-l-4 border-red-500 pl-3">
                      <h4 className="font-medium text-red-700 dark:text-red-300">Issues</h4>
                      <ul className="text-sm mt-1 space-y-1">
                        {contract.analysis_results[0].issues.map((issue, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 pl-3">
                      <h4 className="font-medium text-green-700 dark:text-green-300">Improvements</h4>
                      <ul className="text-sm mt-1 space-y-1">
                        {contract.analysis_results[0].improvements.map((improvement, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Analyzed: {formatDate(contract.analysis_results[0].analyzed_at)}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No analysis available for this contract.</p>
                </div>
              )}

              {contract.extracted_text && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                    View Extracted Text
                  </summary>
                  <pre className="mt-2 text-xs p-3 rounded-md border bg-gray-50 dark:bg-gray-700 overflow-y-auto max-h-40 whitespace-pre-wrap">
                    {contract.extracted_text}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
