import { createHub } from "./ui/render.js";
import { OKH_CSS } from "./ui/css.js";

function ensureStyle() {
  if (document.querySelector("style[data-okh-style]")) return;
  const style = document.createElement("style");
  style.setAttribute("data-okh-style", "1");
  style.textContent = OKH_CSS;
  document.head.appendChild(style);
}

export function mountOkgilEduHub(el, options = {}) {
  if (!el) throw new Error("mountOkgilEduHub: element required");
  const hub = createHub(options);
  el.innerHTML = "";
  ensureStyle();
  el.appendChild(hub.root);
  hub.start();
  return {
    unmount() {
      hub.unmount();
      el.innerHTML = "";
    },
  };
}
