import { writable } from "svelte/store";

export type State = {
  currentIndex: number;
  previousIndex: number;
};

const initialState: State = {
  currentIndex: 0,
  previousIndex: 0,
};

/**
 * A store that contains the index of the step being rendered
 * - subscribe: subscribe to the value
 * - next: move to the next step
 * - back: move to the previous step
 * - reset: reset to the initial state
 */
export const initWizardStore = () => {
  const { subscribe, update, set } = writable<State>(initialState);

  return {
    subscribe,
    next() {
      update(({ currentIndex }) => ({
        currentIndex: currentIndex + 1,
        previousIndex: currentIndex,
      }));
    },
    back() {
      update(({ currentIndex, previousIndex }) =>
        currentIndex - 1 >= 0
          ? { currentIndex: currentIndex - 1, previousIndex: currentIndex }
          : { currentIndex, previousIndex }
      );
    },
    reset() {
      set(initialState);
    },
  };
};
