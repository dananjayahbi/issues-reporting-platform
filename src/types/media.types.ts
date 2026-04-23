// =============================================================================
// MEDIA TYPES — LLC-Lanka Issue Tracker Platform
// =============================================================================

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  uploadedBy: string;
  uploadedAt: Date;
  folder: MediaFolder;
}

export type MediaFolder =
  | "images"
  | "annotated"
  | "thumbnails"
  | "avatars"
  | "attachments"
  | "exports";

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

export interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: "pending" | "uploading" | "processing" | "complete" | "error";
  error?: string;
  result?: UploadedFile;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
  hasAlpha: boolean;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  quality?: number;
}

export interface ThumbnailOptions extends ResizeOptions {
  size: number;
}

export interface MediaListResponse {
  files: MediaFile[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DeleteMediaPayload {
  filename: string;
  folder: MediaFolder;
}
