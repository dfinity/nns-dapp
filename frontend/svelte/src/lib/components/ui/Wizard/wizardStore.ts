import { writable } from "svelte/store";

const initStore = () => {
  const { subscribe, update, set } = writable<number>(0);

  return {
    subscribe,
    next() {
      update((index) => index + 1);
    },
    back() {
      update((index) => (index > 0 ? index - 1 : index));
    },
    reset() {
      set(0);
    },
  };
};

export const wizardStore = initStore();
