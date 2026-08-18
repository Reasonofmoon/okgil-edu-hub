export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  const endpoint = String(req.query?.path || "");
  if (!/^[A-Za-z0-9]+$/.test(endpoint)) {
    res.status(400).json({ error: "bad path" });
    return;
  }
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query || {})) {
    if (k === "path" || v == null) continue;
    q.set(k, Array.isArray(v) ? v[0] : String(v));
  }
  if (process.env.NEIS_KEY && !q.get("KEY")) q.set("KEY", process.env.NEIS_KEY);
  const r = await fetch(`https://open.neis.go.kr/hub/${endpoint}?${q}`);
  const text = await r.text();
  res.status(r.status);
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.send(text);
}
