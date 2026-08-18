export function mapSchool(row) {
  const kind = row.SCHUL_KND_SC_NM || "";
  const blob = `${row.SCHUL_NM || ""} ${row.ORG_RDNMA || ""} ${row.ORG_RDNDA || ""}`;
  return {
    officeCode: row.ATPT_OFCDC_SC_CODE,
    officeName: row.ATPT_OFCDC_SC_NM,
    schoolCode: row.SD_SCHUL_CODE,
    name: row.SCHUL_NM,
    kind,
    supportOffice: row.JU_ORG_NM,
    found: row.FOND_SC_NM,
    address: String(row.ORG_RDNMA || "").trim(),
    detail: row.ORG_RDNDA || "",
    tel: row.ORG_TELNO || "",
    homepage: row.HMPG_ADRES || "",
    founded: row.FOND_YMD,
    highType: row.HS_SC_NM,
    area: /옥길/.test(blob) ? "okgil" : "bucheon",
    endpoint: kind.includes("고등") ? "hisTimetable" : kind.includes("중학") ? "misTimetable" : "elsTimetable",
  };
}

export function mapAcademy(row) {
  const addr = `${row.FA_RDNMA || ""} ${row.FA_RDNDA || ""}`.replace(/\s+/g, " ").trim();
  const name = row.ACA_NM || "";
  return {
    id: row.ACA_ASNUM,
    name,
    kind: row.ACA_INSTI_SC_NM || "학원",
    realm: row.REALM_SC_NM || "",
    course: row.LE_CRSE_NM || "",
    status: row.REG_STTUS_NM || "",
    address: addr,
    tel: row.FA_TELNO || "",
    area: /옥길/.test(`${addr} ${name}`) ? "okgil" : "bucheon",
    isLeadmaster: name === "리드마스터보습학원",
  };
}

export async function loadCatalog(base = "/data/neis") {
  const grab = async (file, fallback) => {
    try {
      const r = await fetch(`${base}/${file}`);
      if (!r.ok) return fallback;
      return await r.json();
    } catch {
      return fallback;
    }
  };
  const [manifest, schools, academies] = await Promise.all([
    grab("manifest.json", null),
    grab("schoolInfo-bucheon.json", []),
    grab("acaInsTiInfo-bucheon.json", []),
  ]);
  return {
    manifest,
    schools: (schools || []).map(mapSchool),
    academies: (academies || [])
      .filter((r) => r.REG_STTUS_NM === "개원")
      .map(mapAcademy),
  };
}
