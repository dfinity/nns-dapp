import {
  CKBTC_UNIVERSE_CANISTER_ID,
  OWN_CANISTER_ID,
} from "$lib/constants/canister-ids.constants";
import { ENABLE_CKBTC_LEDGER } from "$lib/constants/environment.constants";
import { pageStore, type Page } from "$lib/derived/page.derived";
import {
  snsProjectsCommittedStore,
  type SnsFullProject,
} from "$lib/derived/sns/sns-projects.derived";
import type { Universe } from "$lib/types/universe";
import { isUniverseCkBTC, pathSupportsCkBTC } from "$lib/utils/universe.utils";
import { derived, type Readable } from "svelte/store";

export const NNS_UNIVERSE: Universe = {
  canisterId: OWN_CANISTER_ID.toText(),
};

export const CKBTC_UNIVERSE: Universe = {
  canisterId: CKBTC_UNIVERSE_CANISTER_ID.toText(),
};

const universesStore = derived<
  Readable<SnsFullProject[] | undefined>,
  Universe[]
>(snsProjectsCommittedStore, (projects: SnsFullProject[] | undefined) => [
  NNS_UNIVERSE,
  ...(ENABLE_CKBTC_LEDGER ? [CKBTC_UNIVERSE] : []),
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
    ({ canisterId }) => pathSupportsCkBTC(page) || !isUniverseCkBTC(canisterId)
  )
);
