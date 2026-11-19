import type { ToastLevel, ToastMsg } from "$lib/gix/types/toast";
import { nonNullish } from "@dfinity/utils";
import { writable, type Readable } from "svelte/store";

export interface ToastsStore extends Readable<ToastMsg[]> {
  show: (msg: Partial<Pick<ToastMsg, "id">> & Omit<ToastMsg, "id">) => symbol;
  hide: (idToHide: symbol) => void;
  update: (params: {
    id: symbol;
    content: Partial<Omit<ToastMsg, "id">>;
  }) => void;
  reset: (levels?: ToastLevel[]) => void;
}

/**
 * Toast messages.
 *
 * - show: display a message in toast component
 * - hide: remove the toast message with that timestamp or the first one.
 * - update: update the existed toast content.
 * - reset: empty all toasts or optionally only those that match particular levels
 */
const initToastsStore = (): ToastsStore => {
  const { subscribe, update, set } = writable<ToastMsg[]>([]);

  return {
    subscribe,

    show: ({
      id,
      ...rest
    }: Partial<Pick<ToastMsg, "id">> & Omit<ToastMsg, "id">): symbol => {
      const toastId = id ?? Symbol("toast");

      update((messages: ToastMsg[]) => [...messages, { ...rest, id: toastId }]);

      return toastId;
    },

    hide: (idToHide: symbol) => {
      update((messages: ToastMsg[]) =>
        messages.filter(({ id }) => id !== idToHide)
      );
    },

    update: ({
      id,
      content,
    }: {
      id: symbol;
      content: Partial<Omit<ToastMsg, "id">>;
    }) => {
      update((messages: ToastMsg[]) =>
        // use map to preserve order
        messages.map((message) => {
          if (message.id !== id) {
            return message;
          }
          return {
            ...message,
            ...content,
          };
        })
      );
    },

    reset: (levels?: ToastLevel[]) => {
      if (nonNullish(levels) && levels.length > 0) {
        update((messages: ToastMsg[]) =>
          messages.filter(({ level }) => !levels.includes(level))
        );
        return;
      }

      set([]);
    },
  };
};

export const toastsStore = initToastsStore();
