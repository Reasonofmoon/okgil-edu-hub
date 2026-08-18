import {
  OKGIL_SCHOOLS,
  ACADEMY_POIS,
  schoolByCode,
  fetchSchedule,
  fetchMeals,
  fetchTimetable,
  seoulNow,
  formatYmd,
  formatKoDate,
  parseYmd,
  monthRange,
  tagEvent,
  examWeeks,
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
} from "../core/index.js";

const VIEWS = [
  ["clock", "학교 시계"],
  ["calendar", "학사 캘린더"],
  ["map", "옥길 맵"],
  ["reading", "독서 루프"],
  ["gap", "갭 리포트"],
  ["students", "원생"],
];

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
    view: "clock",
    theme: options.theme || "light",
    features: {
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
      now: seoulNow(),
      today: formatYmd(seoulNow()),
    },
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
    const range = monthRange(now.getFullYear(), now.getMonth() + 1);
    state.error = "";
    try {
      const [schedule, mealsToday, mealsTom, timetable] = await Promise.all([
        fetchSchedule(school, range, apiOpts()),
        fetchMeals(school, today, apiOpts()).catch(() => []),
        fetchMeals(school, tomorrow, apiOpts()).catch(() => []),
        fetchTimetable(school, today, {}, apiOpts()).catch(() => []),
      ]);
      state.cache = { schedule, mealsToday, mealsTom, timetable, today, tomorrow, range, now };
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
      state.cache = { schedule: [], mealsToday: [], mealsTom: [], timetable: [], today, tomorrow, range, now };
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
          ${state.schools
            .map(
              (s) =>
                `<option value="${s.schoolCode}" ${s.schoolCode === state.schoolCode ? "selected" : ""}>${esc(s.name)}</option>`
            )
            .join("")}
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
    const { schedule = [], now } = state.cache;
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const first = new Date(y, m - 1, 1);
    const startPad = first.getDay();
    const days = new Date(y, m, 0).getDate();
    const byDay = {};
    for (const r of schedule) {
      const dd = Number(r.AA_YMD.slice(6));
      (byDay[dd] ||= []).push(r);
    }
    let cells = "";
    for (let i = 0; i < startPad; i++) cells += `<div></div>`;
    for (let d = 1; d <= days; d++) {
      const ev = byDay[d] || [];
      const kinds = ev.map((e) => tagEvent(e.EVENT_NM));
      const cls = kinds.includes("exam") ? "is-exam" : kinds.includes("off") ? "is-off" : "";
      cells += `<div class="okh-day ${cls}"><strong>${d}</strong>${ev
        .slice(0, 2)
        .map((e) => `<div>${esc(e.EVENT_NM)}</div>`)
        .join("")}</div>`;
    }
    return `<article class="okh-card">
      <h2>${y}년 ${m}월 학사</h2>
      <div class="okh-cal">
        ${["일", "월", "화", "수", "목", "금", "토"].map((d) => `<div class="okh-dow">${d}</div>`).join("")}
        ${cells}
      </div>
      <p class="okh-note">시험·고사·평가는 붉은 테두리. 방학·휴업은 흐리게. NEIS 행사명 기준입니다. 시험 범위는 없습니다.</p>
    </article>`;
  }

  function viewMap() {
    return `<div class="okh-grid okh-cols-2">
      <article class="okh-card">
        <h3>학교</h3>
        <ul class="okh-list">${state.schools
          .map(
            (s) => `<li class="okh-poi"><span><strong>${esc(s.name)}</strong><br><span class="okh-empty">${esc(s.address)}</span></span><span class="okh-chip">${esc(s.kind)}</span></li>`
          )
          .join("")}</ul>
      </article>
      <article class="okh-card">
        <h3>학원 · 도서관</h3>
        <ul class="okh-list">${ACADEMY_POIS.map(
          (p) => `<li class="okh-poi"><span><strong>${esc(p.name)}</strong><br><span class="okh-empty">${esc(p.note)}</span></span><span class="okh-chip">${esc(p.kind)}</span></li>`
        ).join("")}</ul>
        <p class="okh-note">좌표 맵 SDK는 호스트가 붙입니다. 모듈은 목록과 학교코드를 줍니다.</p>
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
      `<div class="okh-foot">모듈 @leadmaster/okgil-edu-hub · 출처 NEIS · ${esc(school.schoolCode)}</div>`;

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
    await loadSchoolData();
    paint();
    const s = schoolByCode(state.schoolCode, state.schools);
    emit({ type: "school.selected", schoolCode: s.schoolCode, schoolName: s.name });
  }

  return { root, start, unmount() { root.remove(); } };
}
