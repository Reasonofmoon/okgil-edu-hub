import { mountOkgilEduHub } from "./mount.js";

export function OkgilEduHub(props) {
  const React = props.react || globalThis.React;
  if (!React) {
    throw new Error("OkgilEduHub needs React in scope, or pass props.react");
  }
  const { useRef, useEffect } = React;
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const handle = mountOkgilEduHub(ref.current, props);
    return () => handle.unmount();
  }, [props.schoolCodes, props.proxyUrl, props.neisKey, props.theme]);
  return React.createElement("div", { ref, "data-okh-react": "1" });
}
