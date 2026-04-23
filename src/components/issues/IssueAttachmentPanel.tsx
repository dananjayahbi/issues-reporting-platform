"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import type { IssueAttachment } from "@/types/issue.types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/cn";
import {
  Upload,
  X as _X,
  File,
  Download,
  Trash2,
  ExternalLink as _ExternalLink,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface IssueAttachmentPanelProps {
  issueId: string;
  attachments: IssueAttachment[];
  onUploadComplete?: () => void;
  canUpload?: boolean;
}

export function IssueAttachmentPanel({
  issueId,
  attachments,
  onUploadComplete,
  canUpload = true,
}: IssueAttachmentPanelProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const queryClient = useQueryClient();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        acceptedFiles.forEach((file) => {
          formData.append("files", file);
        });

        await axios.post(`/api/v1/issues/${issueId}/attachments`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              setUploadProgress(
                Math.round((progressEvent.loaded * 100) / progressEvent.total)
              );
            }
          },
        });

        queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
        onUploadComplete?.();
      } catch (error) {
        console.error("Failed to upload attachments:", error);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [issueId, queryClient, onUploadComplete]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc", ".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    disabled: !canUpload,
  });

  const handleDelete = async (attachmentId: string) => {
    try {
      await axios.delete(`/api/v1/issues/${issueId}/attachments/${attachmentId}`);
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
    } catch (error) {
      console.error("Failed to delete attachment:", error);
    }
  };

  const handleDownload = async (attachment: IssueAttachment) => {
    window.open(attachment.url, "_blank");
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return Upload;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUpload && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
            !canUpload && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDrop={() => setDragActive(false)}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Uploading... {uploadProgress}%
              </p>
              <Progress value={uploadProgress} className="max-w-xs mx-auto" />
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Drag & drop files here, or click to select
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Images, PDFs, Word docs, Excel files up to 10MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Attachment List */}
      {attachments.length > 0 ? (
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {attachments.map((attachment) => {
              const FileIcon = getFileIcon(attachment.mimeType);
              return (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex-shrink-0">
                    {attachment.thumbnailUrl ? (
                      <Image
                        src={attachment.thumbnailUrl}
                        alt={attachment.originalName}
                        width={10}
                        height={10}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <FileIcon className="h-5 w-5 text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {attachment.originalName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(attachment.sizeBytes)} •{" "}
                      {formatDistanceToNow(new Date(attachment.uploadedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDelete(attachment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No attachments yet</p>
        </div>
      )}
    </div>
  );
}
