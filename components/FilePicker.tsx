"use client";

import React, { useState, useRef, useCallback } from "react";

export type FilePickerProps = {
  label?: string;
  accept?: string;
  onFileSelected?: (file: File) => void;
  className?: string;
  disabled?: boolean;
};

export default function FilePicker({
  label = "Choose PDF",
  accept = "application/pdf",
  onFileSelected,
  className,
  disabled,
}: FilePickerProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = useCallback((file: File): boolean => {
    const isPdfMime = file.type === "application/pdf";
    const isPdfName = file.name.toLowerCase().endsWith(".pdf");
    
    if (!isPdfMime && !isPdfName) {
      alert("Please select a PDF file.");
      return false;
    }
    
    return true;
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (handleFileValidation(file)) {
      setSelectedFile(file);
      onFileSelected?.(file);
    }
  }, [handleFileValidation, onFileSelected]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileSelect(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-secondary-foreground mb-3">
          {label}
        </label>
      )}
      
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
          ${isDragOver 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${selectedFile ? 'border-success bg-success/5' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        </div>

        <div className="relative z-10">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center">
            {selectedFile ? (
              <div className="w-16 h-16 gradient-success rounded-full flex items-center justify-center animate-glow">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : (
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                ${isDragOver ? 'gradient-primary scale-110' : 'bg-secondary border-2 border-border'}
              `}>
                <svg className={`w-8 h-8 transition-colors duration-300 ${isDragOver ? 'text-black' : 'text-muted-foreground'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            )}
          </div>

          {/* Text */}
          <div className="space-y-2">
            {selectedFile ? (
              <>
                <h3 className="text-lg font-semibold text-success">File Selected!</h3>
                <p className="text-xs text-secondary-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="mt-3 text-xs text-muted-foreground hover:text-error transition-colors"
                >
                  Choose different file
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">
                  {isDragOver ? 'Drop your PDF here' : 'Upload your contract'}
                </h3>
                <p className="text-sm text-secondary-foreground">
                  {isDragOver 
                    ? 'Release to upload' 
                    : 'Drag and drop your PDF file here, or click to browse'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF files up to 10MB
                </p>
              </>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
            className="hidden"
          />
        </div>

        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 rounded-xl flex items-center justify-center">
            <div className="text-primary font-semibold">Drop to upload</div>
          </div>
        )}
      </div>
    </div>
  );
}


