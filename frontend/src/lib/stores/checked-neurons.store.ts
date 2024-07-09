import { writable } from "svelte/store";

interface UniverseCheckedNeuronSubaccountStore {
  [subaccountHex: string]: true;
}

interface CheckedNeuronSubaccountsStore {
  [universeId: string]: UniverseCheckedNeuronSubaccountStore;
}

// Staking or topping up a neuron is a 2-step process. If the process gets
// interrupted, we can check the balance of a neuron's subaccount to see if the
// process needs to be resumed. Since this is just a fallback mechanism, we
// don't need to do it more than once per neuron per session. This store keeps
// track of the neurons that have already been checked this session.
const initCheckedNeuronSubaccountsStore = () => {
  const { subscribe, update, set } = writable<CheckedNeuronSubaccountsStore>(
    {}
  );

  return {
    subscribe,

    // Returns true if the subaccount was added this time and false if it was
    // already in the store.
    addSubaccount({
      universeId,
      subaccountHex,
    }: {
      universeId: string;
      subaccountHex: string;
    }): boolean {
      let result = true;
      update((currentState: CheckedNeuronSubaccountsStore) => {
        const isPresent = currentState[universeId]?.[subaccountHex] ?? false;
        result = !isPresent;
        return isPresent
          ? currentState
          : {
              ...currentState,
              [universeId]: {
                ...currentState[universeId],
                [subaccountHex]: true,
              },
            };
      });
      return result;
    },
    reset() {
      set({});
    },
  };
};

export const checkedNeuronSubaccountsStore =
  initCheckedNeuronSubaccountsStore();
