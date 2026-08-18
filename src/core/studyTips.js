/** Short excerpts from 온톨로지 인출 노트법 (노트를 지도로 바꾸는 공부법). */
export const STUDY_SOURCE = "온톨로지 인출 노트법";

export const STUDY_TIPS = [
  { id: "map", slots: ["any", "empty", "daily"], title: "창고가 아니라 지도", line: "오래 남는 노트는 명사를 많이 적은 노트가 아니라, 명사 사이를 동사로 이은 노트입니다." },
  { id: "recog", slots: ["any", "empty", "exam"], title: "보면 아는 것과 꺼내는 것", line: "노트를 보며 “알지”라고 느끼는 것은 재인입니다. 시험은 얼굴을 가리고 이름을 떠올리라고 합니다." },
  { id: "device", slots: ["any", "daily"], title: "노트는 인출 장치", line: "옮겨 적기는 저장입니다. 노트는 완성품이 아니라, 책을 덮고 꺼내게 만드는 장치여야 합니다." },
  { id: "pick", slots: ["empty", "daily", "reading"], title: "개념 5~9개", line: "한 단원에서 핵심만 5~9개 고르세요. “이 개념을 빼면 이야기가 무너지나?”가 기준입니다." },
  { id: "kind", slots: ["empty", "ko", "en"], title: "종류표를 붙인다", line: "개념에 대상·원인·과정·결과·원리·사례·예외를 붙이면, 단어가 아니라 역할을 기억합니다." },
  { id: "verb", slots: ["any", "empty", "daily"], title: "화살표에는 동사", line: "산업혁명 → 증기기관은 관계가 없습니다. “증기기관이 공장 생산을 확대했다”처럼 동사를 쓰세요." },
  { id: "rule", slots: ["exam", "empty"], title: "절대 규칙", line: "암기한 학생은 비슷한 문제를 찾고, 이해한 학생은 이 문제에 적용할 규칙을 찾습니다." },
  { id: "cover", slots: ["any", "exam", "empty"], title: "덮고 다시 그린다", line: "자료를 보며 그린 1차 지도는 정리입니다. 덮고 빈 종이에 그린 2차 지도가 인출입니다." },
  { id: "err", slots: ["exam", "empty"], title: "틀린 부분이 좌표", line: "오답은 실패가 아닙니다. 인과가 뒤집힌 자리를 고치는 한 줄이 베껴 쓴 정답보다 오래 남습니다." },
  { id: "q", slots: ["exam", "daily"], title: "노트를 질문으로", line: "좋은 노트는 답을 많이 담은 노트가 아니라, 나중에 스스로 시험해볼 질문을 많이 만드는 노트입니다." },
  { id: "15", slots: ["daily", "empty", "exam"], title: "15분 루틴", line: "읽기 4분 · 연결 4분 · 덮고 복원 4분 · 검증 2분 · 한 문장 1분. 매일 거대한 지도를 그릴 필요는 없습니다." },
  { id: "space", slots: ["exam", "daily"], title: "간격 두고 복원", line: "같은 노트를 매일 보지 마세요. 다음 날, 3일, 7일, 14일 뒤 빈 종이에 다시 그립니다." },
  { id: "en", slots: ["en", "reading"], title: "영어는 논리 역할", line: "문장마다 해석만 적지 말고 주장·이유·근거·사례·반론·재반박·결론을 표시하세요." },
  { id: "ko", slots: ["ko", "reading"], title: "국어는 근거를 검사", line: "주장의 강도보다, 근거가 그 주장을 정말 받치는지 보고, 필자 주장과 소개된 타인 주장을 나누세요." },
  { id: "lv0", slots: ["empty", "daily", "off"], title: "동사 한 개부터", line: "오늘 배운 것에서 명사 둘을 동사 하나로 잇는 문장을 세 개만 쓰세요. 문장당 10초면 됩니다." },
  { id: "lv1", slots: ["empty", "off"], title: "관계 세 형제", line: "먼저 세 관계만: ~이다(종류), ~의 부분이다, ~을 일으킨다. 뼈대가 저절로 드러납니다." },
  { id: "down", slots: ["exam"], title: "시험 임박하면 내려온다", line: "시험 3일 전이면 복잡한 양식을 접고, 덮고 복원하는 15분 루틴만 반복하세요." },
  { id: "one", slots: ["exam", "daily"], title: "한 문장 설명", line: "“핵심은 ______가 ______에 영향을 주어 결국 ______로 이어진다.” 한 문장이 안 되면 아직 구조가 없습니다." },
  { id: "pretty", slots: ["empty", "off"], title: "예쁜 노트", line: "형광펜과 깔끔한 필기는 잘한 느낌이 듭니다. 시험장은 그 단서를 주지 않습니다." },
  { id: "read", slots: ["reading"], title: "읽고 나서 지도", line: "책을 덮고 인물·사건·이유를 동사로 이어 보세요. 줄거리 복사는 읽은 척일 뿐입니다." },
];

const CHIPS = [
  "덮고 복원",
  "동사로 잇기",
  "개념 5~9",
  "종류표",
  "한 문장",
  "질문으로",
  "틀린 좌표",
  "15분 루틴",
  "간격 복습",
  "관계 세 형제",
];

export function pickStudyTip(slot = "any", seed = Date.now()) {
  const pool = STUDY_TIPS.filter((t) => t.slots.includes(slot) || t.slots.includes("any"));
  const list = pool.length ? pool : STUDY_TIPS;
  return list[Math.abs(Number(seed)) % list.length];
}

export function studyChip(seed = 0) {
  return CHIPS[Math.abs(Number(seed)) % CHIPS.length];
}

export function studyWatermarkLines() {
  return [
    "명사 사이를 동사로 잇는다",
    "보면 아는 것과 꺼내는 것은 다르다",
    "1차는 정리, 2차는 인출",
    "오답은 지도를 고치는 좌표다",
  ];
}
