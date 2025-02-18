import { writable } from "svelte/store";

interface CheckedBlockIndicesStore {
  [blockIndex: string]: true;
}

// Attaching a canister is a 3-step process. If the process gets
// interrupted, we can re-notify the CMC to finish the process.
//  Since this is just a fallback mechanism, we don't need to do it more than
//  once per session. This store keeps track of the funding transaction that
//  have already been checked this session.
const initBlockIndicesStore = () => {
  const { subscribe, update } = writable<CheckedBlockIndicesStore>({});

  return {
    subscribe,

    // Returns true if the subaccount was added this time and false if it was
    // already in the store.
    addBlockIndex(blockIndex: bigint): boolean {
      const blockIndexString = blockIndex.toString();
      let result = true;
      update((currentState: CheckedBlockIndicesStore) => {
        const isPresent = blockIndexString in currentState;
        result = !isPresent;
        return isPresent
          ? currentState
          : {
              ...currentState,
              [blockIndexString]: true,
            };
      });
      return result;
    },
  };
};

export const checkedAttachCanisterBlockIndicesStore = initBlockIndicesStore();
