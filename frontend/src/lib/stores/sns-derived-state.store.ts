import type { SnsSwapDid } from "@icp-sdk/canisters/sns";
import type { Principal } from "@icp-sdk/core/principal";
import { writable, type Readable } from "svelte/store";

interface SnsDerivedStateProjectData {
  derivedState: SnsSwapDid.GetDerivedStateResponse;
  certified: boolean;
  // The participant count of the newest certified response. An uncertified
  // response never sets it, so a forged query reply cannot change the count.
  certifiedDirectParticipantCount:
    | SnsSwapDid.GetDerivedStateResponse["direct_participant_count"]
    | undefined;
}

export interface SnsDerivedStateData {
  [rootCanisterId: string]: SnsDerivedStateProjectData;
}

export interface SnsDerivedStateStore extends Readable<SnsDerivedStateData> {
  setDerivedState: (params: {
    rootCanisterId: Principal;
    data: SnsSwapDid.GetDerivedStateResponse;
    certified: boolean;
  }) => void;
  reset: () => void;
}

/**
 * A store that contains the derived state of all sns projects.
 *
 * - setDerivedState: replace the derived state of an sns project with a new one.
 *   The certified participant count is kept when the new response is uncertified.
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
      data: SnsSwapDid.GetDerivedStateResponse;
      certified: boolean;
      rootCanisterId: Principal;
    }) {
      update((currentState: SnsDerivedStateData) => {
        const key = rootCanisterId.toText();
        return {
          ...currentState,
          [key]: {
            derivedState: data,
            certified,
            certifiedDirectParticipantCount: certified
              ? data.direct_participant_count
              : currentState[key]?.certifiedDirectParticipantCount,
          },
        };
      });
    },

    reset() {
      set({});
    },
  };
};

export const snsDerivedStateStore = initSnsDerivedStateStore();
