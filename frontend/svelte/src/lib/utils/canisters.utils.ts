import type { Principal } from "@dfinity/principal";
import type { CanistersStore } from "../stores/canisters.store";

export const getCanisterInfoById = ({
  canisterId,
  canistersStore,
}: {
  canisterId: Principal;
  canistersStore: CanistersStore;
}) =>
  canistersStore.canisters?.find(
    ({ canister_id }) => canister_id.toText() === canisterId.toText()
  );
