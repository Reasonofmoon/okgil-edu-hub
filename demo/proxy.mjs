import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dir, "..");
function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const i = s.indexOf("=");
    if (i < 1) continue;
    const k = s.slice(0, i).trim();
    const v = s.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
    if (k && process.env[k] == null) process.env[k] = v;
  }
}
loadEnv(path.join(ROOT, ".env"));
const PORT = Number(process.env.PORT || 4177);
const HUB = "https://open.neis.go.kr/hub";
const NEIS_KEY = process.env.NEIS_KEY || "";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".d.ts": "text/plain; charset=utf-8",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "content-type": type,
    "access-control-allow-origin": "*",
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/api/neis") {
    const endpoint = url.searchParams.get("path");
    if (!endpoint || !/^[A-Za-z0-9]+$/.test(endpoint)) {
      send(res, 400, JSON.stringify({ error: "bad path" }), "application/json");
      return;
    }
    const q = new URLSearchParams(url.searchParams);
    q.delete("path");
    if (NEIS_KEY && !q.get("KEY")) q.set("KEY", NEIS_KEY);
    try {
      const r = await fetch(`${HUB}/${endpoint}?${q}`);
      const text = await r.text();
      send(res, r.status, text, "application/json; charset=utf-8");
    } catch (e) {
      send(res, 502, JSON.stringify({ error: String(e) }), "application/json");
    }
    return;
  }

  let file = url.pathname === "/" ? "/demo/index.html" : url.pathname;
  file = path.posix.normalize(file).replace(/^(\.\.\/)+/, "").replace(/^[/\\]+/, "");
  const abs = path.join(ROOT, file);
  const rel = path.relative(ROOT, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel) || /(?:^|[\\/])\.env(?:$|[\\/])/i.test(rel)) {
    send(res, 403, "forbidden");
    return;
  }
  fs.readFile(abs, (err, data) => {
    if (err) {
      send(res, 404, "not found");
      return;
    }
    send(res, 200, data, MIME[path.extname(abs)] || "application/octet-stream");
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`okgil-edu-hub demo  http://127.0.0.1:${PORT}`);
});
