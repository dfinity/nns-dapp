import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";
import { pageStore, type Page } from "$lib/derived/page.derived";
import {
  snsProjectsCommittedStore,
  type SnsFullProject,
} from "$lib/derived/sns/sns-projects.derived";
import type { Universe } from "$lib/types/universe";
import { isUniverseCkBTC, pathSupportsCkBTC } from "$lib/utils/universe.utils";
import { derived, type Readable } from "svelte/store";

export const NNS_UNIVERSE: Universe = {
  canisterId: OWN_CANISTER_ID_TEXT,
};

const universesStore = derived<
  [Readable<SnsFullProject[]>, Readable<Universe[]>],
  Universe[]
>(
  [snsProjectsCommittedStore, ckBTCUniversesStore],
  ([projects, ckBTCUniverses]: [SnsFullProject[], Universe[]]) => [
    NNS_UNIVERSE,
    ...ckBTCUniverses,
    ...(projects.map(({ rootCanisterId, summary }) => ({
      canisterId: rootCanisterId.toText(),
      summary,
    })) ?? []),
  ]
);

export const selectableUniversesStore = derived<
  [Readable<Universe[]>, Readable<Page>],
  Universe[]
>([universesStore, pageStore], ([universes, page]: [Universe[], Page]) =>
  universes.filter(
    ({ canisterId }) => pathSupportsCkBTC(page) || !isUniverseCkBTC(canisterId)
  )
);
