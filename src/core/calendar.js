const EXAM = /시험|고사|평가|학력/;
const OFF = /방학|휴업|휴일|토요/;

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
