import type { StoreData } from "$lib/types/store";

export const isStoreData = <T>(storeData: StoreData<T>): storeData is T =>
  storeData !== "not loaded" && !(storeData instanceof Error);
