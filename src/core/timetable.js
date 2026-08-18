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
