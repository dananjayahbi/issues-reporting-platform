"use client";

import { useState, useCallback, useRef } from "react";
import axios from "axios";
import type { UploadProgress, UploadedFile } from "@/types/media.types";

const api = axios.create({
  baseURL: "/api/v1",
});

export function useMediaUpload(options: {
  folder?: "images" | "attachments" | "avatars";
  maxSizeMb?: number;
  onUploadComplete?: (file: UploadedFile) => void;
  onError?: (error: string) => void;
} = {}) {
  const { folder = "images", maxSizeMb = 10, onUploadComplete, onError } = options;

  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const upload = useCallback(
    async (file: File): Promise<UploadedFile | null> => {
      const fileId = `${Date.now()}-${file.name}`;

      // Validate file size
      if (file.size > maxSizeMb * 1024 * 1024) {
        onError?.(`File "${file.name}" exceeds maximum size of ${maxSizeMb}MB`);
        return null;
      }

      // Set initial progress
      setUploads((prev) => {
        const next = new Map(prev);
        next.set(fileId, {
          fileId,
          filename: file.name,
          progress: 0,
          status: "pending",
        });
        return next;
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const controller = new AbortController();
      abortControllers.current.set(fileId, controller);

      try {
        // Update to uploading
        setUploads((prev) => {
          const next = new Map(prev);
          next.set(fileId, { ...next.get(fileId)!, status: "uploading" });
          return next;
        });

        const { data } = await api.post<UploadedFile>("/media/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: controller.signal,
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
              : 0;

            setUploads((prev) => {
              const next = new Map(prev);
              next.set(fileId, { ...next.get(fileId)!, progress, status: "processing" });
              return next;
            });
          },
        });

        // Update to complete
        setUploads((prev) => {
          const next = new Map(prev);
          next.set(fileId, { ...next.get(fileId)!, progress: 100, status: "complete", result: data });
          return next;
        });

        onUploadComplete?.(data);
        return data;
      } catch (error) {
        if (axios.isCancel(error)) {
          setUploads((prev) => {
            const next = new Map(prev);
            next.delete(fileId);
            return next;
          });
          return null;
        }

        const message = error instanceof Error ? error.message : "Upload failed";
        setUploads((prev) => {
          const next = new Map(prev);
          next.set(fileId, { ...next.get(fileId)!, status: "error", error: message });
          return next;
        });

        onError?.(message);
        return null;
      } finally {
        abortControllers.current.delete(fileId);
      }
    },
    [folder, maxSizeMb, onUploadComplete, onError]
  );

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<UploadedFile[]> => {
      const results: UploadedFile[] = [];
      for (const file of files) {
        const result = await upload(file);
        if (result) results.push(result);
      }
      return results;
    },
    [upload]
  );

  const cancelUpload = useCallback((fileId: string) => {
    const controller = abortControllers.current.get(fileId);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(fileId);
    }
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads((prev) => {
      const next = new Map(prev);
      for (const [id, upload] of next.entries()) {
        if (upload.status === "complete" || upload.status === "error") {
          next.delete(id);
        }
      }
      return next;
    });
  }, []);

  const getUploadProgress = useCallback(
    (fileId: string) => uploads.get(fileId),
    [uploads]
  );

  return {
    uploads: Array.from(uploads.values()),
    upload,
    uploadMultiple,
    cancelUpload,
    clearCompleted,
    getUploadProgress,
  };
}
