import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(__dirname, "..", "data", "pages.json");

export async function loadSeed() {
  const raw = await readFile(SEED_PATH, "utf8");
  return JSON.parse(raw);
}

export function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}
