const HUB = "https://open.neis.go.kr/hub";

function ymd(d = new Date()) {
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}`;
}

export function seoulNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
}

export function formatYmd(d) {
  return ymd(d instanceof Date ? d : seoulNow());
}

export function parseYmd(s) {
  if (!s || s.length < 8) return null;
  return new Date(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)));
}

export function formatKoDate(d) {
  const x = d instanceof Date ? d : seoulNow();
  return `${x.getFullYear()}년 ${x.getMonth() + 1}월 ${x.getDate()}일`;
}

function rowsOf(json, key) {
  const block = json?.[key];
  if (!Array.isArray(block) || block.length < 2) {
    const err = json?.RESULT || block?.[0]?.head?.[0]?.RESULT;
    if (json?.RESULT?.CODE && json.RESULT.CODE !== "INFO-000") {
      throw new Error(json.RESULT.MESSAGE || json.RESULT.CODE);
    }
    return [];
  }
  const head = block[0]?.head || [];
  const result = head.find((h) => h.RESULT)?.RESULT;
  if (result && result.CODE && result.CODE !== "INFO-000") {
    if (result.CODE === "INFO-200") return [];
    throw new Error(result.MESSAGE || result.CODE);
  }
  return block[1]?.row || [];
}

export async function neisGet(endpoint, params, options = {}) {
  const q = new URLSearchParams({
    Type: "json",
    pIndex: "1",
    pSize: String(params.pSize || 100),
    ...Object.fromEntries(
      Object.entries(params).filter(([k, v]) => v != null && v !== "" && k !== "pSize")
    ),
  });
  if (options.neisKey) q.set("KEY", options.neisKey);

  let url;
  if (options.proxyUrl) {
    const u = new URL(options.proxyUrl, typeof location !== "undefined" ? location.origin : "http://localhost");
    u.searchParams.set("path", endpoint);
    for (const [k, v] of q) u.searchParams.set(k, v);
    url = u.toString();
  } else {
    url = `${HUB}/${endpoint}?${q}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`NEIS ${res.status}`);
  const json = await res.json();
  return rowsOf(json, endpoint);
}

export async function fetchSchoolInfo(options = {}) {
  return neisGet("schoolInfo", {
    ATPT_OFCDC_SC_CODE: options.officeCode || "J10",
    SD_SCHUL_CODE: options.schoolCode,
    SCHUL_NM: options.name,
  }, options);
}

export async function fetchSchedule(school, range, options = {}) {
  return neisGet("SchoolSchedule", {
    ATPT_OFCDC_SC_CODE: school.officeCode,
    SD_SCHUL_CODE: school.schoolCode,
    AA_FROM_YMD: range.from,
    AA_TO_YMD: range.to,
  }, options);
}

export async function fetchMeals(school, dateYmd, options = {}) {
  return neisGet("mealServiceDietInfo", {
    ATPT_OFCDC_SC_CODE: school.officeCode,
    SD_SCHUL_CODE: school.schoolCode,
    MLSV_YMD: dateYmd,
  }, options);
}

export async function fetchTimetable(school, dateYmd, extra = {}, options = {}) {
  const { timetableEndpoint } = await import("./schools.js");
  const ep = timetableEndpoint(school);
  return neisGet(ep, {
    ATPT_OFCDC_SC_CODE: school.officeCode,
    SD_SCHUL_CODE: school.schoolCode,
    ALL_TI_YMD: dateYmd,
    GRADE: extra.grade,
    CLASS_NM: extra.className,
  }, options);
}
