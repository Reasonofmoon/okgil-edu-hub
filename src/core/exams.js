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
    title: "한 달 전 · 나눠 외우기",
    body: "한 번에 몰아 읽기보다, 같은 내용을 며칠 간격으로 다시 꺼내는 편이 오래 남습니다. 시험 범위를 주 단위로만 쪼개 보세요.",
    refs: [
      { label: "Cepeda et al., 2006, Psychological Science", href: "https://doi.org/10.1111/j.1467-9280.2006.01763.x" },
      { label: "Dunlosky et al., 2013, PSPI", href: "https://doi.org/10.1177/1529100612453266" },
    ],
  },
  {
    from: 14,
    to: 20,
    title: "2주 전 · 다시 꺼내기",
    body: "밑줄만 긋지 말고, 책을 덮고 방금 읽은 걸 빈칸에 적어 보세요. 인출 연습이 재읽기보다 시험에 가깝습니다.",
    refs: [
      { label: "Roediger & Karpicke, 2006, Psychological Science", href: "https://doi.org/10.1111/j.1467-9280.2006.01693.x" },
      { label: "Dunlosky et al., 2013, PSPI", href: "https://doi.org/10.1177/1529100612453266" },
    ],
  },
  {
    from: 8,
    to: 13,
    title: "열흘 전 · 섞어 풀기",
    body: "한 과목만 파기보다 국어·영어를 번갈아 풀면 시험장 전환이 쉬워집니다. 오답은 ‘왜 틀렸는지’ 한 줄만 남기세요.",
    refs: [
      { label: "Rohrer & Taylor, 2007, Applied Cognitive Psychology", href: "https://doi.org/10.1002/acp.1266" },
      { label: "IES Practice Guide, 2007", href: "https://ies.ed.gov/ncee/wwc/PracticeGuide/1" },
    ],
  },
  {
    from: 4,
    to: 7,
    title: "일주일 전 · 노트는 질문으로",
    body: "필기는 베끼지 말고 왼쪽은 질문, 오른쪽은 답으로 나누세요. 잠자기 전 20분이 낮의 두 시간보다 나을 수 있습니다.",
    refs: [
      { label: "Pauk, How to Study in College (Cornell notes)", href: "https://lsc.cornell.edu/how-to-study/taking-notes/cornell-note-taking-system/" },
      { label: "Diekelmann & Born, 2010, Nat. Rev. Neurosci.", href: "https://doi.org/10.1038/nrn2762" },
    ],
  },
  {
    from: 1,
    to: 3,
    title: "사흘 전 · 새 진도는 그만",
    body: "새 범위를 넣지 마세요. 이미 푼 오답과 공식만 훑고, 잠을 지키는 게 점수에 더 가깝습니다.",
    refs: [
      { label: "Diekelmann & Born, 2010, Nat. Rev. Neurosci.", href: "https://doi.org/10.1038/nrn2762" },
      { label: "Dunlosky et al., 2013, PSPI", href: "https://doi.org/10.1177/1529100612453266" },
    ],
  },
  {
    from: 0,
    to: 0,
    title: "당일 · 루틴만",
    body: "아침은 평소처럼. 새 자료는 보지 말고, 8시 10분 입실(수능)처럼 학교 시각에 맞춰 미리 나가세요.",
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
