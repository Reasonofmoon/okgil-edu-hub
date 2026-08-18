import { formatYmd, parseYmd } from "./neis.js";
import { tagEvent } from "./calendar.js";

/** Official / published 2026 calendar. CSAT + KICE mocks from suneung.re.kr. Hakpyeong marked tentative. */
export const NATIONAL_EXAMS_2026 = [
  {
    ymd: "20260324",
    name: "3월 전국연합학력평가",
    host: "서울특별시교육청",
    kind: "hakpyeong",
    grades: "고1–고3",
    tentative: true,
  },
  {
    ymd: "20260507",
    name: "5월 전국연합학력평가",
    host: "경기도교육청",
    kind: "hakpyeong",
    grades: "고3",
    tentative: true,
  },
  {
    ymd: "20260604",
    name: "6월 수능 모의평가",
    host: "한국교육과정평가원",
    kind: "mock",
    grades: "고3·N수",
    source: "https://www.suneung.re.kr/main.do",
    tentative: false,
  },
  {
    ymd: "20260708",
    name: "7월 전국연합학력평가",
    host: "인천광역시교육청",
    kind: "hakpyeong",
    grades: "고3",
    tentative: true,
  },
  {
    ymd: "20260902",
    name: "9월 수능 모의평가",
    host: "한국교육과정평가원",
    kind: "mock",
    grades: "고3·N수",
    source: "https://www.suneung.re.kr/main.do",
    tentative: false,
  },
  {
    ymd: "20261020",
    name: "10월 전국연합학력평가",
    host: "서울특별시교육청",
    kind: "hakpyeong",
    grades: "고3",
    tentative: true,
  },
  {
    ymd: "20261119",
    name: "2027학년도 대학수학능력시험",
    host: "한국교육과정평가원",
    kind: "csat",
    grades: "고3·N수",
    source: "https://suneung.re.kr/sub/info.do?m=0101&s=suneung",
    tentative: false,
  },
];

export function daysUntil(ymd, now) {
  const t = parseYmd(ymd);
  if (!t) return null;
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const b = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((b - a) / 86400000);
}

export function nearRange(now, days = 45) {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  return { from: formatYmd(now), to: formatYmd(end) };
}

export function upcomingSchoolExams(schedule = [], now, windowDays = 30) {
  return (schedule || [])
    .filter((r) => tagEvent(r.EVENT_NM) === "exam")
    .map((r) => ({ ...r, days: daysUntil(r.AA_YMD, now) }))
    .filter((r) => r.days != null && r.days >= 0 && r.days <= windowDays)
    .sort((a, b) => a.days - b.days);
}

export function upcomingNational(now, isHigh = false) {
  if (!isHigh) return [];
  return NATIONAL_EXAMS_2026.map((e) => ({ ...e, days: daysUntil(e.ymd, now) }))
    .filter((e) => e.days != null && e.days >= 0)
    .sort((a, b) => a.days - b.days);
}

export function matchNational(ymd) {
  return NATIONAL_EXAMS_2026.find((e) => e.ymd === ymd) || null;
}

export function isHighSchool(school) {
  return /고등/.test(school?.kind || school?.name || "");
}

const TIPS = [
  {
    from: 21,
    to: 30,
    title: "한 달 전 · 간격 두고 복원",
    body: "같은 노트를 매일 보지 마세요. 핵심 개념 5~9개를 고르고, 다음 날·3일·7일·14일 뒤 빈 종이에 다시 그립니다. 몰아 읽기보다 꺼내기가 남습니다.",
    refs: [
      { label: "Cepeda et al., 2006, Psychological Science", href: "https://doi.org/10.1111/j.1467-9280.2006.01763.x" },
      { label: "Dunlosky et al., 2013, PSPI", href: "https://doi.org/10.1177/1529100612453266" },
    ],
  },
  {
    from: 14,
    to: 20,
    title: "2주 전 · 덮고 2차 지도",
    body: "자료를 보며 그린 1차 지도는 정리입니다. 책을 덮고 빈 종이에 개념·종류·동사 관계를 다시 그리세요. 두 지도의 차이가 지금 구멍입니다.",
    refs: [
      { label: "Roediger & Karpicke, 2006, Psychological Science", href: "https://doi.org/10.1111/j.1467-9280.2006.01693.x" },
      { label: "Dunlosky et al., 2013, PSPI", href: "https://doi.org/10.1177/1529100612453266" },
    ],
  },
  {
    from: 8,
    to: 13,
    title: "열흘 전 · 노트를 질문으로",
    body: "관계와 규칙을 질문으로 바꾸세요. 왜·조건이 바뀌면·비교·오류 탐지. 좋은 노트는 답을 담은 노트가 아니라 스스로 시험해볼 질문을 만드는 노트입니다.",
    refs: [
      { label: "Rohrer & Taylor, 2007, Applied Cognitive Psychology", href: "https://doi.org/10.1002/acp.1266" },
      { label: "IES Practice Guide, 2007", href: "https://ies.ed.gov/ncee/wwc/PracticeGuide/1" },
    ],
  },
  {
    from: 4,
    to: 7,
    title: "일주일 전 · 15분 루틴",
    body: "읽기 4분, 연결 4분, 덮고 복원 4분, 검증 2분, 한 문장 1분. “핵심은 A가 B에 영향을 주어 C로 이어진다”가 안 되면 아직 구조가 없습니다.",
    refs: [
      { label: "Pauk, How to Study in College (Cornell notes)", href: "https://lsc.cornell.edu/how-to-study/taking-notes/cornell-note-taking-system/" },
      { label: "Diekelmann & Born, 2010, Nat. Rev. Neurosci.", href: "https://doi.org/10.1038/nrn2762" },
    ],
  },
  {
    from: 1,
    to: 3,
    title: "사흘 전 · 사다리에서 내려온다",
    body: "복잡한 양식을 접고 덮고 복원만 반복하세요. 오답은 실패가 아니라 인과가 뒤집힌 좌표입니다. 왜 틀렸는지 한 줄만 남기세요.",
    refs: [
      { label: "Diekelmann & Born, 2010, Nat. Rev. Neurosci.", href: "https://doi.org/10.1038/nrn2762" },
      { label: "Dunlosky et al., 2013, PSPI", href: "https://doi.org/10.1177/1529100612453266" },
    ],
  },
  {
    from: 0,
    to: 0,
    title: "당일 · 새 지도는 그만",
    body: "새 자료를 펼치지 마세요. 명사 둘을 동사 하나로 잇는 문장 세 개만 속으로 복원하고, 평소 루틴으로 입실하세요.",
    refs: [
      { label: "평가원 수능 시험개요", href: "https://suneung.re.kr/sub/info.do?m=0101&s=suneung" },
    ],
  },
];

export function tipForDays(days) {
  if (days == null || days < 0) return null;
  return TIPS.find((t) => days >= t.from && days <= t.to) || TIPS[0];
}

export function ddayLabel(days) {
  if (days == null) return "";
  if (days === 0) return "D-Day";
  return `D-${days}`;
}
