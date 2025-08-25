"use client";

import React from "react";

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
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isPdfMime = file.type === "application/pdf";
    const isPdfName = file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfMime && !isPdfName) {
      alert("Please select a PDF file.");
      event.currentTarget.value = "";
      return;
    }

    onFileSelected?.(file);
  };

  return (
    <label className={className}>
      <span className="inline-block mb-2 text-sm font-medium">{label}</span>
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-foreground file:text-background hover:file:bg-[#383838] dark:hover:file:bg-[#ccc]"
      />
    </label>
  );
}


