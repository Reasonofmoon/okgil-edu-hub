/** Short public-domain or clearly attributed lines. Quote Cutter is the clip tool, not a quote API. */
export const QUOTES = [
  { text: "배우고 때로 익히면 또한 기쁘지 아니한가.", by: "논어 · 학이" },
  { text: "기하학으로 가는 왕도는 없다.", by: "유클리드" },
  { text: "Reading is to the mind what exercise is to the body.", by: "Joseph Addison" },
  { text: "Once you learn to read, you will be forever free.", by: "Frederick Douglass" },
  { text: "Genius is one percent inspiration and ninety-nine percent perspiration.", by: "Thomas Edison" },
  { text: "Nothing in life is to be feared, it is only to be understood.", by: "Marie Curie" },
  { text: "Education is the most powerful weapon which you can use to change the world.", by: "Nelson Mandela" },
  { text: "I am always ready to learn although I do not always like being taught.", by: "Winston Churchill" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", by: "B.B. King" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act but a habit.", by: "Will Durant (on Aristotle)" },
];

export function pickQuote(seed = Date.now()) {
  return QUOTES[Math.abs(Number(seed)) % QUOTES.length];
}

export const QUOTE_CUTTER = "https://github.com/Reasonofmoon/quote-cutter";
