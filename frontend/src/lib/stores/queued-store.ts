import { derived, writable, type Readable } from "svelte/store";

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

type StoreMutation<StoreData> = (StoreData) => StoreData;

type MutationKey = number;

interface StoreMutationEntry<StoreData> {
  mutationKey: MutationKey;
  certifiedMutation: StoreMutation<StoreData> | undefined;
  nonCertifiedMutation: StoreMutation<StoreData> | undefined;
}

interface QueuedStoreData<StoreData> {
  // Initial data with only certified mutations applied.
  certifiedData: StoreData;
  // Mutations which have not yet been applied to certifiedData.
  mutationQueue: StoreMutationEntry<StoreData>[];
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
    mutation: StoreMutation<StoreData>;
    certified: boolean;
  }) => void;
}

interface QueuedStore<StoreData> extends Readable<StoreData> {
  getSingleMutationStore: () => SingleMutationStore<StoreData>;
}

export const queuedStore = <StoreData>(
  initialData: StoreData
): QueuedStore<StoreData> => {
  const initialQueuedStoreData: QueuedStoreData<StoreData> = {
    certifiedData: initialData,
    mutationQueue: [],
  };
  const underlyingStore = writable<QueuedStoreData<StoreData>>(
    initialQueuedStoreData
  );

  const exposedStore = derived<Readable<QueuedStoreData<StoreData>>, StoreData>(
    underlyingStore,
    ({ certifiedData, mutationQueue }) => {
      let data = certifiedData;
      for (const entry of mutationQueue) {
        const mutation = entry.certifiedMutation || entry.nonCertifiedMutation;
        if (mutation) {
          data = mutation(data);
        }
      }
      return data;
    }
  );

  const addMutation = ({
    mutationKey,
    certified,
    mutation,
    storeData,
  }: {
    mutationKey: MutationKey;
    certified: boolean;
    mutation: StoreMutation<StoreData>;
    storeData: QueuedStoreData<StoreData>;
  }): QueuedStoreData<StoreData> => {
    let { certifiedData, mutationQueue } = storeData;

    // Update the entry in the queue with the given mutation key.
    mutationQueue = mutationQueue.map((entry) => {
      if (entry.mutationKey === mutationKey) {
        return certified
          ? {
              ...entry,
              certifiedMutation: mutation,
            }
          : {
              ...entry,
              nonCertifiedMutation: mutation,
            };
      }
      return entry;
    });

    // Apply finalized mutations from the front of the queue.
    while (mutationQueue.length > 0 && mutationQueue[0].certifiedMutation) {
      const mutation = mutationQueue.shift().certifiedMutation;
      certifiedData = mutation(certifiedData);
    }

    return {
      certifiedData,
      mutationQueue,
    };
  };

  let nextMutationKey = 1;

  return {
    subscribe: exposedStore.subscribe,

    getSingleMutationStore: () => {
      const mutationKey = nextMutationKey++;
      underlyingStore.update((storeData) => {
        const { mutationQueue } = storeData;
        const newEntry = {
          mutationKey,
          certifiedMutation: undefined,
          nonCertifiedMutation: undefined,
        };
        // We reserve a spot at the end of the queue, but we actually don't
        // know if mutations should be applied in the order they were
        // reserved. And we *can't know* unless we know the block height
        // corresponding to each response.
        return {
          ...storeData,
          mutationQueue: [...mutationQueue, newEntry],
        };
      });

      return {
        set({ data, certified }: { data: StoreData; certified: boolean }) {
          underlyingStore.update((storeData) =>
            addMutation({
              mutationKey,
              certified,
              mutation: (_) => data,
              storeData,
            })
          );
        },
        update({
          mutation,
          certified,
        }: {
          mutation: StoreMutation<StoreData>;
          certified: boolean;
        }) {
          underlyingStore.update((storeData) =>
            addMutation({
              mutationKey,
              certified,
              mutation,
              storeData,
            })
          );
        },
      };
    },
  };
};
