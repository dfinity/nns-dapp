import type { Principal } from "@dfinity/principal";
import type { CanisterDetails as CanisterInfo } from "../canisters/nns-dapp/nns-dapp.types";
import type { CanistersStore } from "../stores/canisters.store";
import { formatNumber } from "./format.utils";

export const getCanisterInfoById = ({
  canisterId,
  canistersStore,
}: {
  canisterId: Principal;
  canistersStore: CanistersStore;
}): CanisterInfo | undefined =>
  canistersStore.canisters?.find(
    ({ canister_id }) => canister_id.toText() === canisterId.toText()
  );

export const formatCyclesToTCycles = (cycles: bigint): string =>
  formatNumber(Number(cycles) / 1_000_000_000_000, {
    minFraction: 3,
    maxFraction: 3,
  });
