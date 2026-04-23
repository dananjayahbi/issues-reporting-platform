import { prisma } from "@/lib/db/prisma";
import { AuditService } from "./AuditService";
import { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from "@/lib/utils/constants";
import type { MediaFile, MediaFolder } from "@/types/media.types";

// =============================================================================
// MEDIA SERVICE — LLC-Lanka Issue Tracker Platform
// =============================================================================

export class MediaService {
  /**
   * Validate file type
   */
  static validateFileType(mimeType: string): boolean {
    return ALLOWED_MIME_TYPES.includes(mimeType);
  }

  /**
   * Validate file size
   */
  static validateFileSize(sizeBytes: number): boolean {
    return sizeBytes <= MAX_FILE_SIZE_BYTES;
  }

  /**
   * Save media file record
   */
  static async saveFileRecord(data: {
    filename: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    uploadedBy: string;
    folder: MediaFolder;
  }): Promise<MediaFile> {
    const file = await prisma.mediaFile.create({
      data: {
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl ?? null,
        width: data.width ?? null,
        height: data.height ?? null,
        uploadedBy: data.uploadedBy,
        folder: data.folder,
      },
    });

    return this.formatMediaFile(file);
  }

  /**
   * Get media file by filename
   */
  static async getFileByFilename(filename: string): Promise<MediaFile | null> {
    const file = await prisma.mediaFile.findUnique({
      where: { filename },
    });

    return file ? this.formatMediaFile(file) : null;
  }

  /**
   * List media files
   */
  static async listFiles(params: {
    folder?: MediaFolder;
    mimeType?: string;
    uploadedBy?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ files: MediaFile[]; total: number }> {
    const { folder, mimeType, uploadedBy, page = 1, pageSize = 20 } = params;

    const where: Record<string, unknown> = {};
    if (folder) where.folder = folder;
    if (mimeType) where.mimeType = mimeType;
    if (uploadedBy) where.uploadedBy = uploadedBy;

    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        orderBy: { uploadedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.mediaFile.count({ where }),
    ]);

    return {
      files: files.map((f) => this.formatMediaFile(f)),
      total,
    };
  }

  /**
   * Delete a media file
   */
  static async deleteFile(
    filename: string,
    deletedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    const file = await prisma.mediaFile.findUnique({
      where: { filename },
    });

    if (!file) return { success: false, error: "File not found" };

    await prisma.$transaction(async (tx) => {
      await tx.mediaFile.delete({ where: { filename } });
      return AuditService.log({
        action: "ATTACHMENT_DELETED",
        userId: deletedBy,
        entityType: "media",
        entityId: filename,
        details: `File "${file.originalName}" deleted`,
      });
    });

    return { success: true };
  }

  /**
   * Get file URL by filename
   */
  static async getFileUrl(filename: string): Promise<string | null> {
    const file = await prisma.mediaFile.findUnique({
      where: { filename },
      select: { url: true },
    });

    return file?.url || null;
  }

  /**
   * Get files by issue ID
   */
  static async getFilesByIssueId(issueId: string): Promise<MediaFile[]> {
    const attachments = await prisma.issueAttachment.findMany({
      where: { issueId },
      orderBy: { uploadedAt: "desc" },
    });

    // Get full file records
    const filenames = attachments.map((a) => a.filename);
    const files = await prisma.mediaFile.findMany({
      where: { filename: { in: filenames } },
    });

    return files.map((f) => this.formatMediaFile(f));
  }

  /**
   * Attach file to issue
   */
  static async attachToIssue(
    issueId: string,
    filename: string,
    uploadedBy: string
  ): Promise<void> {
    await prisma.issueAttachment.create({
      data: {
        issueId,
        filename,
        uploadedBy,
      },
    });

    await AuditService.log({
      action: "ATTACHMENT_UPLOADED",
      userId: uploadedBy,
      entityType: "issue",
      entityId: issueId,
      metadata: { filename },
      details: `File "${filename}" attached to issue`,
    });
  }

  /**
   * Remove attachment from issue
   */
  static async removeFromIssue(
    issueId: string,
    filename: string,
    removedBy: string
  ): Promise<void> {
    await prisma.issueAttachment.deleteMany({
      where: { issueId, filename },
    });

    await AuditService.log({
      action: "ATTACHMENT_DELETED",
      userId: removedBy,
      entityType: "issue",
      entityId: issueId,
      metadata: { filename },
      details: `File "${filename}" removed from issue`,
    });
  }

  // Helper to format media file
  private static formatMediaFile(file: Record<string, unknown>): MediaFile {
    const result: MediaFile = {
      id: file.id as string,
      filename: file.filename as string,
      originalName: file.originalName as string,
      mimeType: file.mimeType as string,
      sizeBytes: file.sizeBytes as number,
      url: file.url as string,
      uploadedBy: file.uploadedBy as string,
      uploadedAt: file.uploadedAt as Date,
      folder: file.folder as MediaFolder,
    };
    if (file.thumbnailUrl) result.thumbnailUrl = file.thumbnailUrl as string;
    if (file.width) result.width = file.width as number;
    if (file.height) result.height = file.height as number;
    return result;
  }
}
