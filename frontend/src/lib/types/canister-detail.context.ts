import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Principal } from "@dfinity/principal";
import type { Writable } from "svelte/store";

export type CanisterDetailsModal =
  | "add-cycles"
  | "detach"
  | "add-controller"
  | "remove-controller";

/**
 * A store that contains canister info and detail.
 */
export interface SelectCanisterDetailsStore {
  info: CanisterInfo | undefined;
  details: CanisterDetails | undefined;
  controller: boolean | undefined;
  modal: CanisterDetailsModal | undefined;
  // TODO: find a better pattern than including the selected controller within the canister context and thus just to open the related modal
  selectedController: string | undefined;
}

export interface CanisterDetailsContext {
  store: Writable<SelectCanisterDetailsStore>;
  reloadDetails: (canisterId: Principal) => Promise<void>;
  toggleModal: (modal: CanisterDetailsModal | undefined) => void;
}

export const CANISTER_DETAILS_CONTEXT_KEY = Symbol("canister-details");
