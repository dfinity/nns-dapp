import type {
  UniverseCanisterId,
  UniverseCanisterIdText,
} from "$lib/types/universe";
import type { RetrieveBtcStatusV2WithId } from "@dfinity/ckbtc";
import { writable, type Readable } from "svelte/store";

type CkbtcRetrieveBtcStatusesStoreData = Record<
  UniverseCanisterIdText,
  RetrieveBtcStatusV2WithId[]
>;

export interface CkbtcRetrieveBtcStatusesStore
  extends Readable<CkbtcRetrieveBtcStatusesStoreData> {
  setForUniverse: (params: {
    universeId: UniverseCanisterId;
    statuses: RetrieveBtcStatusV2WithId[];
  }) => void;
  reset: () => void;
}

const initCkbtcRetrieveBtcStatusesStore = (): CkbtcRetrieveBtcStatusesStore => {
  const initialData: CkbtcRetrieveBtcStatusesStoreData = {};

  const { subscribe, update, set } =
    writable<CkbtcRetrieveBtcStatusesStoreData>(initialData);

  return {
    subscribe,

    setForUniverse: ({
      universeId,
      statuses,
    }: {
      universeId: UniverseCanisterId;
      statuses: RetrieveBtcStatusV2WithId[];
    }) => {
      update((currentState) => ({
        ...currentState,
        [universeId.toText()]: [...statuses],
      }));
    },

    reset: () => set(initialData),
  };
};

export const ckbtcRetrieveBtcStatusesStore =
  initCkbtcRetrieveBtcStatusesStore();
