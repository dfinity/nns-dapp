import { NOT_LOADED } from "$lib/constants/stores.constants";
import type { StoreData } from "$lib/types/store";

export const isStoreData = <T>(storeData: StoreData<T>): storeData is T =>
  storeData !== NOT_LOADED && !(storeData instanceof Error);
