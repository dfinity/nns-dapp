import type { CanisterDetails } from "../canisters/nns-dapp/nns-dapp.types";
import { ONE_TRILLION } from "../constants/icp.constants";
import type { AuthStore } from "../stores/auth.store";
import type { CanistersStore } from "../stores/canisters.store";
import { formatNumber } from "./format.utils";

export const getCanisterFromStore = ({
  canisterId,
  canistersStore: { canisters },
}: {
  canisterId: string | undefined;
  canistersStore: CanistersStore;
}): CanisterDetails | undefined =>
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
}: CanisterDetails): {
  name: string;
  validName: boolean;
  canisterId: string;
} => {
  const canisterId: string = canister_id.toText();
  return {
    name: name ?? canisterId,
    validName: name.length > 0,
    canisterId,
  };
};

export const isUserController = ({
  controller,
  authStore,
}: {
  controller: string;
  authStore: AuthStore;
}): boolean => controller === authStore.identity?.getPrincipal().toText();
