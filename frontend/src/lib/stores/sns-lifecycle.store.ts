import type { SnsSwapDid } from "@icp-sdk/canisters/sns";
import type { Principal } from "@icp-sdk/core/principal";
import { writable, type Readable } from "svelte/store";

interface SnsLifecycleProjectData {
  data: SnsSwapDid.GetLifecycleResponse;
  certified: boolean;
}

export interface SnsLifecycleData {
  [rootCanisterId: string]: SnsLifecycleProjectData;
}

export interface SnsLifecycleStore extends Readable<SnsLifecycleData> {
  setData: (data: {
    rootCanisterId: Principal;
    data: SnsSwapDid.GetLifecycleResponse;
    certified: boolean;
  }) => void;
  reset: () => void;
}

/**
 * A store that contains the lifecycle all sns projects.
 *
 * - setData: replace the project lifecycle with a new one.
 */
const initSnsLifecycleStore = (): SnsLifecycleStore => {
  const { subscribe, set, update } = writable<SnsLifecycleData>({});

  return {
    subscribe,

    setData({
      rootCanisterId,
      data,
      certified,
    }: {
      rootCanisterId: Principal;
      data: SnsSwapDid.GetLifecycleResponse;
      certified: boolean;
    }) {
      update((currentState) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          data,
          certified,
        },
      }));
    },

    reset() {
      set({});
    },
  };
};

export const snsLifecycleStore = initSnsLifecycleStore();
