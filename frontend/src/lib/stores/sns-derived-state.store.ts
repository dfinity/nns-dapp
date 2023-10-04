import type { Principal } from "@dfinity/principal";
import type { SnsGetDerivedStateResponse } from "@dfinity/sns";
import { writable, type Readable } from "svelte/store";

interface SnsDerivedStateProjectData {
  derivedState: SnsGetDerivedStateResponse;
  certified: boolean;
}

export interface SnsDerivedStateData {
  [rootCanisterId: string]: SnsDerivedStateProjectData;
}

export interface SnsDerivedStateStore extends Readable<SnsDerivedStateData> {
  setDerivedState: (params: {
    rootCanisterId: Principal;
    data: SnsGetDerivedStateResponse;
    certified: boolean;
  }) => void;
  reset: () => void;
}

/**
 * A store that contains the derived state of all sns projects.
 *
 * - setDerivedState: replace the derived state of an sns project with a new one.
 */
const initSnsDerivedStateStore = (): SnsDerivedStateStore => {
  const { subscribe, set, update } = writable<SnsDerivedStateData>({});

  return {
    subscribe,

    setDerivedState({
      data,
      certified,
      rootCanisterId,
    }: {
      data: SnsGetDerivedStateResponse;
      certified: boolean;
      rootCanisterId: Principal;
    }) {
      update((currentState: SnsDerivedStateData) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          derivedState: data,
          certified,
        },
      }));
    },

    reset() {
      set({});
    },
  };
};

export const snsDerivedStateStore = initSnsDerivedStateStore();
