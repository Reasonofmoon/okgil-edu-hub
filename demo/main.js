import { mountOkgilEduHub } from "/src/index.js";

const log = document.getElementById("host-events");

function row(e) {
  const time = new Date().toLocaleTimeString("ko-KR");
  const label = e.schoolName || e.studentId || e.start || "";
  const li = document.createElement("li");
  li.innerHTML = `<span class="t">${time}</span><span class="k">${e.type}</span><span>${label}</span>`;
  return li;
}

const handle = mountOkgilEduHub(document.getElementById("okgil-slot"), {
  officeCode: "J10",
  proxyUrl: "/api/neis",
  theme: "light",
  onEvent(e) {
    log.prepend(row(e));
    while (log.children.length > 8) log.lastElementChild.remove();
  },
});

window.__okgilHub = handle;
