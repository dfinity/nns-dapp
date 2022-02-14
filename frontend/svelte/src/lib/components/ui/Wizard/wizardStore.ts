import { writable } from "svelte/store";

/**
 * A store that contains the index of the step being rendered by the Wizard
 * - subscribe: for external components to read the value
 * - next: move to the next step
 * - back: move to the previous step
 * - reset: go to the first step. Used when unmounting a Wizard, to reset it for the next Wizard.
 * Tested together with the `Wizard` and `WizardStep` in `Wizard.spec.ts`.
 */
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
