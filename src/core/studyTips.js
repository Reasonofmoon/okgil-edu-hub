/** Short, attributed lines from the 공부법 shelf. Paraphrase, not page quotes. */
export const STUDY_SOURCE = "공부법 서가";

export const STUDY_TIPS = [
  { id: "retrieve", slots: ["any", "empty", "exam", "daily"], title: "다시 읽지 말고 꺼내라", line: "밑줄과 재읽기는 안다는 착각을 줍니다. 책을 덮고 방금 배운 걸 적어 보세요. 꺼내는 일이 곧 공부입니다.", by: "Make It Stick" },
  { id: "space", slots: ["exam", "daily"], title: "한 번에 몰지 마라", line: "같은 내용을 며칠 간격으로 다시 꺼내는 편이, 시험 전날 몰아치기보다 오래 남습니다.", by: "Make It Stick" },
  { id: "inter", slots: ["exam", "empty"], title: "섞어 풀어라", line: "한 유형만 반복하면 시험장 전환이 느려집니다. 국어·영어·다른 유형을 번갈아 푸세요.", by: "Make It Stick" },
  { id: "forget", slots: ["empty", "off", "daily"], title: "잊는 것도 학습이다", line: "조금 잊은 뒤에 다시 꺼낼 때 기억이 더 단단해집니다. 막힌 느낌이 곧 연습이 먹히고 있다는 신호입니다.", by: "How We Learn" },
  { id: "sleep", slots: ["exam", "daily"], title: "잠이 복습이다", line: "새로 넣은 내용은 잠자는 동안 정리됩니다. 시험 전날 새 진도보다 잠을 지키는 편이 점수에 가깝습니다.", by: "How We Learn" },
  { id: "place", slots: ["empty", "off"], title: "장소를 바꿔 보라", line: "늘 같은 책상에서만 외우면 그 방에 기억이 묶입니다. 가끔 장소를 바꾸면 시험장에서도 잘 꺼냅니다.", by: "How We Learn" },
  { id: "delib", slots: ["exam", "daily"], title: "약한 곳만 반복하라", line: "이미 되는 부분을 편하게 반복하는 건 연습이 아닙니다. 막히는 한 지점을 골라 피드백을 받으며 고치세요.", by: "Peak" },
  { id: "repr", slots: ["empty", "exam"], title: "머릿속 모형을 만들어라", line: "전문가의 차이는 시간이 아니라, 문제를 한눈에 구조로 보는 머릿속 그림입니다. 오늘 단원을 그림으로 말해 보세요.", by: "Peak" },
  { id: "direct", slots: ["exam", "daily"], title: "시험과 같은 방식으로", line: "보기만 하고 시험을 보면 이전이 안 됩니다. 실제 문제 형식 그대로 스스로 풀어 보세요.", by: "Ultralearning" },
  { id: "drill", slots: ["exam"], title: "병목을 쪼개라", line: "막히는 한 기술만 따로 빼서 짧게 반복하세요. 전체를 처음부터 다시 하는 것보다 빠릅니다.", by: "Ultralearning" },
  { id: "wm", slots: ["empty", "daily"], title: "한 번에 너무 많이 넣지 마라", line: "생각하는 자리(작업기억)는 좁습니다. 새 내용은 이미 아는 것과 연결할 때만 들어갑니다.", by: "Why Don’t Students Like School?" },
  { id: "facts", slots: ["empty", "exam"], title: "지식이 생각을 켠다", line: "배경 지식이 있어야 독해도, 추론도 됩니다. 개념을 비운 채 ‘생각하는 법’만 연습할 수는 없습니다.", by: "Why Don’t Students Like School?" },
  { id: "focus", slots: ["daily", "off"], title: "집중과 분산을 오가라", line: "막히면 그 자리에서 더 쥐어짜지 말고 잠시 걷거나 쉬세요. 느슨한 모드에서 연결이 붙는 경우가 많습니다.", by: "A Mind for Numbers" },
  { id: "chunk", slots: ["exam", "empty"], title: "덩어리로 묶라", line: "공식과 예제를 따로 외우지 말고, ‘이런 조건이면 이 절차’처럼 한 덩어리로 묶으세요.", by: "A Mind for Numbers" },
  { id: "inspect", slots: ["reading"], title: "먼저 훑고 질문을 만들어라", line: "처음부터 정독하지 마세요. 목차·머리말·결론을 훑고 ‘이 책은 무엇을 주장하는가’를 먼저 적으세요.", by: "How to Read a Book" },
  { id: "outline", slots: ["reading", "ko"], title: "뼈대를 요구하라", line: "저자의 용어를 빌리고, 장 단위 뼈대를 자기 말로 다시 그리세요. 문장을 베끼는 건 읽기가 아닙니다.", by: "How to Read a Book" },
  { id: "journal", slots: ["reading", "off"], title: "읽은 것을 적는 공책", line: "한 권을 천천히 읽고, 주장·반론·내 질문을 같은 공책에 남기세요. 속도보다 대화가 남습니다.", by: "The Well-Educated Mind" },
  { id: "stages", slots: ["reading"], title: "세 번 다른 읽기", line: "무엇을 말하는가, 타당한가, 나와 무슨 상관인가. 같은 책을 이 세 층으로 나눠 읽으세요.", by: "The Well-Educated Mind" },
  { id: "attend", slots: ["empty", "daily"], title: "주의가 없으면 기억도 없다", line: "동시에 여러 화면을 켜 두면 처음부터 저장이 안 됩니다. 한 가지에만 주의를 준 뒤 꺼내 보세요.", by: "Remember" },
  { id: "meaning", slots: ["exam", "empty"], title: "의미 있게 붙이라", line: "의미와 감정이 붙은 기억이 오래갑니다. ‘왜 이게 중요한지’ 한 줄을 같이 적으세요.", by: "Remember" },
  { id: "palace", slots: ["off", "empty"], title: "장소를 걸어라", line: "외울 목록은 익숙한 길 위의 장면에 붙이세요. 다만 이해 없는 암기 트릭으로 끝내지는 마세요.", by: "Moonwalking with Einstein" },
  { id: "encode", slots: ["exam", "daily"], title: "생생하게 붙일수록 꺼내진다", line: "밋밋한 반복보다, 이상하고 구체적인 장면으로 바꿔 붙이면 시험장에서 더 잘 올라옵니다.", by: "Moonwalking with Einstein" },
];

const CHIPS = [
  "덮고 인출",
  "간격 복습",
  "섞어 풀기",
  "잠이 복습",
  "약한 곳만",
  "시험처럼",
  "한 덩어리",
  "먼저 훑기",
  "주의 하나",
  "의미 한 줄",
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
    "다시 읽지 말고 꺼내라 · Make It Stick",
    "조금 잊은 뒤가 더 단단하다 · How We Learn",
    "약한 지점만 고친다 · Peak",
    "시험과 같은 방식으로 연습한다 · Ultralearning",
  ];
}
