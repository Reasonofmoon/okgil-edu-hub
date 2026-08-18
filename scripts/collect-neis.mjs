import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "neis");
const HUB = "https://open.neis.go.kr/hub";
const OFFICE = process.env.OFFICE_CODE || "J10";

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
    if (k && process.env[k] == null) process.env[k] = v;
  }
}

loadEnv(path.join(ROOT, ".env"));
const KEY = process.env.NEIS_KEY;
if (!KEY) {
  console.error("NEIS_KEY 가 없습니다. .env.example 을 .env 로 복사한 뒤 키만 넣으세요.");
  process.exit(2);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function rowsOf(json, key) {
  const block = json?.[key];
  if (!Array.isArray(block) || block.length < 2) {
    if (json?.RESULT?.CODE && json.RESULT.CODE !== "INFO-000") {
      throw new Error(json.RESULT.MESSAGE || json.RESULT.CODE);
    }
    return { rows: [], total: 0 };
  }
  const head = block[0]?.head || [];
  const result = head.find((h) => h.RESULT)?.RESULT;
  if (result && result.CODE && result.CODE !== "INFO-000") {
    if (result.CODE === "INFO-200") return { rows: [], total: 0 };
    throw new Error(result.MESSAGE || result.CODE);
  }
  const total = Number(head.find((h) => h.list_total_count != null)?.list_total_count || 0);
  return { rows: block[1]?.row || [], total };
}

async function neis(endpoint, params) {
  const q = new URLSearchParams({ Type: "json", pIndex: "1", pSize: "100", KEY, ...params });
  const url = `${HUB}/${endpoint}?${q}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NEIS ${res.status} ${endpoint}`);
  return rowsOf(await res.json(), endpoint);
}

async function neisAll(endpoint, params) {
  const pSize = 100;
  let pIndex = 1;
  let total = Infinity;
  const all = [];
  while ((pIndex - 1) * pSize < total) {
    const { rows, total: t } = await neis(endpoint, {
      ...params,
      pIndex: String(pIndex),
      pSize: String(pSize),
    });
    if (t) total = t;
    else if (rows.length < pSize) total = all.length + rows.length;
    all.push(...rows);
    console.log(`  ${endpoint} ${all.length}/${Number.isFinite(total) ? total : "?"}`);
    if (!rows.length) break;
    pIndex += 1;
    await sleep(200);
  }
  return all;
}

function write(name, data) {
  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, name);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log("wrote", path.relative(ROOT, file), Array.isArray(data) ? data.length : "");
}

function inBucheon(row) {
  const blob = [row.ORG_RDNMA, row.ORG_RDNDA, row.LCTN_SC_NM, row.JU_ORG_NM, row.ADRES, row.FA_RDNMA]
    .filter(Boolean)
    .join(" ");
  return blob.includes("부천");
}

function inOkgil(row) {
  const blob = [row.SCHUL_NM, row.ACA_INST_NM, row.ORG_RDNMA, row.ORG_RDNDA, row.ADRES]
    .filter(Boolean)
    .join(" ");
  return blob.includes("옥길");
}

function ymd(d) {
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}`;
}

async function main() {
  console.log("NEIS 전수 수집  office=", OFFICE);
  const schools = await neisAll("schoolInfo", { ATPT_OFCDC_SC_CODE: OFFICE });
  write("schoolInfo-J10.json", schools);

  const academies = await neisAll("acaInsTiInfo", { ATPT_OFCDC_SC_CODE: OFFICE });
  write("acaInsTiInfo-J10.json", academies);

  const bucheonSchools = schools.filter(inBucheon);
  const okgilSchools = schools.filter(inOkgil);
  const bucheonAcas = academies.filter((r) => inBucheon(r) || inOkgil(r));
  write("schoolInfo-bucheon.json", bucheonSchools);
  write("schoolInfo-okgil.json", okgilSchools);
  write("acaInsTiInfo-bucheon.json", bucheonAcas);

  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const from = ymd(new Date(now.getFullYear(), now.getMonth(), 1));
  const to = ymd(new Date(now.getFullYear(), now.getMonth() + 2, 0));
  const targets = okgilSchools.length ? okgilSchools : bucheonSchools.slice(0, 20);
  const schedules = {};
  for (const s of targets) {
    const code = s.SD_SCHUL_CODE;
    try {
      const { rows } = await neis("SchoolSchedule", {
        ATPT_OFCDC_SC_CODE: s.ATPT_OFCDC_SC_CODE || OFFICE,
        SD_SCHUL_CODE: code,
        AA_FROM_YMD: from,
        AA_TO_YMD: to,
        pSize: "100",
      });
      schedules[code] = { name: s.SCHUL_NM, from, to, rows };
      console.log("  schedule", s.SCHUL_NM, rows.length);
    } catch (e) {
      schedules[code] = { name: s.SCHUL_NM, error: String(e) };
    }
    await sleep(200);
  }
  write(`SchoolSchedule-${from}-${to}.json`, schedules);

  const manifest = {
    collectedAt: now.toISOString(),
    office: OFFICE,
    counts: {
      schoolsJ10: schools.length,
      academiesJ10: academies.length,
      schoolsBucheon: bucheonSchools.length,
      schoolsOkgil: okgilSchools.length,
      academiesBucheon: bucheonAcas.length,
      schedules: Object.keys(schedules).length,
    },
    range: { from, to },
  };
  write("manifest.json", manifest);
  console.log(JSON.stringify(manifest.counts, null, 2));
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
