import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Principal } from "@dfinity/principal";
import type { Writable } from "svelte/store";

export type CanisterDetailsModal = "add-cycles" | "detach";

/**
 * A store that contains canister info and detail.
 */
export interface SelectCanisterDetailsStore {
  info: CanisterInfo | undefined;
  details: CanisterDetails | undefined;
  controller: boolean | undefined;
  modal: CanisterDetailsModal | undefined;
}

export interface CanisterDetailsContext {
  store: Writable<SelectCanisterDetailsStore>;
  reloadDetails: (canisterId: Principal) => Promise<void>;
  toggleModal: (modal: CanisterDetailsModal | undefined) => void;
}

export const CANISTER_DETAILS_CONTEXT_KEY = Symbol("canister-details");
