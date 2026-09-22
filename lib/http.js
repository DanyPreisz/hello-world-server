import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

export function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  res.end(body);
}

export function sendText(res, status, text, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Content-Length": Buffer.byteLength(text)
  });
  res.end(text);
}

export async function sendFile(res, filePath) {
  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      sendText(res, 404, "Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Content-Length": info.size,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600"
    });
    createReadStream(filePath).pipe(res);
  } catch {
    sendText(res, 404, "Not found");
  }
}

export function parseUrl(req, hostFallback = "localhost") {
  const host = req.headers.host || hostFallback;
  return new URL(req.url, `http://${host}`);
}
