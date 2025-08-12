import type { FavProject } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Principal } from "@dfinity/principal";

export const toSnsFavProject = (rootCanisterId: Principal): FavProject => ({
  root_canister_id: rootCanisterId,
});

export const fromSnsFavProject = ({
  root_canister_id,
}: FavProject): Principal => root_canister_id;
