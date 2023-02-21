import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { pageStore, type Page } from "$lib/derived/page.derived";
import {
  snsProjectsCommittedStore,
  type SnsFullProject,
} from "$lib/derived/sns/sns-projects.derived";
import {
  ENABLE_CKBTC_LEDGER,
  ENABLE_CKBTC_RECEIVE,
} from "$lib/stores/feature-flags.store";
import type { Universe } from "$lib/types/universe";
import { isUniverseCkBTC, pathSupportsCkBTC } from "$lib/utils/universe.utils";
import { derived, type Readable } from "svelte/store";
import {ckBTCUniversesStore} from "$lib/derived/ckbtc-universes.derived";

export const NNS_UNIVERSE: Universe = {
  canisterId: OWN_CANISTER_ID_TEXT,
};

const universesStore = derived<
  [
    Readable<SnsFullProject[] | undefined>,
    Readable<Universe[]>,
  ],
  Universe[]
>(
  [snsProjectsCommittedStore, ckBTCUniversesStore],
  ([projects, ckBTCUniverses]: [
    SnsFullProject[] | undefined,
      Universe[],
  ]) => [
    NNS_UNIVERSE,
    ...ckBTCUniverses,
    ...(projects?.map(({ rootCanisterId, summary }) => ({
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
