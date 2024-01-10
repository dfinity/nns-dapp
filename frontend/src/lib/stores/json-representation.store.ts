import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import type { Readable } from "svelte/store";
import { writableStored } from "./writable-stored";

type JsonRepresentationMode = "tree" | "raw";

export interface JsonRepresentationState {
  mode: JsonRepresentationMode;
}

export interface JsonRepresentationStore
  extends Readable<JsonRepresentationState> {
  setMode(mode: JsonRepresentationMode): void;
}

/**
 * A store that contains user preferences for the JSON representation.
 */
const initJsonRepresentationStore = (): JsonRepresentationStore => {
  const { subscribe, update } = writableStored<JsonRepresentationState>({
    key: StoreLocalStorageKey.JsonRepresentation,
    defaultValue: {
      mode: "tree",
    },
  });

  return {
    subscribe,
    setMode(mode: JsonRepresentationMode) {
      update((state) => ({
        ...state,
        mode,
      }));
    },
  };
};

export const jsonRepresentationStore = initJsonRepresentationStore();
