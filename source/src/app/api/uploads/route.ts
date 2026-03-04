/**
 * Upload API Route Handler
 * POST /api/uploads - Upload a single file to public/uploads
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import {
    successResponse,
    errorResponse,
    withErrorHandling,
} from "@/lib/api-helpers";
import { createMedia } from "@/lib/data/media.data";
import { queryOne } from "@/lib/db";
import { getMediaType } from "@/types/media.types";

const MAX_UPLOAD_SIZE = (() => {
    const raw = Number(process.env.MAX_UPLOAD_SIZE);
    if (Number.isFinite(raw) && raw > 0) return raw;
    return 50 * 1024 * 1024; // 50MB default
})();

const sanitizeFilename = (value: string) =>
    value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9._-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^\.+/, "");

const sanitizePathSegment = (value: string) =>
    value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");

const resolvePublicDir = () => {
    const cwdPublic = path.join(process.cwd(), "public");
    if (existsSync(cwdPublic)) return cwdPublic;
    const sourcePublic = path.join(process.cwd(), "source", "public");
    if (existsSync(sourcePublic)) return sourcePublic;
    return cwdPublic;
};

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const resolveUploadedBy = async (formData: FormData) => {
    const uploadedByRaw = formData.get("uploadedBy") as string;
    if (uploadedByRaw && uuidRegex.test(uploadedByRaw)) {
        return uploadedByRaw;
    }

    try {
        const session = await auth();
        if (session?.user?.id && uuidRegex.test(session.user.id)) {
            return session.user.id;
        }
    } catch (error) {
        console.error("Upload auth error:", error);
    }

    const admin = await queryOne<{ id: string }>(
        "SELECT id FROM users WHERE role = ? AND is_active = 1 ORDER BY created_at ASC LIMIT 1",
        ["admin"],
    );
    return admin?.id ?? "";
};

export async function POST(request: NextRequest) {
    return withErrorHandling(async () => {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return errorResponse("NO_FILE", "No file provided", 400);
        }

        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (!isImage && !isVideo) {
            return errorResponse(
                "INVALID_FILE",
                "Only image or video files are allowed",
                400,
            );
        }

        if (file.size > MAX_UPLOAD_SIZE) {
            return errorResponse(
                "FILE_TOO_LARGE",
                "File size exceeds upload limit",
                400,
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name);
        const base = sanitizeFilename(path.basename(file.name, ext)) || "file";
        const filename = `${base}-${randomUUID()}${ext}`;

        const rawEntity = String(formData.get("entity") || "");
        const rawEntitySlug = String(formData.get("entitySlug") || "");
        const rawField = String(formData.get("field") || "");

        const entity = sanitizePathSegment(rawEntity) || "misc";
        const entitySlug = sanitizePathSegment(rawEntitySlug);
        const field = sanitizePathSegment(rawField);

        const now = new Date();
        const year = String(now.getFullYear());
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        const relativeParts = ["uploads", entity];
        if (entitySlug) relativeParts.push(entitySlug);
        if (field) relativeParts.push(field);
        relativeParts.push(year, month, day);

        const relativeDir = path.posix.join(...relativeParts);
        const publicDir = resolvePublicDir();
        const uploadsDir = path.join(publicDir, ...relativeParts);
        const filepath = path.join(uploadsDir, filename);

        await mkdir(uploadsDir, { recursive: true });
        await writeFile(filepath, buffer);

        const uploadedBy = await resolveUploadedBy(formData);
        if (!uploadedBy) {
            return errorResponse(
                "MISSING_USER",
                "Uploaded by user ID is required",
                400,
            );
        }

        const storedPath = path.posix.join(relativeDir, filename);
        const url = `/${storedPath}`;
        const type = getMediaType(file.type || "application/octet-stream");
        const folder = [entity, entitySlug, field].filter(Boolean).join("/") || entity;

        const media = await createMedia({
            filename,
            url,
            path: storedPath,
            mimeType: file.type || "application/octet-stream",
            type,
            size: file.size,
            width: null,
            height: null,
            alt: null,
            title: null,
            uploadedBy,
            metadata: {
                folder,
                entity,
                entitySlug,
                field,
                originalName: file.name,
                format: file.type || "application/octet-stream",
                tags: [],
            },
        });

        return successResponse(
            {
                url,
                filename,
                path: storedPath,
                size: file.size,
                type: file.type,
                media,
            },
            201,
        );
    });
}
