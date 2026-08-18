import {
  OKGIL_SCHOOLS,
  ACADEMY_POIS,
  loadCatalog,
  dongRank,
  isNearOkgil,
  schoolByCode,
  fetchSchedule,
  fetchMeals,
  fetchTimetable,
  seoulNow,
  formatYmd,
  formatKoDate,
  parseYmd,
  monthRange,
  yearSpan,
  tagEvent,
  examWeeks,
  curateWeek,
  formatMd,
  countLiteracy,
  lastPeriod,
  parseDish,
  allergenNames,
  READING_LOOP,
  loadStudents,
  addStudent,
  removeStudent,
  loadChecks,
  saveChecks,
  upcomingSchoolExams,
  upcomingNational,
  matchNational,
  isHighSchool,
  tipForDays,
  ddayLabel,
  nearRange,
  pickQuote,
  QUOTE_CUTTER,
} from "../core/index.js";

const VIEWS = [
  ["briefing", "주간"],
  ["calendar", "달력"],
  ["clock", "오늘"],
  ["map", "맵"],
  ["reading", "독서"],
  ["gap", "갭"],
  ["students", "원생"],
];

function schoolKind(kind = "") {
  if (/초등/.test(kind)) return { short: "초", cls: "is-cho" };
  if (/중학/.test(kind)) return { short: "중", cls: "is-jung" };
  if (/고등/.test(kind)) return { short: "고", cls: "is-go" };
  if (/특수/.test(kind)) return { short: "특", cls: "is-etc" };
  return { short: String(kind).slice(0, 2) || "학", cls: "is-etc" };
}

function realmKind(realm = "", kind = "") {
  const t = `${realm} ${kind}`;
  if (/보습|입시|검정/.test(t)) return { short: "보습", cls: "is-bosup" };
  if (/예능|미술|음악|무용|피아노/.test(t)) return { short: "예능", cls: "is-ye" };
  if (/체육|스포츠/.test(t)) return { short: "체육", cls: "is-pe" };
  if (/외국어|영어/.test(t)) return { short: "외", cls: "is-lang" };
  const s = String(realm || kind).replace(/[·\s()대소원교습및]/g, "");
  return { short: (s.slice(0, 2) || "기타"), cls: "is-etc" };
}

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function createHub(options = {}) {
  const state = {
    officeCode: options.officeCode || "J10",
    schools: (options.schoolCodes?.length
      ? OKGIL_SCHOOLS.filter((s) => options.schoolCodes.includes(s.schoolCode))
      : OKGIL_SCHOOLS
    ).slice(),
    schoolCode: options.schoolCodes?.[0] || OKGIL_SCHOOLS[0].schoolCode,
    view: "briefing",
    theme: options.theme || "light",
    features: {
      briefing: true,
      clock: true,
      calendar: true,
      meals: true,
      map: true,
      reading: true,
      gap: true,
      students: true,
      ...options.features,
    },
    cache: {
      schedule: [],
      mealsToday: [],
      mealsTom: [],
      timetable: [],
      schoolExams: [],
      now: seoulNow(),
      today: formatYmd(seoulNow()),
    },
    academies: ACADEMY_POIS.map((p) => ({
      id: p.id, name: p.name, kind: p.kind, realm: "", course: "", status: "개원",
      address: p.note, tel: "", area: "okgil", isLeadmaster: p.id === "lm",
    })),
    manifest: null,
    mapArea: "okgil",
    mapRealm: "",
    mapQ: "",
    calYear: seoulNow().getFullYear(),
    calMonth: seoulNow().getMonth() + 1,
    error: "",
  };

  const root = el(`<div class="okh-root" data-theme="${state.theme}"></div>`);

  function emit(event) {
    options.onEvent?.(event);
    root.dispatchEvent(new CustomEvent("okh", { detail: event, bubbles: true }));
  }

  function apiOpts() {
    return { neisKey: options.neisKey, proxyUrl: options.proxyUrl, officeCode: state.officeCode };
  }

  async function loadSchoolData() {
    const school = schoolByCode(state.schoolCode, state.schools);
    const now = seoulNow();
    const today = formatYmd(now);
    const tomorrow = formatYmd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    const range = yearSpan(now, 3, 2);
    state.error = "";
    try {
      const [schedule, mealsToday, mealsTom, timetable] = await Promise.all([
        fetchSchedule(school, range, apiOpts()),
        fetchMeals(school, today, apiOpts()).catch(() => []),
        fetchMeals(school, tomorrow, apiOpts()).catch(() => []),
        fetchTimetable(school, today, {}, apiOpts()).catch(() => []),
      ]);
      const peers = state.schools.filter((s) => s.area === "okgil").slice(0, 6);
      const window = nearRange(now, 45);
      const peerRows = await Promise.all(peers.map(async (s) => {
        if (s.schoolCode === school.schoolCode) return { school: s, rows: schedule };
        const rows = await fetchSchedule(s, window, apiOpts()).catch(() => []);
        return { school: s, rows };
      }));
      const schoolExams = peerRows.map(({ school: s, rows }) => {
        const next = upcomingSchoolExams(rows, now, 30)[0] || null;
        return { school: s, next };
      });
      state.cache = { schedule, mealsToday, mealsTom, timetable, today, tomorrow, range, now, schoolExams };
      const weeks = examWeeks(schedule);
      if (weeks[0]) {
        emit({
          type: "calendar.examWeek",
          schoolCode: school.schoolCode,
          start: weeks[0].date,
          end: weeks[weeks.length - 1].date,
        });
      }
    } catch (e) {
      state.error = e.message || String(e);
      state.cache = { schedule: [], mealsToday: [], mealsTom: [], timetable: [], today, tomorrow, range, now, schoolExams: [] };
    }
  }

  function renderBar() {
    const school = schoolByCode(state.schoolCode, state.schools);
    return `
      <div class="okh-bar">
        <div class="okh-brand">옥길 교육정보 허브
          <small>리드마스터 · ${esc(school.name)}</small>
        </div>
        <select class="okh-select" data-okh="school">
          ${(() => {
            const ok = state.schools.filter((s) => s.area === "okgil" || /옥길/.test(s.name + (s.address || "")));
            const rest = state.schools.filter((s) => !ok.includes(s));
            const opt = (s) => `<option value="${s.schoolCode}" ${s.schoolCode === state.schoolCode ? "selected" : ""}>${esc(s.name)}</option>`;
            if (!rest.length) return ok.concat(state.schools).filter((s, i, a) => a.indexOf(s) === i).map(opt).join("");
            return `<optgroup label="옥길">${ok.map(opt).join("")}</optgroup><optgroup label="부천">${rest.map(opt).join("")}</optgroup>`;
          })()}
        </select>
      </div>`;
  }

  function renderTabs() {
    const tabs = VIEWS.filter(([id]) => state.features[id] !== false);
    return `<div class="okh-tabs" role="tablist">
      ${tabs
        .map(
          ([id, label]) =>
            `<button type="button" class="okh-tab" data-view="${id}" aria-selected="${state.view === id}">${label}</button>`
        )
        .join("")}
    </div>`;
  }

  function briefCard(kind, kicker, title, body, extra = "") {
    return `<article class="okh-card okh-brief-card is-${kind}">
      <h3>${kicker}</h3>
      <h2>${title}</h2>
      <p class="okh-empty">${body}</p>
      ${extra}
    </article>`;
  }

  function viewBriefing() {
    const school = schoolByCode(state.schoolCode, state.schools);
    const now = state.cache.now || seoulNow();
    const curated = curateWeek(state.cache.schedule || [], now);
    const { bounds, exams, examsThisWeek, offs, events } = curated;
    const dishes = state.cache.mealsToday?.[0] ? parseDish(state.cache.mealsToday[0].DDISH_NM) : [];
    let mood = "calm";
    let speech = `${school.name} 이번 주는 잔잔해요. 평소 루틴이면 충분해요.`;
    if (examsThisWeek.length) {
      mood = "exam";
      speech = `이번 주 ${school.name}에 ${examsThisWeek[0].EVENT_NM}이 있어요. 시험 범위는 학교에 물어봐야 해요.`;
    } else if (exams.length) {
      mood = "exam";
      speech = `${formatMd(exams[0].AA_YMD)}에 ${exams[0].EVENT_NM}이 다가와요. 지금부터 리듬만 잡아도 돼요.`;
    } else if (offs.length) {
      mood = "off";
      speech = `이번 주 쉬는 날이 있어요. 책 읽기 좋은 주예요.`;
    }
    const weekLabel = `${bounds.monday.getMonth() + 1}월 ${bounds.monday.getDate()}일 – ${bounds.sunday.getMonth() + 1}월 ${bounds.sunday.getDate()}일`;
    const cards = [];
    if (exams.length) {
      const first = exams[0];
      const when = examsThisWeek.length ? "이번 주" : formatMd(first.AA_YMD);
      cards.push(briefCard("exam", "시험", `${esc(when)} ${esc(first.EVENT_NM)}`,
        "시험 범위·준비물은 NEIS에 없습니다. 가정통신문이나 학교에 확인해 주세요.",
        exams.length > 1 ? `<ul class="okh-list">${exams.slice(0, 4).map((e) => `<li>${esc(formatMd(e.AA_YMD))} · ${esc(e.EVENT_NM)}</li>`).join("")}</ul>` : ""));
    } else {
      cards.push(briefCard("calm", "시험", "이번 주 시험 없음", "가까운 2주 안에도 고사·평가가 보이지 않아요."));
    }
    if (offs.length) {
      cards.push(briefCard("off", "방학·휴업",
        offs.length === 1 ? `${esc(formatMd(offs[0].AA_YMD))} ${esc(offs[0].EVENT_NM)}` : `쉬는 날 ${offs.length}일`,
        "학원 등원 여부를 미리 맞춰 두세요.",
        `<ul class="okh-list">${offs.slice(0, 4).map((e) => `<li>${esc(formatMd(e.AA_YMD))} · ${esc(e.EVENT_NM)}</li>`).join("")}</ul>`));
    }
    if (events.length) {
      cards.push(briefCard("event", "이번 주 일정", `${events.length}가지`,
        "시험·방학이 아닌 행사만 추렸어요.",
        `<ul class="okh-list">${events.slice(0, 5).map((e) => `<li>${esc(formatMd(e.AA_YMD))} · ${esc(e.EVENT_NM)}</li>`).join("")}</ul>`));
    } else if (!examsThisWeek.length && !offs.length) {
      cards.push(briefCard("calm", "일정", "특별한 학사 없음", "이번 주는 평소 수업으로 보여요."));
    }
    if (dishes.length) {
      const names = dishes.map((d) => d.replace(/\(\d.*$/, "")).filter(Boolean);
      cards.push(briefCard("meal", "오늘 급식", esc(names[0] || "급식"), esc(names.join(" · "))));
    } else {
      cards.push(briefCard("meal", "오늘 급식", "식단 없음", "오늘 급식이 없어요. 방학이거나 아직 올라오지 않은 날이에요."));
    }
    const q = pickQuote(now.getTime());
    const high = isHighSchool(school);
    const national = upcomingNational(now, high);
    const schoolSoon = upcomingSchoolExams(state.cache.schedule || [], now, 30);
    const focus = schoolSoon[0] || (national[0] ? { EVENT_NM: national[0].name, AA_YMD: national[0].ymd, days: national[0].days, national: national[0] } : null);
    const tip = focus ? tipForDays(focus.days) : null;
    const peer = state.cache.schoolExams || [];
    return `
      <aside class="okh-quote" data-okh="quote">
        <p class="okh-quote-text">“${esc(q.text)}”</p>
        <p class="okh-quote-by">${esc(q.by)} · <a href="${QUOTE_CUTTER}" target="_blank" rel="noopener">Quote Cutter</a></p>
      </aside>
      <section class="okh-hero is-${mood}">
        <img class="okh-mascot" src="/demo/assets/ridi.png" alt="리디" width="160" height="107" />
        <div class="okh-speech">
          <p class="okh-speech-name">리디 · ${esc(school.name)}</p>
          <p>${esc(speech)}</p>
          <p class="okh-note">${esc(weekLabel)}</p>
        </div>
      </section>
      ${peer.length ? `<div class="okh-dday-row">${peer.map((p) => {
        const n = p.next;
        const d = n ? ddayLabel(n.days) : "일정 없음";
        const title = n ? n.EVENT_NM : "한 달 안 시험 없음";
        const hit = n ? matchNational(n.AA_YMD) : null;
        return `<button type="button" class="okh-dday ${n ? "is-on" : ""}" data-okh-school="${p.school.schoolCode}" title="${esc(title)}">
          <strong>${esc(p.school.name.replace(/등학교|등학교/, "").replace("학교", ""))}</strong>
          <span>${esc(d)}</span>
          ${hit ? `<em>평가원·학평</em>` : ""}
        </button>`;
      }).join("")}</div>` : ""}
      ${focus && tip ? `<article class="okh-card okh-tip">
        <h3>${esc(ddayLabel(focus.days))} · ${esc(focus.EVENT_NM || "")}</h3>
        <h2>${esc(tip.title)}</h2>
        <p class="okh-empty">${esc(tip.body)}</p>
        <p class="okh-note">참고 ${tip.refs.map((ref) => `<a href="${ref.href}" target="_blank" rel="noopener">${esc(ref.label)}</a>`).join(" · ")}</p>
        ${focus.national ? `<p class="okh-note">출처 ${focus.national.tentative ? "교육청 학평 일정(안), 학교 학사와 다를 수 있음" : "한국교육과정평가원"} ${focus.national.source ? `· <a href="${focus.national.source}" target="_blank" rel="noopener">공고</a>` : ""}</p>` : ""}
      </article>` : ""}
      ${national.length ? `<article class="okh-card">
        <h3>2026 공개 입시 일정</h3>
        <ul class="okh-list">${national.slice(0, 4).map((e) => {
          const aligned = (state.cache.schedule || []).some((r) => r.AA_YMD === e.ymd && /모의|학력|수능/.test(r.EVENT_NM || ""));
          return `<li><span class="okh-chip is-exam">${esc(ddayLabel(e.days))}</span>${esc(formatMd(e.ymd))} · ${esc(e.name)} · ${esc(e.host)}${aligned ? " · 이 학교 학사와 같음" : ""}${e.tentative ? " · 일정안" : ""}</li>`;
        }).join("")}</ul>
        <p class="okh-note">수능·6월·9월 모평은 <a href="https://www.suneung.re.kr/main.do" target="_blank" rel="noopener">평가원</a> 공고. 학평은 교육청 일정안입니다.</p>
      </article>` : ""}
      <div class="okh-grid okh-cols-2 okh-brief">${cards.join("")}</div>
      <p class="okh-brief-more"><button type="button" class="okh-btn ghost" data-view="calendar">달력 보기</button></p>`;
  }

  function viewClock() {
    const school = schoolByCode(state.schoolCode, state.schools);
    const now = state.cache.now || seoulNow();
    const today = state.cache.today || formatYmd(now);
    const { timetable = [], mealsToday = [], mealsTom = [], schedule = [] } = state.cache;
    const todayEvents = schedule.filter((r) => r.AA_YMD === today);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEvents = schedule.filter((r) => {
      const d = parseYmd(r.AA_YMD);
      return d && d >= weekStart && d <= new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
    });
    const last = lastPeriod(timetable);
    const dishes = mealsToday[0] ? parseDish(mealsToday[0].DDISH_NM) : [];
    const tom = mealsTom[0] ? parseDish(mealsTom[0].DDISH_NM) : [];

    return `
      <div class="okh-grid okh-cols-3">
        <article class="okh-card">
          <h3>오늘 · ${esc(formatKoDate(now))}</h3>
          <h2>${esc(school.name)}</h2>
          <p class="okh-empty">${esc(school.address)}<br>${esc(school.tel)}</p>
          ${
            todayEvents.length
              ? `<ul class="okh-list">${todayEvents
                  .map((e) => `<li><span class="okh-chip is-${tagEvent(e.EVENT_NM)}">${esc(tagEvent(e.EVENT_NM))}</span>${esc(e.EVENT_NM)}</li>`)
                  .join("")}</ul>`
              : `<p class="okh-empty">오늘 학사 행사가 없습니다.</p>`
          }
        </article>
        <article class="okh-card">
          <h3>시간표</h3>
          ${
            timetable.length
              ? `<ul class="okh-list">${timetable
                  .map((r) => `<li>${esc(r.PERIO)}교시 · ${esc(r.ITRT_CNTNT)}</li>`)
                  .join("")}</ul>
                 ${last ? `<p class="okh-note">마지막 교시 ${esc(last.PERIO)} · 하교 슬롯 후보</p>` : ""}`
              : `<p class="okh-empty">오늘 시간표가 없습니다. 방학·휴업이면 정상입니다.</p>`
          }
        </article>
        <article class="okh-card">
          <h3>급식</h3>
          ${
            dishes.length
              ? `<ul class="okh-list">${dishes
                  .map((d) => `<li>${esc(d.replace(/\(\d.*$/, ""))}${allergenNames(d).length ? ` <span class="okh-chip">${esc(allergenNames(d).join(", "))}</span>` : ""}</li>`)
                  .join("")}</ul>`
              : `<p class="okh-empty">오늘 급식이 없습니다.</p>`
          }
          <h3 style="margin-top:12px">내일 급식</h3>
          ${tom.length ? `<p>${esc(tom.map((d) => d.replace(/\(\d.*$/, "")).join(" · "))}</p>` : `<p class="okh-empty">내일 식단이 아직 없습니다.</p>`}
        </article>
      </div>
      <article class="okh-card" style="margin-top:12px">
        <h3>이번 주 학사</h3>
        ${
          weekEvents.length
            ? `<ul class="okh-list">${weekEvents
                .map((e) => `<li>${esc(e.AA_YMD.slice(4, 6))}/${esc(e.AA_YMD.slice(6))} · ${esc(e.EVENT_NM)}</li>`)
                .join("")}</ul>`
            : `<p class="okh-empty">이번 주 등록된 행사가 없습니다.</p>`
        }
      </article>`;
  }

  function viewCalendar() {
    const now = state.cache.now || seoulNow();
    const today = state.cache.today || formatYmd(now);
    const y = state.calYear || now.getFullYear();
    const m = state.calMonth || now.getMonth() + 1;
    const schedule = state.cache.schedule || [];
    const prefix = `${y}${String(m).padStart(2, "0")}`;
    const monthRows = schedule.filter((r) => String(r.AA_YMD || "").startsWith(prefix));
    const first = new Date(y, m - 1, 1);
    const startPad = first.getDay();
    const days = new Date(y, m, 0).getDate();
    const byDay = {};
    for (const r of monthRows) {
      const dd = Number(String(r.AA_YMD).slice(6));
      (byDay[dd] ||= []).push(r);
    }
    let cells = "";
    for (let i = 0; i < startPad; i++) cells += `<div></div>`;
    for (let d = 1; d <= days; d++) {
      const ev = byDay[d] || [];
      const ymd = `${prefix}${String(d).padStart(2, "0")}`;
      const kinds = ev.map((e) => tagEvent(e.EVENT_NM));
      const cls = [
        kinds.includes("exam") ? "is-exam" : "",
        kinds.includes("off") ? "is-off" : "",
        ymd === today ? "is-today" : "",
      ].filter(Boolean).join(" ");
      cells += `<div class="okh-day ${cls}"><strong>${d}</strong>${ev
        .slice(0, 3)
        .map((e) => `<div>${esc(e.EVENT_NM)}</div>`)
        .join("")}</div>`;
    }
    const years = [];
    for (let yy = now.getFullYear() - 3; yy <= now.getFullYear() + 2; yy++) years.push(yy);
    return `<article class="okh-card">
      <div class="okh-cal-nav">
        <button type="button" class="okh-btn ghost" data-cal="prev">이전</button>
        <h2>${y}년 ${m}월 학사</h2>
        <button type="button" class="okh-btn ghost" data-cal="next">다음</button>
        <button type="button" class="okh-btn ghost" data-cal="today">오늘</button>
        <select class="okh-select" data-cal="year">
          ${years.map((yy) => `<option value="${yy}" ${yy === y ? "selected" : ""}>${yy}년</option>`).join("")}
        </select>
      </div>
      <div class="okh-cal">
        ${["일", "월", "화", "수", "목", "금", "토"].map((d) => `<div class="okh-dow">${d}</div>`).join("")}
        ${cells}
      </div>
      <h3 style="margin:14px 0 8px">이달 일정 ${monthRows.length}건</h3>
      ${
        monthRows.length
          ? `<ul class="okh-list okh-month-list">${monthRows
              .map((e) => `<li><span class="okh-chip is-${tagEvent(e.EVENT_NM)}">${esc(tagEvent(e.EVENT_NM))}</span>${esc(e.AA_YMD.slice(4, 6))}/${esc(e.AA_YMD.slice(6))} · ${esc(e.EVENT_NM)}</li>`)
              .join("")}</ul>`
          : `<p class="okh-empty">이달 NEIS 학사 일정이 없습니다. 방학이면 정상입니다.</p>`
      }
      <p class="okh-note">이전·다음으로 3년 전~2년 후 달을 봅니다. 시험은 붉은 테두리, 방학은 흐리게. 시험 범위는 NEIS에 없습니다.</p>
    </article>`;
  }

  function viewMap() {
    const schools = state.schools
      .filter((s) => isNearOkgil(`${s.name} ${s.address || ""} ${s.detail || ""}`) || s.area === "okgil")
      .sort((a, b) => dongRank(`${a.address} ${a.name}`) - dongRank(`${b.address} ${b.name}`) || a.name.localeCompare(b.name, "ko"));
    let list = state.academies.slice();
    if (state.mapArea === "okgil") list = list.filter((a) => a.area === "okgil" || a.isLeadmaster || isNearOkgil(`${a.address} ${a.name}`));
    if (state.mapRealm) list = list.filter((a) => (a.realm || "").includes(state.mapRealm) || (a.course || "").includes(state.mapRealm));
    if (state.mapQ) {
      const q = state.mapQ.toLowerCase();
      list = list.filter((a) => `${a.name} ${a.address}`.toLowerCase().includes(q));
    }
    list.sort((a, b) => Number(b.isLeadmaster) - Number(a.isLeadmaster) || dongRank(`${a.address} ${a.name}`) - dongRank(`${b.address} ${b.name}`) || a.name.localeCompare(b.name, "ko"));
    const shown = list.slice(0, 60);
    const chip = (key, val, label) => `<button type="button" class="okh-tab okh-abbr" data-map="${key}:${val}" aria-selected="${state[key] === val}">${label}</button>`;
    return `<div class="okh-grid okh-cols-2">
      <article class="okh-card">
        <h3>옥길 학교 ${schools.length}</h3>
        <ul class="okh-list">${schools
          .map((s) => {
            const k = schoolKind(s.kind);
            return `<li class="okh-poi"><span><strong>${esc(s.name)}</strong><br><span class="okh-empty">${esc(s.address)}</span></span><span class="okh-chip ${k.cls}" title="${esc(s.kind)}">${esc(k.short)}</span></li>`;
          })
          .join("")}</ul>
      </article>
      <article class="okh-card">
        <h3>학원 · 교습소 ${list.length}</h3>
        <div class="okh-tabs okh-pills" style="padding:0 0 10px">
          ${chip("mapArea", "okgil", "옥길")}
          ${chip("mapArea", "bucheon", "부천")}
          ${chip("mapRealm", "", "전체")}
          ${chip("mapRealm", "보습", "보습")}
          ${chip("mapRealm", "예능", "예능")}
        </div>
        <input class="okh-select" data-okh="aca-q" placeholder="학원 이름·주소 검색" value="${esc(state.mapQ)}" style="width:100%;margin-bottom:10px" />
        <ul class="okh-list">${shown
          .map((p) => {
            const k = realmKind(p.realm, p.kind);
            return `<li class="okh-poi"><span><strong>${esc(p.name)}</strong>${p.isLeadmaster ? ' <span class="okh-chip is-exam">우리</span>' : ""}<br><span class="okh-empty">${esc(p.address)}</span></span><span class="okh-chip ${k.cls}" title="${esc(p.realm || p.kind)}">${esc(k.short)}</span></li>`;
          })
          .join("")}</ul>
        <p class="okh-note">NEIS 학원·교습소 ${state.manifest?.counts?.academiesBucheon ?? list.length}곳 중 개원만. ${list.length > 60 ? `화면에는 60곳.` : ""} 좌표 맵은 호스트가 붙입니다.</p>
      </article>
    </div>`;
  }

  function viewReading() {
    const checks = loadChecks();
    return `<article class="okh-card">
      <h2>독서 루프</h2>
      <p class="okh-empty">문해력 권장 도서. 도서관 소장 여부는 호스트가 정보나루를 붙이면 켜집니다.</p>
      <ul class="okh-list">${READING_LOOP.map((b) => {
        const on = !!checks[b.isbn];
        return `<li>
          <label><input type="checkbox" data-isbn="${b.isbn}" ${on ? "checked" : ""}/> <strong>${esc(b.title)}</strong> · ${esc(b.author)}
          <span class="okh-chip">${esc(b.band)}</span></label>
          <div class="okh-empty">${esc(b.why)} · ISBN ${esc(b.isbn)}</div>
        </li>`;
      }).join("")}</ul>
    </article>`;
  }

  function viewGap() {
    const students = loadStudents();
    const { timetable = [] } = state.cache;
    const lit = countLiteracy(timetable);
    const school = schoolByCode(state.schoolCode, state.schools);
    const mine = students.filter((s) => s.schoolCode === state.schoolCode);
    return `<div class="okh-grid okh-cols-2">
      <article class="okh-card">
        <h3>학교 시수 (오늘 시간표)</h3>
        <h2>국어 ${lit.ko} · 영어 ${lit.en}</h2>
        <p class="okh-empty">${esc(school.name)} · 전체 ${lit.total}교시. 방학이면 0이 맞습니다.</p>
      </article>
      <article class="okh-card">
        <h3>학원 패스 (원생 입력)</h3>
        ${
          mine.length
            ? `<ul class="okh-list">${mine
                .map((s) => {
                  const gap = s.passes - (lit.ko + lit.en);
                  return `<li>${esc(s.name)} · 주 ${s.passes}패스 · 오늘 학교 문해 ${lit.ko + lit.en}교시 · 차 ${gap}</li>`;
                })
                .join("")}</ul>`
            : `<p class="okh-empty">이 학교 원생을 원생 탭에서 넣으면 갭이 계산됩니다.</p>`
        }
      </article>
    </div>`;
  }

  function viewStudents() {
    const rows = loadStudents();
    return `<article class="okh-card">
      <h2>원생 · 학교 매핑</h2>
      <form class="okh-form" data-okh="add-student">
        <label>이름 <input name="name" required /></label>
        <label>학교
          <select name="schoolCode">${state.schools
            .map((s) => `<option value="${s.schoolCode}">${esc(s.name)}</option>`)
            .join("")}</select>
        </label>
        <label>학년 <input name="grade" placeholder="3" /></label>
        <label>반 <input name="className" placeholder="2" /></label>
        <label>주 패스 <input name="passes" type="number" value="4" min="1" /></label>
        <button class="okh-btn" type="submit">추가</button>
      </form>
      <ul class="okh-list">${
        rows.length
          ? rows
              .map((r) => {
                const sc = schoolByCode(r.schoolCode, OKGIL_SCHOOLS);
                return `<li class="okh-poi"><span>${esc(r.name)} · ${esc(sc?.name || r.schoolCode)} ${esc(r.grade)}${r.className ? "-" + esc(r.className) : ""}</span>
                <button type="button" class="okh-btn ghost" data-del="${r.id}">빼기</button></li>`;
              })
              .join("")
          : `<li class="okh-empty">아직 없습니다. 학부모 등록의 조인 키입니다.</li>`
      }</ul>
    </article>`;
  }

  const views = {
    briefing: viewBriefing,
    clock: viewClock,
    calendar: viewCalendar,
    map: viewMap,
    reading: viewReading,
    gap: viewGap,
    students: viewStudents,
  };

  function paint() {
    const school = schoolByCode(state.schoolCode, state.schools);
    root.innerHTML =
      renderBar() +
      renderTabs() +
      `<div class="okh-body">${state.error ? `<p class="okh-empty">NEIS: ${esc(state.error)}</p>` : ""}${views[state.view]()}</div>` +
      `<div class="okh-foot">리드마스터 · 출처 NEIS · ${esc(school.name)}</div>`;

    root.querySelectorAll("[data-okh-school]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        state.schoolCode = btn.getAttribute("data-okh-school");
        const s = schoolByCode(state.schoolCode, state.schools);
        emit({ type: "school.selected", schoolCode: s.schoolCode, schoolName: s.name });
        await loadSchoolData();
        paint();
      });
    });
    root.querySelector("[data-okh=school]")?.addEventListener("change", async (e) => {
      state.schoolCode = e.target.value;
      const s = schoolByCode(state.schoolCode, state.schools);
      emit({ type: "school.selected", schoolCode: s.schoolCode, schoolName: s.name });
      await loadSchoolData();
      paint();
    });
    root.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.view = btn.getAttribute("data-view");
        paint();
      });
    });
    root.querySelectorAll("[data-cal]").forEach((el) => {
      const act = el.getAttribute("data-cal");
      if (act === "year") {
        el.addEventListener("change", () => {
          state.calYear = Number(el.value);
          paint();
        });
        return;
      }
      el.addEventListener("click", () => {
        const n = seoulNow();
        const minY = n.getFullYear() - 3;
        const maxY = n.getFullYear() + 2;
        if (act === "prev") {
          if (state.calMonth === 1) { state.calMonth = 12; state.calYear -= 1; }
          else state.calMonth -= 1;
        } else if (act === "next") {
          if (state.calMonth === 12) { state.calMonth = 1; state.calYear += 1; }
          else state.calMonth += 1;
        } else if (act === "today") {
          state.calYear = n.getFullYear();
          state.calMonth = n.getMonth() + 1;
        }
        if (state.calYear < minY) { state.calYear = minY; state.calMonth = 1; }
        if (state.calYear > maxY) { state.calYear = maxY; state.calMonth = 12; }
        paint();
      });
    });
    root.querySelectorAll("[data-map]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [k, v] = btn.getAttribute("data-map").split(":");
        state[k] = v;
        paint();
      });
    });
    root.querySelector("[data-okh=aca-q]")?.addEventListener("input", (e) => {
      state.mapQ = e.target.value;
      paint();
      const box = root.querySelector("[data-okh=aca-q]");
      if (box) { box.focus(); box.setSelectionRange(box.value.length, box.value.length); }
    });
    root.querySelector("[data-okh=add-student]")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const row = addStudent(Object.fromEntries(fd));
      emit({ type: "student.mapped", studentId: row.id, schoolCode: row.schoolCode });
      paint();
    });
    root.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        removeStudent(btn.getAttribute("data-del"));
        paint();
      });
    });
    root.querySelectorAll("[data-isbn]").forEach((box) => {
      box.addEventListener("change", () => {
        const map = loadChecks();
        map[box.getAttribute("data-isbn")] = box.checked;
        saveChecks(map);
      });
    });
  }

  async function start() {
    paint();
    try {
      const cat = await loadCatalog(options.dataUrl || "/data/neis");
      state.manifest = cat.manifest;
      if (cat.academies.length) state.academies = cat.academies;
      if (cat.schools.length) {
        const ok = cat.schools.filter((s) => s.area === "okgil");
        const rest = cat.schools.filter((s) => s.area !== "okgil");
        state.schools = [...ok, ...rest];
        if (!state.schools.some((s) => s.schoolCode === state.schoolCode)) {
          state.schoolCode = state.schools[0].schoolCode;
        }
      }
    } catch (e) {
      state.error = e.message || String(e);
    }
    paint();
    await loadSchoolData();
    paint();
    const s = schoolByCode(state.schoolCode, state.schools);
    emit({ type: "school.selected", schoolCode: s.schoolCode, schoolName: s.name });
    if (!state._quoteTimer) {
      state._quoteTimer = setInterval(() => {
        const box = root.querySelector("[data-okh=quote]");
        if (!box) return;
        const q = pickQuote(Date.now());
        box.innerHTML = `<p class="okh-quote-text">“${esc(q.text)}”</p><p class="okh-quote-by">${esc(q.by)} · <a href="${QUOTE_CUTTER}" target="_blank" rel="noopener">Quote Cutter</a></p>`;
      }, 14000);
    }
  }

  return { root, start, unmount() { if (state._quoteTimer) clearInterval(state._quoteTimer); root.remove(); } };
}
