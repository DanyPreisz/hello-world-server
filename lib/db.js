import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "pages.json");

async function ensureDb() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readDb() {
  await ensureDb();
  const raw = await readFile(DB_PATH, "utf8");
  return JSON.parse(raw);
}

export async function writeDb(data) {
  await ensureDb();
  const tmp = `${DB_PATH}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await rename(tmp, DB_PATH);
}

export async function getPage(key) {
  const db = await readDb();
  return db[key] ?? null;
}

export async function bumpVisits(key) {
  const db = await readDb();
  if (!db[key]) return null;
  db[key].visits = (db[key].visits || 0) + 1;
  db[key].updatedAt = new Date().toISOString();
  await writeDb(db);
  return db[key];
}

export async function listPages() {
  const db = await readDb();
  return Object.entries(db).map(([key, value]) => ({ key, ...value }));
}
