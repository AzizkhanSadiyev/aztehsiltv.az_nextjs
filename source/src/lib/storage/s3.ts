import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const bucket =
  process.env.S3_BUCKET ||
  process.env.S3_BUCKET_NAME ||
  process.env.AWS_BUCKET_NAME ||
  "";
const region = process.env.S3_REGION || process.env.AWS_REGION || "us-east-1";
const accessKeyId =
  process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey =
  process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";
const endpoint = process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT || undefined;
const forcePathStyle =
  process.env.S3_FORCE_PATH_STYLE === "true" ||
  process.env.AWS_FORCE_PATH_STYLE === "true" ||
  Boolean(endpoint);

export function assertStorageConfig() {
  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("S3 storage configuration is missing");
  }
}

export function getBucketName() {
  return bucket;
}

export function getS3Client() {
  assertStorageConfig();
  return new S3Client({
    region,
    endpoint,
    forcePathStyle,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

const sanitizeSegment = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");

export function buildObjectKey(filename: string, folder?: string) {
  const prefix = (process.env.S3_PREFIX || "uploads").replace(/^\/+|\/+$/g, "");
  const cleanFolder = (folder || "").replace(/^\/+|\/+$/g, "");
  const safeName = sanitizeSegment(filename);
  const unique = randomUUID();
  const parts = [prefix];
  if (cleanFolder) parts.push(cleanFolder);
  parts.push(`${Date.now()}-${unique}-${safeName}`);
  return parts.filter(Boolean).join("/");
}

export function buildPublicUrl(key: string) {
  const cdnPath = process.env.S3_CDN_PATH || process.env.AWS_CDN_PATH || "";
  if (cdnPath) {
    return `${cdnPath.replace(/\/+$/g, "")}/${key}`;
  }

  const publicBase = process.env.S3_PUBLIC_URL || process.env.AWS_PUBLIC_URL || "";
  if (publicBase) {
    return `${publicBase.replace(/\/+$/g, "")}/${key}`;
  }

  if (endpoint) {
    const base = endpoint.replace(/\/+$/g, "");
    if (forcePathStyle) {
      return `${base}/${bucket}/${key}`;
    }
    try {
      const url = new URL(base);
      return `${url.protocol}//${bucket}.${url.host}/${key}`;
    } catch {
      return `${base}/${bucket}/${key}`;
    }
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  contentType: string,
) {
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
}

export async function deleteObject(key: string) {
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}
