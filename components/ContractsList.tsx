'use client'

import React from 'react'
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
      } catch (error: unknown) {
        // Ignore abort errors
        if (error && typeof error === 'object' && 'name' in error && error.name !== 'AbortError') {
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
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-full animate-spin mb-4">
            <div className="w-8 h-8 bg-black rounded-full"></div>
          </div>
          <p className="text-secondary-foreground">Loading your contracts...</p>
        </div>
      )}

      {error && typeof error === 'object' && 'name' in error && error.name !== 'AbortError' && (
        <div className="p-6 bg-error/10 border border-error/20 rounded-xl text-error animate-slide-in">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error.message}</span>
          </div>
        </div>
      )}

      {data && data.contracts && data.contracts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No contracts yet</h3>
          <p className="text-secondary-foreground">Upload your first contract to get started with AI analysis</p>
        </div>
      )}

      {data && data.contracts && data.contracts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.contracts.map((contract, index) => (
            <div 
              key={contract.id} 
              className="card-glass animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 
                      className="font-semibold text-base sm:text-lg" 
                      style={{ 
                        wordBreak: 'break-word', 
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal'
                      }}
                    >
                      {contract.filename}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{formatFileSize(contract.file_size)}</span>
                      <span>•</span>
                      <span>{formatDate(contract.uploaded_at)}</span>
                    </div>
                  </div>
                </div>
                
                {contract.analysis_results && contract.analysis_results.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-success/10 border border-success/20 rounded-full">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs font-medium text-success">Analyzed</span>
                  </div>
                )}
              </div>

              {/* Analysis Results */}
              {contract.analysis_results && contract.analysis_results.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h4 className="font-medium text-primary">Summary</h4>
                    </div>
                    <p className="text-sm text-secondary-foreground line-clamp-3">
                      {contract.analysis_results[0].summary}
                    </p>
                  </div>

                  {/* Issues and Improvements */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-error/5 border border-error/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="font-medium text-error">Issues ({contract.analysis_results[0].issues.length})</h4>
                      </div>
                      <ul className="space-y-1">
                        {contract.analysis_results[0].issues.slice(0, 2).map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs">
                            <span className="text-error mt-1">•</span>
                            <span className="text-secondary-foreground line-clamp-2">{issue}</span>
                          </li>
                        ))}
                        {contract.analysis_results[0].issues.length > 2 && (
                          <li className="text-xs text-muted-foreground">
                            +{contract.analysis_results[0].issues.length - 2} more issues
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="font-medium text-success">Improvements ({contract.analysis_results[0].improvements.length})</h4>
                      </div>
                      <ul className="space-y-1">
                        {contract.analysis_results[0].improvements.slice(0, 2).map((improvement, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs">
                            <span className="text-success mt-1">•</span>
                            <span className="text-secondary-foreground line-clamp-2">{improvement}</span>
                          </li>
                        ))}
                        {contract.analysis_results[0].improvements.length > 2 && (
                          <li className="text-xs text-muted-foreground">
                            +{contract.analysis_results[0].improvements.length - 2} more improvements
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Analyzed: {formatDate(contract.analysis_results[0].analyzed_at)}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 bg-secondary rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">No analysis available</p>
                </div>
              )}

              {/* Extracted Text Toggle */}
              {contract.extracted_text && (
                <details className="mt-4 group">
                  <summary className="cursor-pointer text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-2 transition-colors">
                    <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    View Extracted Text
                  </summary>
                  <div className="mt-3 p-4 bg-secondary/50 rounded-lg border border-border">
                    <pre className="text-xs text-secondary-foreground overflow-y-auto max-h-40 whitespace-pre-wrap leading-relaxed">
                      {contract.extracted_text}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
