import { cloneData, loadSeed } from "./seed.js";

const METADATA_TOKEN_URL =
  "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable ${name} para STORAGE=gcs`);
  return value;
}

async function getAccessToken() {
  if (process.env.GCS_ACCESS_TOKEN) return process.env.GCS_ACCESS_TOKEN;

  const res = await fetch(METADATA_TOKEN_URL, {
    headers: { "Metadata-Flavor": "Google" }
  });

  if (!res.ok) {
    throw new Error(`No se pudo obtener token de metadata: ${res.status}`);
  }

  const json = await res.json();
  return json.access_token;
}

function objectUrls(bucket, object) {
  const encoded = encodeURIComponent(object);
  return {
    download: `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encoded}?alt=media`,
    upload: `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encoded}`
  };
}

export function createGcsStore() {
  const bucket = required("GCS_BUCKET");
  const object = process.env.GCS_OBJECT || "pages.json";
  const urls = objectUrls(bucket, object);

  return {
    name: "gcs",
    async read() {
      const token = await getAccessToken();
      const res = await fetch(urls.download, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 404) {
        const seed = cloneData(await loadSeed());
        await this.write(seed);
        return seed;
      }

      if (!res.ok) {
        throw new Error(`GCS read failed: ${res.status}`);
      }

      return res.json();
    },
    async write(data) {
      const token = await getAccessToken();
      const body = JSON.stringify(data, null, 2);
      const res = await fetch(urls.upload, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`GCS write failed: ${res.status} ${detail}`);
      }
    }
  };
}
