import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bumpVisits, getPage, listPages } from "./lib/db.js";
import { parseUrl, sendFile, sendJson, sendText } from "./lib/http.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = Number(process.env.PORT) || 3000;

const PAGE_ROUTES = {
  "/": "home",
  "/about": "about"
};

function safePublicPath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const relative = decoded.replace(/^\/+/, "");
  const resolved = path.resolve(PUBLIC_DIR, relative);
  if (!resolved.startsWith(PUBLIC_DIR)) return null;
  return resolved;
}

async function handleApi(req, res, url) {
  if (req.method !== "GET") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  if (url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, uptime: process.uptime() });
    return;
  }

  if (url.pathname === "/api/pages") {
    sendJson(res, 200, { ok: true, data: await listPages() });
    return;
  }

  const pageMatch = url.pathname.match(/^\/api\/pages\/([^/]+)$/);
  if (pageMatch) {
    const page = await getPage(pageMatch[1]);
    if (!page) {
      sendJson(res, 404, { ok: false, error: "Page not found" });
      return;
    }
    sendJson(res, 200, { ok: true, data: page });
    return;
  }

  sendJson(res, 404, { ok: false, error: "API route not found" });
}

async function handlePage(res, key) {
  const page = await bumpVisits(key);
  if (!page) {
    sendText(res, 404, "Page not found");
    return;
  }
  await sendFile(res, path.join(PUBLIC_DIR, "index.html"));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = parseUrl(req);

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      res.end();
      return;
    }

    console.log(`${new Date().toISOString()} ${req.method} ${url.pathname}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    const pageKey = PAGE_ROUTES[url.pathname];
    if (pageKey && req.method === "GET") {
      await handlePage(res, pageKey);
      return;
    }

    if (req.method === "GET") {
      const filePath = safePublicPath(url.pathname);
      if (filePath) {
        await sendFile(res, filePath);
        return;
      }
    }

    sendText(res, 404, "Not found");
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { ok: false, error: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Servidor vanilla en http://localhost:${PORT}`);
  console.log("Rutas: /  /about  /api/pages  /api/health");
});
