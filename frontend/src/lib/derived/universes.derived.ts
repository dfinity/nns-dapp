import { NNS_UNIVERSE } from "$lib/constants/universes.constants";
import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";
import {
  snsProjectsCommittedStore,
  type SnsFullProject,
} from "$lib/derived/sns/sns-projects.derived";
import type { Universe } from "$lib/types/universe";
import { derived, type Readable } from "svelte/store";

export const universesStore = derived<
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
