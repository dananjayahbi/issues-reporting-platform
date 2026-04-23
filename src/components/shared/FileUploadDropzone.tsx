"use client";

import * as React from "react";
import { useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils/cn";
import { Upload, File, X, Loader2 as _Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

export function FileUploadDropzone({
  onFilesSelected,
  accept = { "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"] },
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  disabled = false,
  className,
}: FileUploadDropzoneProps) {
  const [files, setFiles] = React.useState<FileWithPreview[]>([]);
  const [_isUploading, _setIsUploading] = React.useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const filesWithPreview: FileWithPreview[] = acceptedFiles.map((file) => {
        const f = file as unknown as Record<string, unknown>;
        return Object.assign(f, {
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
        }) as unknown as FileWithPreview;
      });
      setFiles((prev) => [...prev, ...filesWithPreview]);
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const file = newFiles[index];
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-muted p-3">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {isDragActive ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to select files
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Max {maxFiles} files, up to {Math.round(maxSize / 1024 / 1024)}MB each
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              {file.preview ? (
                <Image
                  src={file.preview}
                  alt={file.name}
                  width={10}
                  height={10}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                  <File className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
