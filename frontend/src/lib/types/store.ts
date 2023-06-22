import type { NOT_LOADED } from "$lib/constants/stores.constants";

/**
 * - Not Loaded: NOT_LOADED
 * - Error: Error
 * - Success: T
 */
export type StoreData<T> = T | Error | typeof NOT_LOADED;
