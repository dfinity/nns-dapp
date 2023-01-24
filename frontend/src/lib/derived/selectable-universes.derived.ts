import {
  CKBTC_LEDGER_CANISTER_ID,
  OWN_CANISTER_ID,
} from "$lib/constants/canister-ids.constants";
import { pageStore, type Page } from "$lib/derived/page.derived";
import {
  committedProjectsStore,
  type SnsFullProject,
} from "$lib/derived/projects.derived";
import type { Universe } from "$lib/types/universe";
import { isCkBTCProject } from "$lib/utils/projects.utils";
import { pathSupportsCkBTC } from "$lib/utils/universe.utils";
import { derived, type Readable } from "svelte/store";

export const NNS_UNIVERSE: Universe = {
  canisterId: OWN_CANISTER_ID.toText(),
};

export const CKBTC_UNIVERSE: Universe = {
  canisterId: CKBTC_LEDGER_CANISTER_ID.toText(),
};

const universesStore = derived<
  Readable<SnsFullProject[] | undefined>,
  Universe[]
>(committedProjectsStore, (projects: SnsFullProject[] | undefined) => [
  NNS_UNIVERSE,
  CKBTC_UNIVERSE,
  ...(projects?.map(({ rootCanisterId, summary }) => ({
    canisterId: rootCanisterId.toText(),
    summary,
  })) ?? []),
]);

export const selectableUniversesStore = derived<
  [Readable<Universe[]>, Readable<Page>],
  Universe[]
>([universesStore, pageStore], ([universes, page]: [Universe[], Page]) =>
  universes.filter(
    ({ canisterId }) => pathSupportsCkBTC(page) || !isCkBTCProject(canisterId)
  )
);
