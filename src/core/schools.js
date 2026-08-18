/** 옥길 생활권 학교 마스터. NEIS 실호출(2026-08-18) 값만 넣음. */
export const OFFICE_CODE = "J10";

export const OKGIL_SCHOOLS = [
  {
    officeCode: "J10",
    officeName: "경기도교육청",
    schoolCode: "7581259",
    name: "옥길버들초등학교",
    kind: "초등학교",
    supportOffice: "경기도부천교육지원청",
    found: "공립",
    address: "경기도 부천시 양지로 234-25",
    detail: "(옥길동)",
    tel: "070-7847-0114",
    homepage: "https://okbeodeul-e.goebc.kr",
    founded: "20160301",
    endpoint: "elsTimetable",
  },
  {
    officeCode: "J10",
    officeName: "경기도교육청",
    schoolCode: "7581260",
    name: "옥길산들초등학교",
    kind: "초등학교",
    supportOffice: "경기도부천교육지원청",
    found: "공립",
    address: "경기도 부천시 옥길로 31",
    detail: "(옥길동, 옥길 산들초등학교)",
    tel: "070-7016-3205",
    homepage: "http://oksd-e.goebc.kr",
    founded: "20160822",
    endpoint: "elsTimetable",
  },
  {
    officeCode: "J10",
    officeName: "경기도교육청",
    schoolCode: "7581258",
    name: "옥길중학교",
    kind: "중학교",
    supportOffice: "경기도부천교육지원청",
    found: "공립",
    address: "경기도 부천시 양지로 234-41",
    detail: "(옥길동, 옥길중학교)",
    tel: "070-7013-9120",
    homepage: "https://okgil-m.goebc.kr",
    founded: "20160822",
    endpoint: "misTimetable",
  },
  {
    officeCode: "J10",
    officeName: "경기도교육청",
    schoolCode: "7581293",
    name: "옥길새길중학교",
    kind: "중학교",
    supportOffice: "경기도부천교육지원청",
    found: "공립",
    address: "경기도 부천시 소사구 양지로166번길 45",
    detail: "옥길새길중학교(옥길동)",
    tel: "032-860-6254",
    homepage: "https://okgilsaegil-mh.goebc.kr/okgilsaegil-m/main.do",
    founded: "20250301",
    endpoint: "misTimetable",
  },
  {
    officeCode: "J10",
    officeName: "경기도교육청",
    schoolCode: "7531599",
    name: "옥길새길고등학교",
    kind: "고등학교",
    supportOffice: "경기도교육청",
    found: "공립",
    address: "경기도 부천시 소사구 양지로166번길 45",
    detail: "(옥길동)",
    tel: "032-860-0254",
    homepage: "https://okgilsaegil-m.goebc.kr/okgilsaegil-m/main.do",
    highType: "특성화고",
    founded: "20260301",
    endpoint: "hisTimetable",
  },
];

export const ACADEMY_POIS = [
  { id: "lm", name: "리드마스터 영어·국어 문해력", kind: "학원", note: "허브 운영 주체", area: "옥길" },
  { id: "lib-kkum", name: "옥길 꿈자라는 작은도서관", kind: "도서관", note: "LH1단지", area: "옥길" },
];

export function schoolByCode(code, list = OKGIL_SCHOOLS) {
  return list.find((s) => s.schoolCode === code) || list[0];
}

export function timetableEndpoint(school) {
  if (school?.endpoint) return school.endpoint;
  if (school?.kind === "고등학교") return "hisTimetable";
  if (school?.kind === "중학교") return "misTimetable";
  return "elsTimetable";
}
