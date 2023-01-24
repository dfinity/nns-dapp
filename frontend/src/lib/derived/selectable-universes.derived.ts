import {
  CKBTC_LEDGER_CANISTER_ID,
  OWN_CANISTER_ID,
} from "$lib/constants/canister-ids.constants";
import { ENABLE_CKBTC_LEDGER } from "$lib/constants/environment.constants";
import {
  committedProjectsStore,
  type SnsFullProject,
} from "$lib/derived/projects.derived";
import type { Universe } from "$lib/types/universe";
import { derived, type Readable } from "svelte/store";

export const NNS_UNIVERSE: Universe = {
  canisterId: OWN_CANISTER_ID.toText(),
};

export const CKBTC_UNIVERSE: Universe = {
  canisterId: CKBTC_LEDGER_CANISTER_ID.toText(),
};

export const selectableUniversesStore = derived<
  Readable<SnsFullProject[] | undefined>,
  Universe[]
>(committedProjectsStore, (projects: SnsFullProject[] | undefined) => [
  NNS_UNIVERSE,
  ...(ENABLE_CKBTC_LEDGER ? [CKBTC_UNIVERSE] : []),
  ...(projects?.map(({ rootCanisterId, summary }) => ({
    canisterId: rootCanisterId.toText(),
    summary,
  })) ?? []),
]);
