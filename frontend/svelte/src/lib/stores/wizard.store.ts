import { get, writable } from "svelte/store";

export type State = {
  currentIndex: number;
  previousIndex: number;
};

const initialState: State = {
  currentIndex: 0,
  previousIndex: 0,
};

function enumSize<EnumType>(enm: EnumType): number {
  return Object.values(enm).filter(isNaN).length;
}

/**
 * A store that contains the index of the step being rendered
 * - subscribe: subscribe to the value
 * - next: move to the next step
 * - back: move to the previous step
 * - reset: reset to the initial state
 */
export const initWizardStore = <EnumType>(steps: EnumType) => {
  const store = writable<State>(initialState);
  const { subscribe, update, set } = store;

  return {
    subscribe,
    next() {
      update(({ currentIndex, previousIndex }) =>
        currentIndex < enumSize(steps) - 1
          ? {
              currentIndex: currentIndex + 1,
              previousIndex: currentIndex,
            }
          : { currentIndex, previousIndex }
      );
    },
    back() {
      update(({ currentIndex, previousIndex }) =>
        currentIndex > 0
          ? { currentIndex: currentIndex - 1, previousIndex: currentIndex }
          : { currentIndex, previousIndex }
      );
    },
    diff() {
      let state: State = get(store);
      return state.currentIndex - state.previousIndex;
    },
    reset() {
      set(initialState);
    },
  };
};
