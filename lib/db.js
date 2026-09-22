import { createGcsStore } from "./gcs-store.js";
import { createMemoryStore } from "./memory-store.js";

const STORAGE = (process.env.STORAGE || "memory").toLowerCase();

const store = STORAGE === "gcs" ? createGcsStore() : createMemoryStore();
let writeQueue = Promise.resolve();

function enqueue(task) {
  const next = writeQueue.then(task, task);
  writeQueue = next.catch(() => {});
  return next;
}

export function storageName() {
  return store.name;
}

export async function readDb() {
  return store.read();
}

export async function writeDb(data) {
  return store.write(data);
}

export async function getPage(key) {
  const db = await readDb();
  return db[key] ?? null;
}

export async function bumpVisits(key) {
  return enqueue(async () => {
    const db = await readDb();
    if (!db[key]) return null;
    db[key].visits = (db[key].visits || 0) + 1;
    db[key].updatedAt = new Date().toISOString();
    await writeDb(db);
    return db[key];
  });
}

export async function listPages() {
  const db = await readDb();
  return Object.entries(db).map(([key, value]) => ({ key, ...value }));
}
