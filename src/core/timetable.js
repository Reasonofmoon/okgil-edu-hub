const KO = /국어|읽기|쓰기|독서|화법|언어와매체/;
const EN = /영어|영독|영미/;

export function countLiteracy(rows) {
  let ko = 0;
  let en = 0;
  for (const r of rows) {
    const t = r.ITRT_CNTNT || "";
    if (KO.test(t)) ko += 1;
    if (EN.test(t)) en += 1;
  }
  return { ko, en, total: rows.length };
}

export function lastPeriod(rows) {
  if (!rows.length) return null;
  const sorted = [...rows].sort((a, b) => Number(a.PERIO) - Number(b.PERIO));
  return sorted[sorted.length - 1];
}

function classKey(r) {
  return `${r.GRADE || ""}-${r.CLASS_NM || ""}`;
}

/** One grade/class, subjects only. Drops vacation shells and the all-class dump. */
export function pickClassTimetable(rows = [], prefer = {}) {
  const named = rows.filter((r) => String(r.ITRT_CNTNT || "").trim());
  if (!named.length) return [];
  const groups = new Map();
  for (const r of named) {
    const k = classKey(r);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }
  let chosen = null;
  if (prefer.grade != null && prefer.className) {
    chosen = groups.get(`${prefer.grade}-${prefer.className}`) || null;
  }
  if (!chosen) {
    const keys = [...groups.keys()].sort((a, b) => {
      const [ag, ac] = a.split("-");
      const [bg, bc] = b.split("-");
      return Number(ag) - Number(bg) || String(ac).localeCompare(String(bc), "ko");
    });
    chosen = groups.get(keys[0]) || [];
  }
  const byPeriod = new Map();
  for (const r of chosen) {
    const p = String(r.PERIO || "");
    if (p && !byPeriod.has(p)) byPeriod.set(p, r);
  }
  return [...byPeriod.values()].sort((a, b) => Number(a.PERIO) - Number(b.PERIO));
}

export function classLabel(rows = []) {
  const r = rows[0];
  if (!r) return "";
  const g = r.GRADE ? `${r.GRADE}학년` : "";
  const c = r.CLASS_NM ? `${r.CLASS_NM}반` : "";
  return `${g} ${c}`.trim();
}
