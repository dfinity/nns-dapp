import type { Principal } from "@dfinity/principal";
import type { SnsGetLifecycleResponse } from "@dfinity/sns";
import { writable, type Readable } from "svelte/store";

interface SnsLifecycleProjectData {
  data: SnsGetLifecycleResponse;
  certified: boolean;
}

interface SnsLifecycleData {
  [rootCanisterId: string]: SnsLifecycleProjectData;
}

export interface SnsLifecycleStore extends Readable<SnsLifecycleData> {
  setData: (data: {
    rootCanisterId: Principal;
    data: SnsGetLifecycleResponse;
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
      data: SnsGetLifecycleResponse;
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
