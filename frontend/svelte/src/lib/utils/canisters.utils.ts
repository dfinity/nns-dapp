import type { CanisterDetails } from "../canisters/nns-dapp/nns-dapp.types";
import { ONE_TRILLION } from "../constants/icp.constants";
import type { CanistersStore } from "../stores/canisters.store";
import { formatNumber } from "./format.utils";

export const getCanisterFromStore = ({
  canisterId,
  canistersStore: { canisters },
}: {
  canisterId: string | undefined;
  canistersStore: CanistersStore;
}): CanisterDetails | undefined =>
  canisters?.find(
    ({ canister_id }) => canister_id.toText() === canisterId
  );

export const formatCyclesToTCycles = (cycles: bigint): string =>
  formatNumber(Number(cycles) / Number(ONE_TRILLION), {
    minFraction: 3,
    maxFraction: 3,
  });
