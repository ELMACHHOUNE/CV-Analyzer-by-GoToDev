import React, { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { Label } from "./ui/label";

type Props = {
  file: File | null;
  setFile: (f: File | null) => void;
};

export const FileUpload: React.FC<Props> = ({ file, setFile }) => {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f && f.type === "application/pdf") setFile(f);
    },
    [setFile],
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="cv-upload">Upload CV (PDF)</Label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative rounded-lg border-2 transition-all duration-200 p-8 flex flex-col items-center justify-center cursor-pointer ${
          dragOver
            ? "border-primary-600 bg-primary-50 shadow-md"
            : "border-primary-200 bg-white hover:border-primary-400"
        }`}
      >
        <Upload className="w-10 h-10 text-primary-600 mb-2" />
        <p className="text-primary-900 font-medium text-center">
          Drag & drop your PDF here, or click to select
        </p>
        <p className="text-sm text-gray-500 mt-1">PDF files only</p>

        {file && (
          <p className="text-sm text-green-600 mt-3 font-semibold">
            ✓ Selected: {file.name}
          </p>
        )}

        <input
          id="cv-upload"
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            if (f && f.type === "application/pdf") setFile(f);
          }}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default FileUpload;
