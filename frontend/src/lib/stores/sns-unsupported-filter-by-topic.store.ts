import type { CanisterIdString } from "@icp-sdk/canisters/nns";
import { get, writable, type Readable } from "svelte/store";

export type UnsupportedFilterByTopicCanistersStoreData =
  Array<CanisterIdString>;

export interface UnsupportedFilterByTopicCanistersStore
  extends Readable<UnsupportedFilterByTopicCanistersStoreData> {
  add: (rootCanisterId: CanisterIdString) => void;
  has: (rootCanisterId: CanisterIdString) => boolean;
  delete: (rootCanisterId: CanisterIdString) => void;
}

export const initUnsupportedFilterByTopicSnsesStore =
  (): UnsupportedFilterByTopicCanistersStore => {
    const initialUnsupportedCanisters: Array<CanisterIdString> = [];

    const { subscribe, update } =
      writable<UnsupportedFilterByTopicCanistersStoreData>(
        initialUnsupportedCanisters
      );

    return {
      subscribe,
      add: (rootCanisterId) => {
        update((canisters) => {
          if (canisters.includes(rootCanisterId)) return canisters;
          return [...canisters, rootCanisterId];
        });
      },
      has: (rootCanisterId) => {
        const canisters = get({ subscribe });
        return canisters.includes(rootCanisterId);
      },
      delete: (rootCanisterId) => {
        update((canisters) => {
          return [...canisters].filter((id) => id !== rootCanisterId);
        });
      },
    };
  };

export const unsupportedFilterByTopicSnsesStore =
  initUnsupportedFilterByTopicSnsesStore();
