import { writable } from "svelte/store";
import type { ToastMsg } from "../types/toast";
import { errorToString } from "../utils/error.utils";

/**
 * Toast messages.
 *
 * - show: display a message in toast component - messages are stacked but only one is displayed
 * - hide: remove the toast message at the first position i.e. hide the currently displayed message
 */
const initToastsStore = () => {
  const { subscribe, update } = writable<ToastMsg[]>([]);

  return {
    subscribe,

    show(msg: ToastMsg) {
      update((messages: ToastMsg[]) => [...messages, msg]);
    },

    error({ labelKey, err }: { labelKey: string; err?: unknown }) {
      update((messages: ToastMsg[]) => [
        ...messages,
        { labelKey, level: "error", detail: errorToString(err) },
      ]);

      console.error(err);
    },

    hide() {
      update((messages: ToastMsg[]) => messages.slice(1));
    },
  };
};

export const toastsStore = initToastsStore();
