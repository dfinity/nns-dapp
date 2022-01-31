import { writable } from "svelte/store";

export interface ToastMsg {
  labelKey: string;
  level: "info" | "error";
}

const initToastsStore = () => {
  const { subscribe, update } = writable<ToastMsg[]>([]);

  return {
    subscribe,

    show(msg: ToastMsg) {
      update((messages: ToastMsg[]) => [...messages, msg]);
    },

    hide(index: number) {
      update((messages: ToastMsg[]) =>
        messages.filter((msg: ToastMsg, i: number) => index !== i)
      );
    },
  };
};

export const toastsStore = initToastsStore();
