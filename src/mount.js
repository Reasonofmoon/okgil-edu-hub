import { createHub } from "./ui/render.js";

const STYLE_URL = new URL("./ui/styles.css", import.meta.url);

function ensureStyle(root) {
  if (root.querySelector("link[data-okh-style]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = STYLE_URL.href;
  link.setAttribute("data-okh-style", "1");
  root.prepend(link);
}

export function mountOkgilEduHub(el, options = {}) {
  if (!el) throw new Error("mountOkgilEduHub: element required");
  const hub = createHub(options);
  el.innerHTML = "";
  ensureStyle(el);
  el.appendChild(hub.root);
  hub.start();
  return {
    unmount() {
      hub.unmount();
      el.innerHTML = "";
    },
  };
}
