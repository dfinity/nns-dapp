import type { QueryAndUpdateStrategy } from "$lib/services/utils.services";
import { nonNullish } from "@dfinity/utils";
import { writable, type Readable } from "svelte/store";

// A "queued store" is Svelte store which is aware of the queryAndUpdate
// mechanism. It keeps a queue of mutations which have been applied based on
// query (as opposed to update) responses. This way, when a update response for
// an older reqeust comes in, the store can re-apply the mutations from newer
// query responses to make sure the old update response doesn't revert newer
// data.
//
// Example usage:
// const { subscribe, getSingleMutationStore } = queuedStore(initialData);
// const loadData = async () => {
//   const { set, update } = getSingleMutationStore();
//   return queryAndUpdate({
//     request: ...
//     onLoad: ({ response: data, certified }) => set({ data, certified }),
//     ...
//   });
// };

type Mutation<StoreData> = (data: StoreData) => StoreData;

type MutationKey = number;

interface MutationEntry<StoreData> {
  mutationKey: MutationKey;
  strategy: QueryAndUpdateStrategy;
  certifiedMutation: Mutation<StoreData> | undefined;
  nonCertifiedMutation: Mutation<StoreData> | undefined;
}

// A store on which operations can be performed for a single mutation.
// Note that the changes applied for both the query and update response count as
// a single mutation and should be applied using the same store. The purpose of
// this store is to be able to associate the query and update response of the
// same mutation.
export interface SingleMutationStore<StoreData> {
  set: ({ data, certified }: { data: StoreData; certified: boolean }) => void;
  update: ({
    mutation,
    certified,
  }: {
    mutation: Mutation<StoreData>;
    certified: boolean;
  }) => void;
  // Cancels a mutation which hasn't been applied yet.
  // Call this to prevent it from staying in the queue forever.
  cancel: () => void;
}

interface QueuedStore<StoreData> extends Readable<StoreData> {
  getSingleMutationStore: (
    strategy?: QueryAndUpdateStrategy | undefined
  ) => SingleMutationStore<StoreData>;
  resetForTesting: () => void;
}

export const queuedStore = <StoreData>(
  initialData: StoreData
): QueuedStore<StoreData> => {
  let certifiedData = initialData;
  let mutationQueue: MutationEntry<StoreData>[] = [];

  const { subscribe, set } = writable<StoreData>(initialData);

  const updateExposedData = () => {
    let data = certifiedData;
    for (const entry of mutationQueue) {
      const mutation = entry.certifiedMutation || entry.nonCertifiedMutation;
      if (mutation) {
        data = mutation(data);
      }
    }
    set(data);
  };

  const isFinal = (entry: MutationEntry<StoreData>) => {
    switch (entry.strategy) {
      case "query_and_update":
      case "update":
        return nonNullish(entry.certifiedMutation);
      case "query":
        return nonNullish(entry.nonCertifiedMutation);
    }
  };

  const addMutation = ({
    mutationKey,
    certified,
    mutation,
  }: {
    mutationKey: MutationKey;
    certified: boolean;
    mutation: Mutation<StoreData>;
  }): void => {
    // Uncomment to disable queueing. Useful to verify that a unit test
    // actually exposes the race condition that is fixed by the queued store.
    //
    // if (true === true) {
    //   certifiedData = mutation(certifiedData);
    //   set(certifiedData);
    //   return;
    // }

    // Update the entry in the queue with the given mutation key.
    const entry = mutationQueue.find(
      (entry) => entry.mutationKey === mutationKey
    );
    if (!entry) {
      throw new Error("No entry found for this mutation " + mutationKey);
    }
    const key: keyof MutationEntry<StoreData> = certified
      ? "certifiedMutation"
      : "nonCertifiedMutation";
    if (entry[key]) {
      throw new Error(`We already have a ${key} for this entry`);
    }
    entry[key] = mutation;

    // Apply finalized mutations from the front of the queue.
    while (mutationQueue.length > 0 && isFinal(mutationQueue[0])) {
      // Becuase of the condition above, entry and mutation are guaranteed to
      // be defined.
      const entry = mutationQueue.shift();
      const mutation = entry?.certifiedMutation || entry?.nonCertifiedMutation;
      mutation && (certifiedData = mutation(certifiedData));
    }
    updateExposedData();
  };

  const cancel = (mutationKey: MutationKey) => {
    const entry = mutationQueue.find(
      (entry) => entry.mutationKey === mutationKey
    );
    if (!entry) {
      throw new Error("No entry found for this mutation");
    }
    if (entry.certifiedMutation || entry.nonCertifiedMutation) {
      throw new Error("This mutation has already been applied");
    }
    mutationQueue = mutationQueue.filter(
      (entry) => entry.mutationKey !== mutationKey
    );
  };

  let nextMutationKey = 1;

  return {
    subscribe,

    getSingleMutationStore: (strategy?: QueryAndUpdateStrategy | undefined) => {
      const mutationKey = nextMutationKey++;
      const newEntry = {
        mutationKey,
        strategy: strategy || "query_and_update",
        certifiedMutation: undefined,
        nonCertifiedMutation: undefined,
      };
      // We reserve a spot at the end of the queue, but we actually don't
      // know if mutations should be applied in the order they were
      // reserved. And we *can't know* unless we know the block height
      // corresponding to each response.
      mutationQueue.push(newEntry);

      return {
        set({ data, certified }: { data: StoreData; certified: boolean }) {
          addMutation({
            mutationKey,
            certified,
            mutation: (_) => data,
          });
        },
        update({
          mutation,
          certified,
        }: {
          mutation: Mutation<StoreData>;
          certified: boolean;
        }) {
          addMutation({
            mutationKey,
            certified,
            mutation,
          });
        },

        cancel() {
          cancel(mutationKey);
        },
      };
    },

    resetForTesting() {
      certifiedData = initialData;
      mutationQueue = [];
      set(initialData);
    },
  };
};
