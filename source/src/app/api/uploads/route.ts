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
import {
    successResponse,
    errorResponse,
    withErrorHandling,
} from "@/lib/api-helpers";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

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

export async function POST(request: NextRequest) {
    return withErrorHandling(async () => {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return errorResponse("NO_FILE", "No file provided", 400);
        }

        if (!file.type.startsWith("image/")) {
            return errorResponse("INVALID_FILE", "Only image files are allowed", 400);
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

        return successResponse(
            {
                url: `/${relativeDir}/${filename}`,
                filename,
                path: `${relativeDir}/${filename}`,
                size: file.size,
                type: file.type,
            },
            201,
        );
    });
}
