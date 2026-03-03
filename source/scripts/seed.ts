/**
 * Database Seeding Script
 * Seeds the database with initial data
 */

import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import fs from "fs/promises";
import { randomUUID } from "crypto";

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envFile = process.env.ENV_FILE || ".env";
const envPath = path.isAbsolute(envFile)
  ? envFile
  : path.join(__dirname, "..", envFile);
dotenv.config({ path: envPath });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "strafig_web",
  charset: "utf8mb4",
};

/**
 * Main seeding function
 */
async function seed(): Promise<void> {
  let connection: mysql.Connection | null = null;

  try {
    console.log("Connecting to database...");
    connection = await mysql.createConnection(dbConfig);
    const db = connection;
    console.log("Connected to database");

    console.log("\nSeeding database with initial data...\n");

    const usersPath = path.join(__dirname, "../data/users.json");
    let seedUsers: any[] = [];
    try {
      const file = await fs.readFile(usersPath, "utf-8");
      seedUsers = JSON.parse(file);
    } catch {
      console.log("No seed users file found. Skipping user seed.");
    }

    if (seedUsers.length > 0) {
      const admin = seedUsers[0];
      const [existing] = await db.query<mysql.RowDataPacket[]>(
        "SELECT id FROM users WHERE email = ?",
        [admin.email],
      );

      if (existing.length > 0) {
        console.log("Admin user already exists. Skipping user seed.");
      } else {
        await db.query(
          `INSERT INTO users (id, email, name, avatar, role, password, is_active, last_login_at, created_at, updated_at, permissions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            admin.id,
            admin.email,
            admin.name,
            admin.avatar ?? null,
            admin.role || "admin",
            admin.password,
            admin.isActive === false ? 0 : 1,
            null,
            admin.createdAt ? new Date(admin.createdAt) : new Date(),
            admin.updatedAt ? new Date(admin.updatedAt) : new Date(),
            JSON.stringify(admin.permissions || []),
          ],
        );
        console.log("Admin user created from data/users.json");
      }
    }

    const slugify = (value: string): string => {
      return value
        .normalize("NFKD")
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ə/g, "e")
        .replace(/ı/g, "i")
        .replace(/ş/g, "s")
        .replace(/ğ/g, "g")
        .replace(/ç/g, "c")
        .replace(/ö/g, "o")
        .replace(/ü/g, "u")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    };

    const categoriesSeed = [
      { name: "CANLI", order: 1 },
      { name: "PRESS-RELIZLAR", order: 2 },
      { name: "SHORTS", order: 3 },
      { name: "KƏŞF ET", order: 4 },
      { name: "VERİLİŞLƏR", order: 5 },
      { name: "Bütün bölmələr", parentName: "KƏŞF ET", order: 1 },
      { name: "Təhsil", parentName: "KƏŞF ET", order: 2 },
      { name: "Uğur hekayələri", parentName: "KƏŞF ET", order: 3 },
      { name: "Reportajlar", parentName: "KƏŞF ET", order: 4 },
      { name: "Layihələr", parentName: "KƏŞF ET", order: 5 },
      { name: "Xaricdə təhsil", parentName: "KƏŞF ET", order: 6 },
      { name: "Metodik körpü", parentName: "VERİLİŞLƏR", order: 1 },
      { name: "Uşaqlar və biz", parentName: "VERİLİŞLƏR", order: 2 },
      { name: "Podkast", parentName: "VERİLİŞLƏR", order: 3 },
      { name: "Təhsil saatı", parentName: "VERİLİŞLƏR", order: 4 },
    ];

    const normalizeLocalized = (value: unknown): Record<string, string> => {
      let raw: unknown = value;
      if (typeof raw === "string") {
        try {
          raw = JSON.parse(raw);
        } catch {
          return {};
        }
      }
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
      const result: Record<string, string> = {};
      for (const [key, entry] of Object.entries(raw as Record<string, unknown>)) {
        if (typeof entry === "string") {
          result[key] = entry;
        }
      }
      return result;
    };

    const normalizeSlugValue = (value: unknown): string | null => {
      if (!value) return null;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("{")) {
          try {
            const parsed = normalizeLocalized(trimmed);
            const first = Object.values(parsed).find((v) => v.trim().length > 0);
            return first || null;
          } catch {
            return trimmed;
          }
        }
        return trimmed;
      }
      if (typeof value === "object") {
        const parsed = normalizeLocalized(value);
        const first = Object.values(parsed).find((v) => v.trim().length > 0);
        return first || null;
      }
      return null;
    };

    const [existingCategories] = await db.query<
      mysql.RowDataPacket[]
    >("SELECT id, slug FROM categories");

    const existingBySlug = new Map<string, string>();
    for (const row of existingCategories) {
      const firstSlug = normalizeSlugValue(row.slug);
      if (firstSlug) existingBySlug.set(String(firstSlug), String(row.id));
    }

    const idByName = new Map<string, string>();

    const insertCategory = async (item: {
      name: string;
      parentName?: string;
      order: number;
    }) => {
      const slug = slugify(item.name);
      const existingId = existingBySlug.get(slug);
      if (existingId) {
        idByName.set(item.name, existingId);
        return;
      }

      const id = randomUUID();
      const parentId = item.parentName
        ? idByName.get(item.parentName) || null
        : null;

      const localizedValue = { az: item.name, en: item.name, ru: item.name };
      await db.query(
        `INSERT INTO categories
         (id,
          name, slug, description,
          parent_id, icon, color, \`order\`, positions, is_active,
          created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          JSON.stringify(localizedValue),
          slug,
          null,
          parentId,
          null,
          "#6366f1",
          item.order,
          JSON.stringify([1, 2]),
          1,
          new Date(),
          new Date(),
        ],
      );

      idByName.set(item.name, id);
      existingBySlug.set(slug, id);
    };

    const parents = categoriesSeed.filter((c) => !c.parentName);
    const children = categoriesSeed.filter((c) => c.parentName);

    for (const parent of parents) {
      await insertCategory(parent);
    }
    for (const child of children) {
      await insertCategory(child);
    }

    if (categoriesSeed.length > 0) {
      console.log(`Seeded categories (if missing): ${categoriesSeed.length}`);
    }

    console.log("\nDatabase seeding completed!\n");
    if (seedUsers.length > 0) {
      console.log("Default admin account:");
      console.log(`Email: ${seedUsers[0].email}`);
      console.log("Password: (use the hashed password from data/users.json)");
      console.log("\nPlease change the default password after first login.\n");
    }
  } catch (error) {
    console.error("\nSeeding failed:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run seeding if this script is executed directly
const isDirectRun = (() => {
  try {
    const invoked = pathToFileURL(process.argv[1]).href;
    return import.meta.url === invoked;
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  seed()
    .then(() => process.exit(0))
    .catch(error => {
      console.error("Seeding error:", error);
      process.exit(1);
    });
}

export default seed;
