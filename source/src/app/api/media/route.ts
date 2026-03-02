/**
 * Media API Route Handler
 * GET /api/media - List media files with pagination and filtering
 * POST /api/media - Upload new media file
 */

export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { auth } from "@/auth";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  parsePaginationParams,
  withErrorHandling
} from '@/lib/api-helpers';
import { getAllMedia, createMedia } from '@/lib/data/media.data';
import { queryOne } from "@/lib/db";
import {
  assertStorageConfig,
  buildObjectKey,
  buildPublicUrl,
  uploadBuffer,
} from "@/lib/storage/s3";
import { getMediaType, type MediaFilters } from '@/types/media.types';

const STORAGE_TYPE = (process.env.STORAGE_TYPE || "s3").toLowerCase();
const MAX_UPLOAD_SIZE = (() => {
  const raw = Number(process.env.MAX_UPLOAD_SIZE);
  if (Number.isFinite(raw) && raw > 0) return raw;
  return 10 * 1024 * 1024; // 10MB
})();

const sanitizeFolder = (value: string) =>
  value
    .replace(/\\+/g, "/")
    .replace(/[^a-zA-Z0-9/_-]/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");

const resolvePublicDir = () => {
  const cwdPublic = path.join(process.cwd(), "public");
  if (existsSync(cwdPublic)) return cwdPublic;
  const sourcePublic = path.join(process.cwd(), "source", "public");
  if (existsSync(sourcePublic)) return sourcePublic;
  return cwdPublic;
};

/**
 * GET /api/media
 * List all media files with optional pagination and filters
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = parsePaginationParams(searchParams);
    
    // Parse filters
    const filters: MediaFilters = {};
    
    const type = searchParams.get('type');
    if (type === 'image' || type === 'video' || type === 'document' || type === 'other') {
      filters.type = type;
    }
    
    const folder = searchParams.get('folder');
    if (folder) {
      filters.folder = folder;
    }
    
    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }
    
    // Get media
    const result = await getAllMedia({
      page,
      limit,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    });
    
    return paginatedResponse(
      result.media,
      page,
      limit,
      result.total
    );
  });
}

/**
 * POST /api/media
 * Upload a new media file
 * Note: This is a placeholder for file upload handling
 * Actual file upload logic will need to be implemented based on storage solution
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const useLocalStorage = STORAGE_TYPE === "local";
    if (!useLocalStorage) {
      try {
        assertStorageConfig();
      } catch (err) {
        return errorResponse(
          "STORAGE_NOT_CONFIGURED",
          "S3/MinIO storage is not configured",
          500,
        );
      }
    }

    // Parse form data
    const formData = await request.formData();
    
    // Extract file and metadata
    const filesFromForm = (formData.getAll('files') as File[]).filter(Boolean);
    const singleFile = formData.get('file') as File | null;
    const files = filesFromForm.length ? filesFromForm : singleFile ? [singleFile] : [];
    
    if (!files.length) {
      return errorResponse('NO_FILE', 'No file provided', 400);
    }
    
    // Get metadata from form
    const uploadedByRaw = formData.get('uploadedBy') as string;
    const folderRaw = (formData.get('folder') as string) || '';
    const folder = sanitizeFolder(folderRaw);
    
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    let uploadedBy = uploadedByRaw;
    if (!uploadedBy || !uuidRegex.test(uploadedBy)) {
      let sessionUserId = "";
      try {
        const session = await auth();
        if (session?.user?.id && typeof session.user.id === "string") {
          sessionUserId = session.user.id;
        }
      } catch (error) {
        console.error("Media upload auth error:", error);
      }
      if (sessionUserId && uuidRegex.test(sessionUserId)) {
        uploadedBy = sessionUserId;
      }
    }
    if (!uploadedBy || !uuidRegex.test(uploadedBy)) {
      const admin = await queryOne<{ id: string }>(
        "SELECT id FROM users WHERE role = ? AND is_active = 1 ORDER BY created_at ASC LIMIT 1",
        ["admin"],
      );
      if (!admin?.id) {
        return errorResponse(
          "MISSING_USER",
          "Uploaded by user ID is required",
          400,
        );
      }
      uploadedBy = admin.id;
    }
    
    // Validate file size
    for (const file of files) {
      if (file.size > MAX_UPLOAD_SIZE) {
        return errorResponse(
          'FILE_TOO_LARGE',
          'File size exceeds upload limit',
          400
        );
      }
    }

    const created: any[] = [];

    for (const file of files) {
      try {
        const filename = file.name;
        const mimeType = file.type;
        const size = file.size;
        const type = getMediaType(mimeType || "application/octet-stream");

        const buffer = Buffer.from(await file.arrayBuffer());
        let key = buildObjectKey(filename, folder);
        let url = "";
        let storedPath = "";

        if (useLocalStorage) {
          const publicDir = resolvePublicDir();
          const filesystemPath = path.join(publicDir, ...key.split("/"));
          await mkdir(path.dirname(filesystemPath), { recursive: true });
          await writeFile(filesystemPath, buffer);
          url = `/${key}`;
          storedPath = path.posix.join("public", key);
        } else {
          await uploadBuffer(key, buffer, mimeType || "application/octet-stream");
          url = buildPublicUrl(key);
          storedPath = key;
        }

        const width: number | null = null;
        const height: number | null = null;

        const media = await createMedia({
          filename,
          url,
          path: storedPath,
          mimeType,
          type,
          size,
          width,
          height,
          alt: null,
          title: null,
          uploadedBy,
          metadata: {
            folder,
            format: mimeType,
            tags: []
          }
        });

        created.push(media);
      } catch (err) {
        console.error("Media upload failed:", err);
        return errorResponse(
          "UPLOAD_FAILED",
          err instanceof Error ? err.message : "Upload failed",
          500,
          process.env.NODE_ENV === "development" ? err : undefined,
        );
      }
    }

    return successResponse(created.length === 1 ? created[0] : created, 201);
  });
}
