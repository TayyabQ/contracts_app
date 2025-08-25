"use client";

import React from "react";
import FilePicker from "@/components/FilePicker";
import { useFetch } from "@/hooks/useFetch";

export default function DashboardPage() {
  const [selectedFileName, setSelectedFileName] = React.useState<string>("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const { data: uploadData, error: uploadError, loading: uploading, execute } =
    useFetch<
      | { ok: true; name: string; size: number; type: string; savedAs: string; extractedText?: string }
      | { error: string }
    >("/api/upload");

  const { data: aiData, error: aiError, loading: aiLoading, execute: runAnalyze } =
    useFetch<{ summary: string; issues: string[]; improvements: string[] } | { error: string }>(
      "/api/analyze"
    );

  return (
    <div className="flex flex-col gap-6 max-w-xl w-full">
      <h1 className="text-2xl font-semibold">Contract Analyzer</h1>
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
            const formData = new FormData();
            formData.append("file", selectedFile);
            const result = await execute({ method: "POST", body: formData });
            const ok = result.ok && result.data && "ok" in result.data && (result.data as any).ok;
            if (ok) {
              const extracted = (result.data as any).extractedText || "";
              if (extracted) {
                await runAnalyze({
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ extractedText: extracted }),
                });
              }
            }
          }}
          disabled={!selectedFile || uploading}
          className="rounded-md border border-solid border-black/[.08] dark:border-white/[.145] px-4 py-2 text-sm font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
      {uploadData && "ok" in uploadData && (uploadData as any).ok && (
        <div className="mt-2 text-sm">
          <div className="font-medium">File uploaded</div>
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
              <div className="text-base font-medium mb-2">AI Analysis</div>
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


