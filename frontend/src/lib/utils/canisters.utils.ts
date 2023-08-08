import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
import { CanisterStatus } from "$lib/canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { MAX_CANISTER_NAME_LENGTH } from "$lib/constants/canisters.constants";
import { ONE_TRILLION } from "$lib/constants/icp.constants";
import type { AuthStoreData } from "$lib/stores/auth.store";
import type { CanistersStore } from "$lib/stores/canisters.store";
import { i18n } from "$lib/stores/i18n";
import type { CanisterId } from "$lib/types/canister";
import { Principal } from "@dfinity/principal";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import { formatNumber } from "./format.utils";
import { replacePlaceholders } from "./i18n.utils";

export const getCanisterFromStore = ({
  canisterId,
  canistersStore: { canisters },
}: {
  canisterId: string | undefined | null;
  canistersStore: CanistersStore;
}): CanisterInfo | undefined =>
  canisters?.find(({ canister_id }) => canister_id.toText() === canisterId);

export const formatCyclesToTCycles = (cycles: bigint): string =>
  formatNumber(Number(cycles) / Number(ONE_TRILLION), {
    minFraction: 3,
    maxFraction: 3,
  });

/**
 * If no name is provided for the canister the information fallbacks to its ID.
 */
export const mapCanisterDetails = ({
  canister_id,
  name,
}: CanisterInfo): {
  name: string;
  validName: boolean;
  canisterId: string;
} => {
  const canisterId = canister_id.toText();
  return {
    name: name ?? canisterId,
    validName: name.length > 0,
    canisterId,
  };
};

export const isController = ({
  controller,
  canisterDetails,
}: {
  controller: string;
  canisterDetails: CanisterDetails;
}): boolean => canisterDetails.settings.controllers.includes(controller);

export const isUserController = ({
  controller,
  authStore,
}: {
  controller: string;
  authStore: AuthStoreData;
}): boolean => controller === authStore.identity?.getPrincipal().toText();

export const canisterStatusToText = (status: CanisterStatus): string => {
  const i18nObj = get(i18n);

  switch (status) {
    case CanisterStatus.Stopped:
      return i18nObj.canister_detail.status_stopped;
    case CanisterStatus.Stopping:
      return i18nObj.canister_detail.status_stopping;
    default:
      return i18nObj.canister_detail.status_running;
  }
};

export const mapCanisterId = (canisterId: CanisterId | string): CanisterId =>
  typeof canisterId === "string" ? Principal.fromText(canisterId) : canisterId;

export const errorCanisterNameMessage = (name: string | undefined) => {
  if (nonNullish(name) && name.length > MAX_CANISTER_NAME_LENGTH) {
    const i18nObj = get(i18n);
    return replacePlaceholders(
      i18nObj.canister_detail.canister_name_error_too_long,
      { $max: String(MAX_CANISTER_NAME_LENGTH) }
    );
  }
  return undefined;
};

export const areEnoughCyclesSelected = ({
  amountCycles,
  minimumCycles,
}: {
  minimumCycles: number | undefined;
  amountCycles: number | undefined;
}): boolean =>
  (amountCycles ?? 0) >= (minimumCycles ?? 0) && (amountCycles ?? 0) > 0;
