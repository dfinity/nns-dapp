import type { CanisterIdString } from "@dfinity/nns";
import { get, writable, type Readable } from "svelte/store";

export type UnsupportedFilterByTopicCanistersStoreData =
  Array<CanisterIdString>;

export interface UnsupportedFilterByTopicCanistersStore
  extends Readable<UnsupportedFilterByTopicCanistersStoreData> {
  add: (canisterId: CanisterIdString) => void;
  has: (canisterId: CanisterIdString) => boolean;
  delete: (canisterId: CanisterIdString) => void;
}

export const initUnsupportedFilterByTopicCanistersStore =
  (): UnsupportedFilterByTopicCanistersStore => {
    const initialUnsupportedCanisters: Array<CanisterIdString> = [];

    const { subscribe, update } =
      writable<UnsupportedFilterByTopicCanistersStoreData>(
        initialUnsupportedCanisters
      );

    return {
      subscribe,
      add: (canisterId) => {
        update((canisters) => {
          if (canisters.includes(canisterId)) return canisters;
          return [...canisters, canisterId];
        });
      },
      has: (canisterId) => {
        const canisters = get({ subscribe });
        return canisters.includes(canisterId);
      },
      delete: (canisterId) => {
        update((canisters) => {
          return [...canisters].filter((id) => id !== canisterId);
        });
      },
    };
  };

export const unsupportedFilterByTopicCanistersStore =
  initUnsupportedFilterByTopicCanistersStore();
