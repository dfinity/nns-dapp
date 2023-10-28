import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "./writable-stored";

type JsonRepresentationMode = "pretty" | "raw";

/**
 * A store that contains user preferences for the JSON representation.
 */
export const jsonRepresentationModeStore =
  writableStored<JsonRepresentationMode>({
    key: StoreLocalStorageKey.JsonRepresentationMode,
    defaultValue: "pretty",
  });
