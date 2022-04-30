import { writable } from "svelte/store";
import { DEFAULT_TOAST_DURATION_MILLIS } from "../constants/constants";
import type { ToastMsg } from "../types/toast";
import { errorToString } from "../utils/error.utils";

/**
 * Toast messages.
 *
 * - show: display a message in toast component - messages are stacked but only one is displayed
 * - success: display a message of type "success" - something went really well ;)
 * - error: display an error and print the issue in the console as well
 * - hide: remove the toast message at the first position i.e. hide the currently displayed message
 */
const initToastsStore = () => {
  const { subscribe, update } = writable<ToastMsg[]>([]);

  return {
    subscribe,

    show(msg: ToastMsg) {
      update((messages: ToastMsg[]) => [...messages, msg]);
    },

    success({ labelKey }: Pick<ToastMsg, "labelKey">) {
      this.show({
        labelKey,
        level: "success",
        duration: DEFAULT_TOAST_DURATION_MILLIS,
      });
    },

    error({ labelKey, err }: { labelKey: string; err?: unknown }) {
      this.show({ labelKey, level: "error", detail: errorToString(err) });

      if (err !== undefined) {
        console.error(err);
      }
    },

    hide() {
      update((messages: ToastMsg[]) => messages.slice(1));
    },
  };
};

export const toastsStore = initToastsStore();
