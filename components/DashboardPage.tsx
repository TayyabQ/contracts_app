"use client";

import React from "react";
import FilePicker from "@/components/FilePicker";
import ContractsList from "@/components/ContractsList";
import { useFetch } from "@/hooks/useFetch";

export default function DashboardPage() {
  const [selectedFileName, setSelectedFileName] = React.useState<string>("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [showContractsList, setShowContractsList] = React.useState(true);
  const { data: uploadData, error: uploadError, loading: uploading, execute, reset: resetUpload } =
    useFetch<
      | { ok: true; name: string; size: number; type: string; savedAs: string; extractedText?: string }
      | { error: string }
    >("/api/upload");

  const { data: aiData, error: aiError, loading: aiLoading, execute: runAnalyze, reset: resetAnalysis } =
    useFetch<{ summary: string; issues: string[]; improvements: string[] } | { error: string }>(
      "/api/analyze"
    );

  // Reset function to clear all states
  const resetStates = () => {
    setSelectedFileName("");
    setSelectedFile(null);
    resetUpload();
    resetAnalysis();
  };

  // If showing contracts list, render only that
  if (showContractsList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Your Contracts
              </h1>
              <p className="text-secondary-foreground mt-2">
                View and manage all your uploaded contracts
              </p>
            </div>
            <button
              onClick={() => setShowContractsList(false)}
              className="btn-secondary flex items-center gap-2 group"
            >
              <svg 
                className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upload New Contract
            </button>
          </div>
          <ContractsList key={Date.now()} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Analyze Your Contract
          </h1>
          <p className="text-secondary-foreground">
            Upload a PDF contract and get instant AI-powered insights
          </p>
        </div>

        {/* Main content - File Picker and Extracted Text side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: File Picker */}
          <div className="card-glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Upload Contract</h2>
            </div>
            
            <FilePicker
              label="Choose a PDF contract"
              onFileSelected={(file) => {
                setSelectedFileName(file.name);
                setSelectedFile(file);
              }}
            />
            
            {selectedFileName && (
              <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-success">Selected: {selectedFileName}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  if (!selectedFile) return;
                  
                  // Clear any previous data before starting new upload
                  resetUpload();
                  resetAnalysis();
                  
                  // Small delay to ensure states are cleared
                  await new Promise(resolve => setTimeout(resolve, 100));
                  
                  console.log('Starting upload for:', selectedFile.name);
                  const formData = new FormData();
                  formData.append("file", selectedFile);
                  const result = await execute({ method: "POST", body: formData });
                  const ok = result.ok && result.data && "ok" in result.data && (result.data as any).ok;
                  
                  console.log('Upload result:', { ok, data: result.data });
                  
                  if (ok) {
                    const extracted = (result.data as any).extractedText;
                    const contractId = (result.data as any).contractId;
                    console.log('Starting analysis with:', { extracted, extractedLength: extracted?.length || 0, contractId });
                    
                    // Check if we have meaningful extracted text (not just a fallback message)
                    const isFallbackMessage = extracted && extracted.includes("PDF content could not be extracted");
                    const hasValidText = extracted && extracted.trim().length > 0 && !isFallbackMessage;
                    
                    if (hasValidText && contractId) {
                      await runAnalyze({
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                          extractedText: extracted,
                          contractId: contractId 
                        }),
                      });
                    } else if (isFallbackMessage) {
                      console.warn('PDF text extraction failed, showing fallback message to user');
                      // Don't start AI analysis if we only have fallback message
                    } else {
                      console.warn('Missing extracted text or contract ID:', { 
                        extracted: !!extracted, 
                        extractedLength: extracted?.length || 0,
                        contractId: !!contractId 
                      });
                    }
                  }
                }}
                disabled={!selectedFile || uploading}
                className="btn-primary flex items-center gap-2 group flex-1"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span>Analyze Contract</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowContractsList(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>View All</span>
              </button>
            </div>

            {uploadError && (
              <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-lg text-error animate-slide-in">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">{uploadError.message}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Extracted Text */}
          <div className="card-glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 gradient-accent rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Extracted Text</h2>
            </div>
            
            <div className="h-96 overflow-y-auto">
              {uploadData && "ok" in uploadData && (uploadData as any).ok && (uploadData as any).extractedText ? (
                <div className="p-4 bg-secondary/50 rounded-lg border border-border h-full">
                  <pre className="text-sm text-secondary-foreground whitespace-pre-wrap leading-relaxed h-full overflow-y-auto">
                    {(uploadData as any).extractedText}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div className="text-muted-foreground">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">Upload a contract to see extracted text</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Results - Below both sections */}
        {uploadData && "ok" in uploadData && (uploadData as any).ok && (
          <div className="card-glass animate-slide-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 gradient-success rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Analysis Results</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="text-muted-foreground text-sm mb-2">File Details</div>
                <div className="font-medium">{(uploadData as any).name}</div>
                <div className="text-sm text-secondary-foreground">{(((uploadData as any).size as number) / 1024).toFixed(2)} KB</div>
              </div>

              {Boolean((uploadData as any).extractedText) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">
                      {aiLoading ? "AI Analysis in Progress..." : "✅ AI Analysis Complete"}
                    </span>
                  </div>
                  
                  {aiLoading && (
                    <div className="space-y-3">
                      <div className="skeleton h-4 w-full"></div>
                      <div className="skeleton h-4 w-3/4"></div>
                      <div className="skeleton h-4 w-1/2"></div>
                    </div>
                  )}
                  
                  {aiError && (
                    <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{aiError.message}</span>
                      </div>
                    </div>
                  )}
                  
                  {aiData && !("error" in aiData) && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="card">
                        <h3 className="font-semibold mb-3 text-primary">Summary</h3>
                        <p className="text-sm leading-6 text-secondary-foreground">{(aiData as any).summary}</p>
                      </div>
                      
                      <div className="card">
                        <h3 className="font-semibold mb-3 text-error">Issues Found</h3>
                        <ul className="space-y-2">
                          {(aiData as any).issues?.map((it: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-error mt-1">•</span>
                              <span className="text-secondary-foreground">{it}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="card">
                        <h3 className="font-semibold mb-3 text-success">Improvements</h3>
                        <ul className="space-y-2">
                          {(aiData as any).improvements?.map((it: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-success mt-1">•</span>
                              <span className="text-secondary-foreground">{it}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


