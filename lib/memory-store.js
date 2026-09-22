import { cloneData, loadSeed } from "./seed.js";

export function createMemoryStore() {
  let cache = null;

  async function ensure() {
    if (!cache) cache = cloneData(await loadSeed());
    return cache;
  }

  return {
    name: "memory",
    async read() {
      return cloneData(await ensure());
    },
    async write(data) {
      cache = cloneData(data);
    }
  };
}
