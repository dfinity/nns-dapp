import type { Writable } from "svelte/store";
import type { CanisterDetails } from "../canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "../canisters/nns-dapp/nns-dapp.types";

/**
 * A store that contains canister info and detail.
 */
export interface SelectCanisterDetailsStore {
  info: CanisterInfo | undefined;
  details: CanisterDetails | undefined;
}

export interface CanisterDetailsContext {
  store: Writable<SelectCanisterDetailsStore>;
  refetchDetails: () => Promise<void>;
}

export const CANISTER_DETAILS_CONTEXT_KEY = Symbol("canister-details");
