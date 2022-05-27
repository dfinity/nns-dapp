import type { Principal } from "@dfinity/principal";
import type { CanisterDetails as CanisterInfo } from "../canisters/nns-dapp/nns-dapp.types";
import type { CanistersStore } from "../stores/canisters.store";

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
