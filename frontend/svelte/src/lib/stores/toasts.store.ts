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
 * - hide: remove the toast message with that timestamp or the first one.
 */
const initToastsStore = () => {
  const { subscribe, update, set } = writable<ToastMsg[]>([]);

  return {
    subscribe,

    show(msg: ToastMsg) {
      update((messages: ToastMsg[]) => {
        const id = Symbol();
        return [...messages, { ...msg, id }];
      });
    },

    success({
      labelKey,
      substitutions,
    }: Pick<ToastMsg, "labelKey" | "substitutions">) {
      this.show({
        labelKey,
        substitutions,
        level: "success",
        duration: DEFAULT_TOAST_DURATION_MILLIS,
      });
    },

    error({
      labelKey,
      err,
      substitutions,
    }: {
      labelKey: string;
      err?: unknown;
      substitutions?: { [from: string]: string };
    }) {
      this.show({
        labelKey,
        level: "error",
        detail: errorToString(err),
        substitutions,
      });

      if (err !== undefined) {
        console.error(err);
      }
    },

    hide(idToHide?: symbol) {
      // If not specified, we remove the first one
      if (idToHide === undefined) {
        update((messages: ToastMsg[]) => messages.slice(1));
      } else {
        update((messages: ToastMsg[]) =>
          messages.filter(({ id }) => id !== idToHide)
        );
      }
    },

    reset() {
      set([]);
    },
  };
};

export const toastsStore = initToastsStore();
