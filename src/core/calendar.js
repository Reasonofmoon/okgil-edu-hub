const EXAM = /시험|고사|평가|학력/;
const OFF = /방학|휴업|휴일|토요/;
const RANK = { exam: 0, off: 1, event: 2 };

export function tagEvent(name = "") {
  if (EXAM.test(name)) return "exam";
  if (OFF.test(name)) return "off";
  return "event";
}

export function monthRange(year, month) {
  const from = `${year}${String(month).padStart(2, "0")}01`;
  const last = new Date(year, month, 0).getDate();
  const to = `${year}${String(month).padStart(2, "0")}${String(last).padStart(2, "0")}`;
  return { from, to };
}

export function examWeeks(rows) {
  const weeks = [];
  for (const r of rows) {
    if (tagEvent(r.EVENT_NM) !== "exam") continue;
    weeks.push({
      date: r.AA_YMD,
      name: r.EVENT_NM,
      schoolCode: r.SD_SCHUL_CODE,
    });
  }
  return weeks;
}

export function yearSpan(now, past = 1, future = 1) {
  const y = now.getFullYear();
  return { from: `${y - past}0101`, to: `${y + future}1231` };
}

export function ymdOf(d) {
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}`;
}

export function formatMd(ymd = "") {
  const s = String(ymd);
  if (s.length < 8) return s;
  return `${Number(s.slice(4, 6))}/${Number(s.slice(6, 8))}`;
}

export function weekBounds(now) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const near = new Date(d);
  near.setDate(d.getDate() + 13);
  return {
    today: ymdOf(d),
    weekFrom: ymdOf(monday),
    weekTo: ymdOf(sunday),
    nearTo: ymdOf(near),
    monday,
    sunday,
  };
}

export function curateWeek(schedule = [], now) {
  const b = weekBounds(now);
  const week = (schedule || []).filter((r) => {
    const y = String(r.AA_YMD || "");
    return y >= b.weekFrom && y <= b.weekTo;
  });
  const examsWeek = week.filter((r) => tagEvent(r.EVENT_NM) === "exam");
  const nearExams = (schedule || []).filter((r) => {
    const y = String(r.AA_YMD || "");
    return tagEvent(r.EVENT_NM) === "exam" && y >= b.today && y <= b.nearTo;
  });
  const offs = week.filter((r) => tagEvent(r.EVENT_NM) === "off");
  const events = week.filter((r) => tagEvent(r.EVENT_NM) === "event");
  week.sort((a, c) => (RANK[tagEvent(a.EVENT_NM)] - RANK[tagEvent(c.EVENT_NM)]) || String(a.AA_YMD).localeCompare(String(c.AA_YMD)));
  return {
    bounds: b,
    week,
    exams: examsWeek.length ? examsWeek : nearExams,
    examsThisWeek: examsWeek,
    nearExams,
    offs,
    events,
  };
}
