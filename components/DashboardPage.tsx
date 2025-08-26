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
      <div className="flex flex-col gap-6 max-w-4xl w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">All Contracts</h1>
          <button
            onClick={() => setShowContractsList(false)}
            className="bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-md transition-colors border border-gray-300 dark:border-gray-600"
          >
            Close
          </button>
        </div>
        <ContractsList key={Date.now()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl w-full">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Upload a PDF contract to analyze.
      </p>
      <FilePicker
        label="Choose a PDF contract"
        onFileSelected={(file) => {
          setSelectedFileName(file.name);
          setSelectedFile(file);
        }}
      />
      {selectedFileName && (
        <div className="text-sm">
          Selected: <span className="font-medium">{selectedFileName}</span>
        </div>
      )}
      <div className="flex gap-3">
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
              console.log('Starting analysis with:', { extractedLength: extracted.length, contractId });
              
              if (extracted && contractId) {
                await runAnalyze({
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                    extractedText: extracted,
                    contractId: contractId 
                  }),
                });
              } else {
                console.warn('Missing extracted text or contract ID:', { extracted: !!extracted, contractId: !!contractId });
              }
            }
          }}
          disabled={!selectedFile || uploading}
          className="rounded-md border border-solid border-black/[.08] dark:border-white/[.145] px-4 py-2 text-sm font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <button
          onClick={() => setShowContractsList(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors flex-1"
        >
          View All Contracts
        </button>
      </div>
      {uploadData && "ok" in uploadData && (uploadData as any).ok && (
        <div className="mt-2 text-sm">
          <div className="font-medium text-green-600">✅ File uploaded successfully!</div>
          <ul className="list-disc list-inside">
            <li>Name: {(uploadData as any).name}</li>
            <li>Type: {(uploadData as any).type}</li>
            <li>Size: {(((uploadData as any).size as number) / 1024).toFixed(2)} KB</li>
            <li>Saved as: {(uploadData as any).savedAs}</li>
          </ul>

          {Boolean((uploadData as any).extractedText) && (
            <div className="mt-4">
              <div className="text-base font-medium mb-1">Extracted Content</div>
              <pre className="whitespace-pre-wrap text-xs p-3 rounded-md border bg-gray-50 dark:bg-gray-800 overflow-y-auto max-h-80">{(uploadData as any).extractedText}</pre>
            </div>
          )}
          {Boolean((uploadData as any).extractedText) && (
            <div className="mt-4">
              <div className="text-base font-medium mb-2">
                {aiLoading ? "AI Analysis" : "✅ AI Analysis Complete"}
              </div>
              {aiLoading && <div className="text-sm">Analyzing with AI...</div>}
              {aiError && (
                <div className="text-sm text-red-600">{aiError.message}</div>
              )}
              {aiData && !("error" in aiData) && (
                <div className="text-sm flex flex-col gap-4">
                  <div className="border rounded-md p-3 bg-white/40 dark:bg-black/20">
                    <div className="font-semibold mb-2">Summary</div>
                    <p className="whitespace-pre-wrap text-sm leading-6">{(aiData as any).summary}</p>
                  </div>
                  <div className="border rounded-md p-3 bg-white/40 dark:bg-black/20">
                    <div className="font-semibold mb-2">Issues</div>
                    <ul className="list-disc list-inside space-y-1">
                      {(aiData as any).issues?.map((it: string, idx: number) => (
                        <li key={idx}>{it}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="border rounded-md p-3 bg-white/40 dark:bg-black/20">
                    <div className="font-semibold mb-2">Improvements</div>
                    <ul className="list-disc list-inside space-y-1">
                      {(aiData as any).improvements?.map((it: string, idx: number) => (
                        <li key={idx}>{it}</li>
                      ))}
                    </ul>
                  </div>
                  {/* <div className="mt-4">
                    <button
                      onClick={resetStates}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
                    >
                      Upload Another Contract
                    </button>
                  </div> */}

                </div>
              )}
              {aiData && "error" in aiData && (
                <div className="text-sm text-red-600">{(aiData as any).error}</div>
              )}
            </div>
          )}
        </div>
      )}
      {uploadError && (
        <div className="mt-2 text-sm text-red-600">{uploadError.message}</div>
      )}
      {uploadData && "error" in uploadData && (
        <div className="mt-2 text-sm text-red-600">{(uploadData as any).error}</div>
      )}
    </div>
  );
}


