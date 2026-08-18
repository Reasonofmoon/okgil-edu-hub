import { mountOkgilEduHub } from "/src/index.js";

const log = document.getElementById("host-events");
const lines = [];

const handle = mountOkgilEduHub(document.getElementById("okgil-slot"), {
  officeCode: "J10",
  proxyUrl: "/api/neis",
  theme: "light",
  onEvent(e) {
    lines.unshift(`${new Date().toLocaleTimeString("ko-KR")}  ${e.type}  ${JSON.stringify(e)}`);
    log.textContent = lines.slice(0, 12).join("\n");
  },
});

window.__okgilHub = handle;
