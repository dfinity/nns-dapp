import { generateDebugLogProxy } from "../proxy/debug.services.proxy";

export const isNode = (): boolean =>
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

/**
 *
 * console.log with time prefix (e.g. "[15:22:55.438] message text")
 */
export const logWithTimestamp = (...args: string[]): void => {
  if (isNode() === true) return;

  const time = `[${new Date().toISOString().split("T")[1].replace("Z", "")}]`;
  console.log.call(console, ...[time, ...args]);
};

// Insecure but fast
// https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
const seed = Math.round(Math.random() * 1e6);
export const hashCode = (value: string | bigint | number): string =>
  (
    Array.from(`${value}`).reduce(
      (s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0,
      0
    ) + seed
  )
    .toString(36)
    .toUpperCase();

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export const digestText = async (text: string): Promise<string> => {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  // convert buffer to byte array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

export function triggerDebugReport(node: HTMLElement) {
  const FIVE_SECONDS = 5 * 1000;
  const startEvent = "ontouchstart" in document ? "touchstart" : "mousedown";
  const stopEvent = "ontouchend" in document ? "touchend" : "mouseup";
  const moveEvent = "ontouchmove" in document ? "touchmove" : "mousemove";

  let originalUserSelectValue: string = node.style.userSelect;
  let stopTimeout: number | undefined;

  const start = () => {
    stop();

    stopTimeout = Date.now() + FIVE_SECONDS;

    node.addEventListener(stopEvent, onPressUp);
    node.addEventListener(moveEvent, onMove);
  };
  const stop = () => {
    node.removeEventListener(stopEvent, onPressUp);
    node.removeEventListener(moveEvent, onMove);
  };
  const onPressDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    start();
  };
  const onPressUp = () => {
    if (stopTimeout !== undefined && Date.now() >= stopTimeout) {
      generateDebugLogProxy().then();
    }

    stop();
  };
  const onMove = () => stop();

  node.addEventListener(startEvent, onPressDown, true);
  node.style.userSelect = "none";

  node.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation(); // not necessary in my case, could leave in case stopImmediateProp isn't available?
    event.stopImmediatePropagation();
    return false;
  });

  return {
    destroy() {
      stop();
      node.removeEventListener(startEvent, onPressDown, true);
      node.style.userSelect = originalUserSelectValue;
    },
  };
}
